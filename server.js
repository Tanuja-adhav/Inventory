require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

app.use(express.json());

// Example API route
app.get('/api/test', async (req, res) => {
  try {
    await client.connect();
    const result = await client.db("admin").command({ ping: 1 });
    res.json({ message: 'MongoDB is connected!', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
