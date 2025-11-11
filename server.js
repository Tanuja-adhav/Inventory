require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI; // must match .env key exactly

if (!uri) {
  throw new Error("MONGO_URI is undefined! Check your .env file");
}

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB Atlas!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
