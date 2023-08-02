const mongoose = require('mongoose');
require('dotenv').config();

const urlMongoDB = process.env.URL_MONGODB;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(urlMongoDB, { socketTimeoutMS: 5000 });
    console.log('Connected to MongoDB Successfully');
  } catch (error) {
    console.log('Connect to MongoDB failed');
  }
};

module.exports = connectMongoDB;
