const express = require('express');
const passport = require('passport');
const path = require('path');

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
      return res.redirect('/login.html');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.log(`Error logging in user: ${err}`);
        return next(err);
      }
      console.log('User logged in successfully');
      return res.redirect('/dashboard.html');
    });
  })(req, res, next);
});

router.get('/dashboard.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

router.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login.html');
    });
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login.html');
}

module.exports = router;
