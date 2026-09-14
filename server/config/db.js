const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    // If MONGODB_URI is provided and not localhost, use it directly (Atlas etc.)
    const uri = process.env.MONGODB_URI;
    const isLocalhost = !uri || uri.includes('localhost') || uri.includes('127.0.0.1');

    let connectionUri = uri;

    if (isLocalhost) {
      // Spin up in-process MongoDB — no external dependency needed for demo
      console.log('🔄 Starting in-memory MongoDB...');
      mongod = await MongoMemoryServer.create();
      connectionUri = mongod.getUri();
      console.log('✅ In-memory MongoDB ready');
    }

    const conn = await mongoose.connect(connectionUri);
    console.log(`✅ MongoDB connected: ${isLocalhost ? 'in-memory' : conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB notice (${error.message}) - server continuing in stateless demo mode`);
  }
};

// Cleanup on exit
process.on('SIGTERM', async () => { if (mongod) await mongod.stop(); });
process.on('SIGINT', async () => { if (mongod) await mongod.stop(); });

module.exports = connectDB;
