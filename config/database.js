const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://admin:0zeJULpHFMKmkmQ2@chainsnipe.xp3wetj.mongodb.net/test?retryWrites=true&w=majority&appName=ChainSnipe';
    mongoose.connect(mongoURI)
        .then(() => console.log('MongoDB connected'))
       
    }
  catch (err) {
    console.error('MongoDB connection error:', err);
}
};

module.exports = connectDB;
