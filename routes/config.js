const express = require('express');
const fs = require('fs');
const router = express.Router();
const configFilePath = './config.ini';

// Endpoint to get the current config
router.get('/', (req, res) => {
  fs.readFile(configFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading config file');
    }
    res.json({ config: data });
  });
});

// Endpoint to update the config
router.post('/', (req, res) => {
  const newConfig = req.body.config;
  fs.writeFile(configFilePath, newConfig, 'utf8', (err) => {
    if (err) {
      return res.status(500).send('Error writing config file');
    }
    res.send('Config updated successfully');
  });
});

module.exports = router;
