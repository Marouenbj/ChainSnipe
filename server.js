const express = require('express');
const http = require('http'); // Ensure HTTP is used for WebSocket
const WebSocket = require('ws'); // WebSocket library
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const sessionMiddleware = require('./middlewares/session');
const passport = require('./config/passport');
const configRoutes = require('./routes/config');
const botRoutes = require('./routes/bot');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
const server = http.createServer(app); // Create HTTP server
const wss = new WebSocket.Server({ server }); // Create WebSocket server

let clients = [];

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.push(ws);

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Broadcast to all clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter((client) => client !== ws);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });
});

// Example routes for testing sessions
app.get('/set-session', (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.send(`Session views: ${req.session.views}`);
});

app.get('/get-session', (req, res) => {
  if (req.session.views) {
    res.send(`Session views: ${req.session.views}`);
  } else {
    res.send('No session data found');
  }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
