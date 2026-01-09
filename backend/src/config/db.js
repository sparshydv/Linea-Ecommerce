const mongoose = require('mongoose');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    throw err;
  }
};

module.exports = connectDB;
