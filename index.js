const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_KEY);

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
    const bookingCollection = client.db("TravelDB").collection("bookings");

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

    app.put("/users/:email", async(req, res) => {
      const info = req.body;
      const email = req.params.email;
      const filter = {email: email};
      const updatedDoc = {
        $set: {
          name: info.name,
          email: info.email,
          profileImage: info.profileImage,
          country: info.country
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    // Hotels APIs
    app.get("/hotels", async (req, res) => {
      const search = req.query.search;
      // const findReserveHotel = await bookingCollection.findOne({
      //   _id: new ObjectId(search.id),
      // });
      // const findReserveRoom = findReserveHotel.hotel_room.find((room) => room.id === search.room_id);
      // const findCheckIn = findReserveRoom?.checkIn;
      // const findCheckOut = findReserveRoom?.checkOut;
      // if (
      //   new Date(findCheckIn).getTime() < new Date(search.checkIn).getTime() ||
      //   new Date(findCheckIn).getTime() > new Date(search.checkIn).getTime()
      // ) {
      //     return res.send({message: "This Date is not Available right now"})
      // }
      let query;
      if (search) {
        query = {
          $or: [
            { hotel_name: { $regex: search, $options: "i" } },
            { hotel_location: { $regex: search, $options: "i" } },
          ],
        };
      }
      const result = await hotelCollection.find(query).toArray();
      res.send(result);
    });

    // Single API
    app.get("/hotels/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await hotelCollection.findOne(filter);
      res.send(result);
    });

    // Hotels Post API
    app.post("/bookings", async (req, res) => {
      const info = req.body;
      const result = await bookingCollection.insertOne(info);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      let filter
      if(email){
        filter = {email: email}
      }
      const result = await bookingCollection.find(filter).toArray();
      res.send(result);
    });

    // Payment Intent
    app.post("/payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
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
