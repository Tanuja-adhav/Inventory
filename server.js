require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: true, // only for Render testing
});

// Connect once and reuse
async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!');
    return client.db('inventoryDB'); // your default DB
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

// Root route
app.get('/', (req, res) => {
  res.send('✅ Inventory Backend is running!');
});

// Sample API: Get all products
app.get('/api/products', async (req, res) => {
  try {
    const db = await connectDB();
    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sample API: Add a product
app.post('/api/products', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection('products').insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sample API: Get wishlist
app.get('/api/wishlist', async (req, res) => {
  try {
    const db = await connectDB();
    const wishlist = await db.collection('wishlist').find().toArray();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
