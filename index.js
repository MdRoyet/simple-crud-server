const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dns = require("dns");

// DNS Fixes
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://simpleCRUDuser:AblGEows18FdH64r@cluster0.b83kszp.mongodb.net/?appName=Cluster0`;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ✅ DEFINE THE DATABASE AND COLLECTION GLOBALLY HERE
const db = client.db("simpleCRUD");
const usersCollection = db.collection("users");

// MongoDB Connection Function
const run = async () => {
  try {
    // Connect the client to the server
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "✅ Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};
run().catch(console.dir);

// ==========================================
//                 ROUTES
// ==========================================

// Root route
app.get("/", (req, res) => {
  res.send("Simple CRUD server is running");
});

// GET all users
app.get("/users", async (req, res) => {
  try {
    const cursor = usersCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

// GET a single user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const user = await usersCollection.findOne(query);

    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).send({ error: "Invalid ID format or server error" });
  }
});

/// Delete Single Item by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    // We call it 'result' because it's a status object, not the 'user' data
    const result = await usersCollection.deleteOne(query);

    // Check if exactly 1 document was deleted
    if (result.deletedCount === 1) {
      res.send(result);
    } else {
      // This triggers if the ID was valid but didn't exist in the DB
      res.status(404).send({ message: "No user found with that ID" });
    }
  } catch (error) {
    // This triggers if the ID string is not a valid 24-character hex string
    res.status(500).send({ error: "Invalid ID format or server error" });
  }
});

/// New Data Insert

app.post("/users", async (req, res) => {
  const newUser = req.body;
  const result = await usersCollection.insertOne(newUser);
  res.status(201).send(result);
});

// ==========================================
//              START SERVER
// ==========================================
app.listen(port, () => {
  console.log(`🚀 Example app listening on port ${port}`);
});
