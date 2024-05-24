const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const configRoutes = require('./routes/config');
const botRoutes = require('./routes/bot');
const authRoutes = require('./routes/auth');
const connectDB = require('./config/database');
const sessionMiddleware = require('./middlewares/session');
const passport = require('./config/passport');

const app = express();
let botProcess;

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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root to login page if not authenticated
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  } else {
    res.redirect('/auth/login.html');
  }
});

// Set up routes for API endpoints
app.use('/api/config', configRoutes);
app.use('/api/bot', botRoutes);
app.use('/auth', authRoutes);

// Function to start the original bot process and capture its output
function startBot() {
  if (botProcess) return;

  console.log('Starting bot process...');
  
  botProcess = exec('node index.js', { cwd: __dirname });

  botProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  botProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  botProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    botProcess = null;
  });
}

// Bot control routes
app.post('/api/bot/start', (req, res) => {
  if (botProcess) {
    return res.status(400).send('Bot is already running');
  }
  startBot();
  res.send('Bot started');
});

app.post('/api/bot/stop', (req, res) => {
  if (!botProcess) {
    return res.status(400).send('Bot is not running');
  }
  botProcess.kill();
  botProcess = null;
  res.send('Bot stopped');
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
