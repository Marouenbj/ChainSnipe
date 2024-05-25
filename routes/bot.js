const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
let botProcess;

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Unauthorized');
}

// Start the bot process
router.post('/start', ensureAuthenticated, (req, res) => {
  if (botProcess) {
    return res.status(400).send('Bot is already running');
  }

  botProcess = exec('node index.js');

  botProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    botProcess = null;
  });

  res.send('Bot started');
});

// Stop the bot process
router.post('/stop', ensureAuthenticated, (req, res) => {
  if (!botProcess) {
    return res.status(400).send('Bot is not running');
  }
  botProcess.kill();
  botProcess = null;
  res.send('Bot stopped');
});

module.exports = router;
