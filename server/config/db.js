/**
 * JanSamadhan – Database Connection
 * Connects to MongoDB Atlas or local MongoDB using Mongoose.
 */

const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.warn(
      '⚠️  MONGODB_URI is not set in environment variables. Database operations will fail until configured.'
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(
      '💡 Tip: Provide a valid MongoDB Atlas connection string in server/.env (MONGODB_URI=...)'
    );
    return false;
  }
};

const getDBStatus = () => ({
  isConnected,
  readyState: mongoose.connection.readyState,
});

module.exports = {
  connectDB,
  getDBStatus,
};
