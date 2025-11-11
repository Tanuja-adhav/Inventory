require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: ServerApiVersion.v1,
  strict: true,
  deprecationErrors: true,
});

let db;
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('inventoryDB');
    console.log('✅ Connected to MongoDB Atlas!');
  }
  return db;
}

// -------------------- AUTH ROUTES --------------------
app.post('/api/register', async (req, res) => {
  try {
    const database = await connectDB();
    const { username, email, password } = req.body;

    const existing = await database.collection('users').findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await database.collection('users').insertOne({
      username, email, password: hashed,
    });

    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    res.json({ token, userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const database = await connectDB();
    const { email, password } = req.body;

    const user = await database.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- PRODUCT & WISHLIST ROUTES --------------------
// Similar to your previous code
// app.get('/api/products', ...)
// app.post('/api/products', ...)
// app.get('/api/wishlist', ...)
// app.post('/api/wishlist', ...)

// -------------------- SERVE FRONTEND --------------------
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// -------------------- START SERVER --------------------
app.listen(port, () => {
  console.log(`🚀 Backend + Frontend running on port ${port}`);
});
