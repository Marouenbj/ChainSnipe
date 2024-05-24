const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const sessionMiddleware = require('./middlewares/session');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(sessionMiddleware);

// Middleware to log session details
app.use((req, res, next) => {
  console.log(`Session ID: ${req.sessionID}`);
  console.log(`Session: ${JSON.stringify(req.session)}`);
  next();
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
