const express = require('express');

const router = express.Router();

router.get('/set-session', (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.send(`Session views: ${req.session.views}`);
});

router.get('/get-session', (req, res) => {
  if (req.session.views) {
    res.send(`Session views: ${req.session.views}`);
  } else {
    res.send('No session data found');
  }
});

module.exports = router;
