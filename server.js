const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const WebSocket = require('ws');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path if necessary

const app = express();

// Replace with your actual MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://admin:0zeJULpHFMKmkmQ2@chainsnipe.xp3wetj.mongodb.net/?retryWrites=true&w=majority&appName=ChainSnipe';

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Passport.js configuration
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    if (user.password !== password) return done(null, false, { message: 'Incorrect password.' });
    return done(null, user);
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Set up routes for API endpoints
const configRoutes = require('./routes/config');
const botRoutes = require('./routes/bot');
app.use('/api/config', configRoutes);
app.use('/api/bot', botRoutes);

// Authentication Routes
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login'
}));

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send('Welcome to your dashboard!');
});

app.get('/login', (req, res) => {
  res.send('Login page');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Start the server on port 3000
const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set up WebSocket server
let botProcess;
let wsServer;
let wsClients = [];

wsServer = new WebSocket.Server({ server });

wsServer.on('connection', (ws) => {
  wsClients.push(ws);
  console.log('New WebSocket connection established.');

  ws.on('close', () => {
    wsClients = wsClients.filter((client) => client !== ws);
    console.log('WebSocket connection closed.');
  });
});

function broadcast(message) {
  const formattedMessage = message + '\n'; // Ensure newline after each log entry
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(formattedMessage);
    }
  });
}

// Override console.log and console.error to capture output
const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
  const message = args.join(' ');
  broadcast(message);
  originalLog.apply(console, args);
};

console.error = function (...args) {
  const message = args.join(' ');
  broadcast(`ERROR: ${message}`);
  originalError.apply(console, args);
};

// Function to start the original bot process and capture its output
function startBot() {
  if (botProcess) return;

  botProcess = exec('node index.js');

  botProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    botProcess = null;
  });
}

// Bot control routes
app.post('/api/bot/start', ensureAuthenticated, (req, res) => {
  if (botProcess) {
    return res.status(400).send('Bot is already running');
  }
  startBot();
  res.send('Bot started');
});

app.post('/api/bot/stop', ensureAuthenticated, (req, res) => {
  if (!botProcess) {
    return res.status(400).send('Bot is not running');
  }
  botProcess.kill();
  botProcess = null;
  res.send('Bot stopped');
});
