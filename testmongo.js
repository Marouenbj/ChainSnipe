const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://admin:0zeJULpHFMKmkmQ2@chainsnipe.xp3wetj.mongodb.net/test?retryWrites=true&w=majority&appName=ChainSnipe';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
