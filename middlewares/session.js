const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionMiddleware = session({
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@chainsnipe.xp3wetj.mongodb.net/test?retryWrites=true&w=majority' }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
});

module.exports = sessionMiddleware;
