const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyhg6t2.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const userCollection = client.db("TravelDB").collection("users");
    const hotelCollection = client.db("TravelDB").collection("hotels");

    // User related API
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      let user;
      if (email) {
        user = { email: email };
      }
      const result = await userCollection.find(user).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const findMail = await userCollection.findOne(filter);
      if (findMail) {
        return res.send({ message: "email already exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Hotels APIs
    app.get("/hotels", async (req, res) => {
      const search = req.query.search;
      let query;
      if (search) {
        query = {
          $or: [
            { hotel_name: { $regex: search, $options: "i" } },
            { hotel_location: { $regex: search, $options: "i" } }
          ],
        };
      }
      const result = await hotelCollection.find(query).toArray();
      res.send(result);
    });

    // Single API
    app.get("/hotels/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const result = await hotelCollection.findOne(filter);
      res.send(result);
    });
    


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("travel is running");
});

app.listen(port, () => {
  console.log(`travel is running on port ${port}`);
});
