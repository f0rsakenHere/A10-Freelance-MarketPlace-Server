const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db = null;

async function connectDB() {
  try {
    if (db) {
      return db;
    }

    // await client.connect();
    db = client.db(process.env.DB_NAME || "freelanceMarketplace");

    // console.log("Connected to MongoDB");
    // await db.command({ ping: 1 });

    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    console.log("Database connection closed");
  }
}

module.exports = { connectDB, getDB, closeDB };
