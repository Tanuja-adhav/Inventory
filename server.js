// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI; // From .env
if (!uri) throw new Error("MONGO_URI is undefined! Check your .env file");

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  tls: true,
  tlsAllowInvalidCertificates: false,
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB Atlas!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectDB();

// Example route
app.get('/products', async (req, res) => {
  try {
    const db = client.db("inventory"); // Replace with your DB name
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
