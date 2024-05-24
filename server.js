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
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {};

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Middleware to log session details
app.use((req, res, next) => {
  console.log(`Session ID: ${req.sessionID}`);
  console.log(`Session: ${JSON.stringify(req.session)}`);
  next();
});

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

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  // Extract user ID from session
  const cookies = cookieParser.signedCookies(req.headers.cookie, 'secret'); // Adjust 'secret' as needed
  const sessionId = cookies['connect.sid'];
  sessionMiddleware(req, {}, async () => {
    try {
      const user = await new Promise((resolve, reject) => {
        passport.deserializeUser(sessionId, (err, user) => {
          if (err || !user) {
            return reject(err || 'User not found');
          }
          resolve(user);
        });
      });

      const userId = user._id.toString();
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
  console.log(`Server is running on port ${PORT}`);
});
