const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionMiddleware = session({
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://<username>:<password>@<your-mongo-host>/<your-database>?retryWrites=true&w=majority' }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
});

module.exports = sessionMiddleware;
