require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
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
  tlsAllowInvalidCertificates: true, // for Render only
});

let db;

// Connect once and reuse
async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      console.log('✅ Connected to MongoDB Atlas!');
      db = client.db('inventoryDB'); // default database
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
    }
  }
  return db;
}

// --- API ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const database = await connectDB();
    const products = await database.collection('products').find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('products').insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get wishlist
app.get('/api/wishlist', async (req, res) => {
  try {
    const database = await connectDB();
    const wishlist = await database.collection('wishlist').find().toArray();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to wishlist
app.post('/api/wishlist', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('wishlist').insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SERVE FRONTEND ---

// Serve static files from Vite build (dist folder)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all other routes (React router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`🚀 Backend + Frontend running on port ${port}`);
});
