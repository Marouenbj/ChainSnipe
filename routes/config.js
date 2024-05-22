const express = require('express');
const router = express.Router();
const BotConfig = require('../models/BotConfig'); // Adjust the path if necessary

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Unauthorized');
}

// Get user-specific configuration
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const config = await BotConfig.findOne({ userId: req.user._id });
    if (config) {
      res.json({ config: config.config });
    } else {
      res.json({ config: '' });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Save user-specific configuration
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    let config = await BotConfig.findOne({ userId: req.user._id });
    if (config) {
      config.config = req.body.config;
    } else {
      config = new BotConfig({ userId: req.user._id, config: req.body.config });
    }
    await config.save();
    res.send('Configuration saved');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
