// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

// --- Middleware ---
app.use(cors({ origin: '*' })); // allow frontend requests from anywhere
app.use(express.json());

// --- MongoDB connection ---
const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is undefined! Check your .env file");

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
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

// --- API routes ---

// Get all products
app.get('/products', async (req, res) => {
  try {
    const db = client.db("inventory");
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get wishlist
app.get('/wishlist', async (req, res) => {
  try {
    const db = client.db("inventory");
    const wishlist = await db.collection("wishlist").find().toArray();
    res.json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from wishlist
app.delete('/wishlist/remove/:id', async (req, res) => {
  try {
    const db = client.db("inventory");
    const id = req.params.id;
    await db.collection("wishlist").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Serve React frontend ---
// Path to the dist folder inside backend
const frontendPath = path.join(__dirname, 'dist');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend & Frontend running on port ${PORT}`));
