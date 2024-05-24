const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const sessionMiddleware = require('./middlewares/session');
const passport = require('./config/passport');
const configRoutes = require('./routes/config');
const botRoutes = require('./routes/bot');
const authRoutes = require('./routes/auth');
const path = require('path'); // Import the path module

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(sessionMiddleware); // Apply session middleware before Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Middleware to log session details
app.use((req, res, next) => {
  console.log(`Session ID: ${req.sessionID}`);
  console.log(`Session: ${JSON.stringify(req.session)}`);
  next();
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Set up routes for API endpoints
app.use('/api/config', configRoutes);
app.use('/api/bot', botRoutes);
app.use('/auth', authRoutes);

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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
