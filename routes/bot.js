const express = require('express');
const { exec } = require('child_process');
const router = express.Router();
let botProcess;

// Endpoint to start the bot
router.post('/start', (req, res) => {
  if (botProcess) {
    return res.status(400).send('Bot is already running');
  }
  botProcess = exec('node index.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Bot started');
});

// Endpoint to stop the bot
router.post('/stop', (req, res) => {
  if (!botProcess) {
    return res.status(400).send('Bot is not running');
  }
  botProcess.kill();
  botProcess = null;
  res.send('Bot stopped');
});

module.exports = router;
