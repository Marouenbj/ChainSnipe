const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Adjust the path as necessary

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      console.log(`Attempting to authenticate user: ${username}`);
      const user = await User.findOne({ username });
      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        console.log('Incorrect password');
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log('User authenticated successfully');
      return done(null, user);
    } catch (err) {
      console.log(`Authentication error: ${err}`);
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log(`Serializing user: ${user._id}`);
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log(`Deserializing user: ${id}`);
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
