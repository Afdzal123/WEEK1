const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db("mydatabase");
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}
connectToMongoDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// ========== RIDE REQUESTS ==========

// Passenger creates a ride request
app.post('/rides/request', async (req, res) => {
  try {
    const { passengerName, pickup, destination } = req.body;
    if (!passengerName || !pickup || !destination) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await db.collection('rides').insertOne({
      passengerName,
      pickup,
      destination,
      status: "pending",
      acceptedBy: null
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Failed to create ride request" });
  }
});

// Driver accepts a ride
app.patch('/rides/:id/accept', async (req, res) => {
  try {
    const rideId = req.params.id;
    const { driverName } = req.body;
    if (!driverName) {
      return res.status(400).json({ error: "Driver name is required" });
    }

    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(rideId), status: "pending" },
      { $set: { status: "accepted", acceptedBy: driverName } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Ride not found or already accepted" });
    }

    res.status(200).json({ message: "Ride accepted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to accept ride", details: err.message });
  }
});

// Get all rides
app.get('/rides', async (req, res) => {
  const rides = await db.collection('rides').find().toArray();
  res.status(200).json(rides);
});

// ========== USERS ENDPOINTS ==========

app.post('/users', async (req, res) => {
  try {
    const { name, contact, role, pickup, destination } = req.body;
    if (!name || !contact || !role || !pickup || !destination) {
      return res.status(400).json({ error: "Missing required user fields" });
    }

    const result = await db.collection('users').insertOne({
      name, contact, role, pickup, destination
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid user data", details: err.message });
  }
});

app.get('/users', async (req, res) => {
  const users = await db.collection('users').find().toArray();
  res.status(200).json(users);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
