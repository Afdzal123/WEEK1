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
    console.log("✅ Connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectToMongoDB();

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Ride-Hailing API is running!');
});

// ========================== USERS ==========================

// Create a user
app.post('/users', async (req, res) => {
  try {
    const { name, contact, role } = req.body;
    if (!name || !contact || !role) {
      return res.status(400).json({ error: "Missing required user fields" });
    }

    const result = await db.collection('users').insertOne({
      name,
      contact,
      role,
      isBlocked: false,
      createdAt: new Date()
    });

    res.status(201).json({ message: "User created", id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid user data", details: err.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ========================== RIDES ==========================

// Passenger requests a ride
app.post('/rides/request', async (req, res) => {
  try {
    const { passengerId, pickup, destination } = req.body;
    if (!passengerId || !pickup || !destination) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const passenger = await db.collection('users').findOne({ _id: new ObjectId(passengerId), role: "passenger" });
    if (!passenger) return res.status(404).json({ error: "Passenger not found" });

    const result = await db.collection('rides').insertOne({
      passengerId: new ObjectId(passengerId),
      pickup,
      destination,
      status: "pending",
      acceptedBy: null,
      createdAt: new Date()
    });

    res.status(201).json({ message: "Ride requested", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to request ride", details: err.message });
  }
});

// Driver accepts a ride
app.patch('/rides/:id/accept', async (req, res) => {
  try {
    const rideId = req.params.id;
    const { driverId } = req.body;

    if (!driverId) return res.status(400).json({ error: "Driver ID is required" });

    const driver = await db.collection('users').findOne({ _id: new ObjectId(driverId), role: "driver" });
    if (!driver) return res.status(404).json({ error: "Driver not found" });

    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(rideId), status: "pending" },
      {
        $set: {
          status: "accepted",
          acceptedBy: new ObjectId(driverId),
          acceptedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Ride not found or already accepted" });
    }

    res.status(200).json({ message: "Ride accepted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to accept ride", details: err.message });
  }
});

// Complete a ride
app.patch('/rides/:id/complete', async (req, res) => {
  try {
    const rideId = req.params.id;

    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(rideId), status: "accepted" },
      {
        $set: {
          status: "completed",
          completedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Ride not found or not in accepted state" });
    }

    res.status(200).json({ message: "Ride marked as completed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete ride", details: err.message });
  }
});

// Get all rides (with passengerName and driverName)
app.get('/rides', async (req, res) => {
  try {
    const rides = await db.collection('rides').aggregate([
      {
        $lookup: {
          from: "users",
          localField: "passengerId",
          foreignField: "_id",
          as: "passenger"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "acceptedBy",
          foreignField: "_id",
          as: "driver"
        }
      },
      {
        $addFields: {
          passengerName: { $arrayElemAt: ["$passenger.name", 0] },
          driverName: { $arrayElemAt: ["$driver.name", 0] }
        }
      },
      {
        $project: {
          passenger: 0,
          driver: 0
        }
      }
    ]).toArray();

    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rides", details: err.message });
  }
});

// ========================== SERVER START ==========================

app.listen(port, () => {
  console.log(`🚗 Server is running at http://localhost:${port}`);
});
