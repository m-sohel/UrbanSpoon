const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urbanspoon');
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    console.warn(`[MongoDB] Note: Please ensure MongoDB is running or provide a valid MONGO_URI in server/.env`);
  }
};

module.exports = connectDB;
