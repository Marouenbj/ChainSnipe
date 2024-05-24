const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionMiddleware = session({
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://admin:0zeJULpHFMKmkmQ2@chainsnipe.xp3wetj.mongodb.net/test?retryWrites=true&w=majority&appName=ChainSnipe' }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
});

module.exports = sessionMiddleware;
