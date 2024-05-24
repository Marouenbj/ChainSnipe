const express = require('express');
const passport = require('passport');

const router = express.Router();

router.post('/login', (req, res, next) => {
  console.log('Received login request');
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log(`Error during authentication: ${err}`);
      return next(err);
    }
    if (!user) {
      console.log('Authentication failed: User not found or incorrect password');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.log(`Error logging in user: ${err}`);
        return next(err);
      }
      console.log('User logged in successfully');
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send('Welcome to your dashboard!');
});

router.get('/login', (req, res) => {
  res.send('Login page');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
