const mongoose = require('mongoose');

async function connectDB() {
  const uris = [process.env.MONGODB_URI_2, process.env.MONGODB_URI]
    .filter(Boolean)
    .filter(uri => 
      !uri.includes('your_') && 
      !uri.includes('placeholder') && 
      !uri.includes('<username>') &&
      !uri.includes('<password>')
    );

  if (uris.length === 0) {
    console.log('ℹ️ Running in In-Memory / File-based Transit Knowledgebase mode (no external MongoDB needed)');
    return;
  }

  for (const uri of uris) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 1500 });
      console.log(`✅ MongoDB connected: ${uri.includes('mongodb+srv') ? 'Atlas' : 'Local'}`);
      return;
    } catch (err) {
      console.warn(`⚠️ MongoDB connection skipped for ${uri}: ${err.message}`);
    }
  }

  console.log('ℹ️ Operating in Zero-Config In-Memory mode');
}

module.exports = { connectDB };
