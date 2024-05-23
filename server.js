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
const mongoURI = 'mongodb+srv://admin:0zeJULpHFMKmkmQ2@chainsnipe.xp3wetj.mongodb.net/test?retryWrites=true&w=majority&appName=ChainSnipe';





mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Passport.js configuration
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    console.log(`Authenticating user: ${username}`);
    const user = await User.findOne({ username: username });
    console.log(`User found: ${user}`); // Log the user object
    if (!user) {
      console.log('User not found');
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (user.password !== password) {
      console.log('Incorrect password');
      return done(null, false, { message: 'Incorrect password.' });
    }
    console.log('User authenticated successfully');
    return done(null, user); // Ensure the user object is passed correctly
  } catch (err) {
    console.log(`Authentication error: ${err}`);
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  console.log(`Serializing user: ${user}`); // Log the user object being serialized
  done(null, user._id); // Ensure the user._id field is passed
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log(`Deserializing user: ${id}`);
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Debugging Middleware
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  console.log(`Request Method: ${req.method}`);
  console.log(`Session: ${JSON.stringify(req.session)}`);
  console.log(`User: ${JSON.stringify(req.user)}`);
  next();
});

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

