const { MongoClient } = require('mongodb');

let db = null;

async function connectToDatabase() {
  try {
    const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('mydatabase');
    db = database;
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
}

module.exports = {
  connectToDatabase,
  getDatabase
};
