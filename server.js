const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const sessionMiddleware = require('./middlewares/session');
const sessionRoutes = require('./routes/sessions');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(sessionMiddleware);

// Routes
app.use('/', sessionRoutes);

// Middleware to log session details
app.use((req, res, next) => {
  console.log(`Session ID: ${req.sessionID}`);
  console.log(`Session: ${JSON.stringify(req.session)}`);
  next();
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
