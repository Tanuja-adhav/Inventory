require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// -------------------- MIDDLEWARE --------------------
app.use(cors({
  origin: true, // or set your frontend URL
  credentials: true,
}));
app.use(express.json());

// -------------------- MONGODB SETUP --------------------
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1, // ✅ fixed: remove strict & deprecationErrors
  },
  tls: true, // optional for Atlas
});

let db;
async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      console.log('✅ Connected to MongoDB Atlas!');
      db = client.db('inventoryDB'); // your DB name
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
    }
  }
  return db;
}

// -------------------- AUTH ROUTES --------------------

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const database = await connectDB();
    const { username, email, password } = req.body;

    const existing = await database.collection('users').findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await database.collection('users').insertOne({
      username,
      email,
      password: hashed
    });

    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const database = await connectDB();
    const { email, password } = req.body;

    const user = await database.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- PRODUCTS & WISHLIST --------------------

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

// Add product
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

// Add to wishlist
app.post('/api/wishlist', async (req, res) => {
  try {
    const database = await connectDB();
    const result = await database.collection('wishlist').insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- SERVE FRONTEND --------------------

// Serve Vite build folder (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// For all other routes, serve index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// -------------------- START SERVER --------------------
app.listen(port, () => {
  console.log(`🚀 Backend + Frontend running on port ${port}`);
});
