const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://admin:0zeJULpHFMKmkmQ2@chainsnipe.xp3wetj.mongodb.net/test?retryWrites=true&w=majority&appName=ChainSnipe';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {});
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  } finally {
    mongoose.connection.close();
  }
};

connectDB();

