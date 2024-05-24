const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const sessionMiddleware = require('./middlewares/session');
const passport = require('./config/passport');
const configRoutes = require('./routes/config');
const botRoutes = require('./routes/bot');
const authRoutes = require('./routes/auth');
const path = require('path');
const cookie = require('cookie');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {};

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('cookie-parser')());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

const sessionCache = new Map();

function cacheSessionInfo(req, res, next) {
  if (req.session && req.session.passport && req.session.passport.user) {
    const sessionId = req.sessionID;
    const userId = req.session.passport.user;

    // Cache session and user ID
    sessionCache.set(sessionId, userId);
  }
  next();
}

// Middleware to log session details and cache session info
app.use((req, res, next) => {
  console.log('Checking session for request to', req.url);
  console.log(`Session ID: ${req.sessionID}`);
  console.log(`Session: ${JSON.stringify(req.session)}`);
  next();
}, cacheSessionInfo);

// Redirect root to login page if not authenticated
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  } else {
    res.redirect('/auth/login.html');
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes for API endpoints
app.use('/api/config', configRoutes);
app.use('/api/bot', botRoutes);
app.use('/auth', authRoutes);

// Enhanced logging for request handling
app.get('/api/config', (req, res) => {
  console.log('Handling /api/config request');
  const config = getConfig();
  console.log('Fetched config:', config);
  res.json({ config });
});

// Extract user ID from the WebSocket upgrade request
function getUserIdFromRequest(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  console.log('Extracted cookies:', cookies);
  const sessionId = cookies['connect.sid'] && cookies['connect.sid'].split('.')[0].substring(2);
  console.log('Extracted session ID:', sessionId);

  // Reuse the cached session information
  const userId = sessionCache.get(sessionId);
  if (userId) {
    console.log('Reusing cached user ID:', userId);
    return Promise.resolve(userId);
  } else {
    return Promise.reject('Session not found in cache');
  }
}

// WebSocket connection handling
wss.on('connection', async (ws, req) => {
  try {
    console.log('Handling WebSocket connection');
    const userId = await getUserIdFromRequest(req);
    if (!clients[userId]) {
      clients[userId] = [];
    }
    clients[userId].push(ws);

    console.log(`New client connected: ${userId}`);

    ws.on('message', (message) => {
      console.log(`Received message from ${userId}: ${message}`);
      // Broadcast to all clients associated with the user
      clients[userId].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log(`Client disconnected: ${userId}`);
      clients[userId] = clients[userId].filter((client) => client !== ws);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${userId}: ${error.message}`);
    });
  } catch (err) {
    console.error(`WebSocket connection failed: ${err}`);
    ws.close();
  }
});

// Function to broadcast a message to all WebSocket clients associated with a user
function broadcastMessage(userId, message) {
  if (clients[userId]) {
    clients[userId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

// Redirect console.log to WebSocket clients with filtering
const originalLog = console.log;
console.log = function(message) {
  originalLog.apply(console, arguments);
  if (typeof message === 'string' && message.startsWith('[2024')) {
    for (let userId in clients) {
      clients[userId].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    }
  }
};

// Example routes for testing sessions
app.get('/set-session', (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  const userId = req.session.passport.user;
  broadcastMessage(userId, `Session views: ${req.session.views}`);
  res.send(`Session views: ${req.session.views}`);
});

app.get('/get-session', (req, res) => {
  const userId = req.session.passport.user;
  if (req.session.views) {
    broadcastMessage(userId, `Session views: ${req.session.views}`);
    res.send(`Session views: ${req.session.views}`);
  } else {
    broadcastMessage(userId, 'No session data found');
    res.send('No session data found');
  }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[bot] Server is running on port ${PORT}`);
});
