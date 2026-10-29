import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @param {string} uri - Optional MongoDB URI (defaults to process.env.MONGODB_URI)
 */
export const connectDB = async (uri = process.env.MONGODB_URI) => {
  try {
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Quick timeout to fail gracefully with helpful guidance
    });

    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}, Database -> ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('\n======================================================');
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('------------------------------------------------------');
    console.error('If running locally, ensure MongoDB Community Server is started:');
    console.error('  - Windows Service: net start MongoDB');
    console.error('  - Manual mongod:   mongod --dbpath <data-folder>');
    console.error('Or provide a free MongoDB Atlas connection string in server/.env:');
    console.error('  MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/auth_lab_db');
    console.error('======================================================\n');
    
    // In test environment or production, rethrow
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
  }
};

/**
 * Disconnect from MongoDB database (for cleanup and testing)
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoDB Disconnected]');
  }
};
