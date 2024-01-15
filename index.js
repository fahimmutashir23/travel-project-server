const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_KEY);
const nodemailer = require("nodemailer");

const port = process.env.PORT || 5000;



app.use(express.json());
app.use(cors());


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASS,
  },
});


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
    const packageCollection = client.db("TravelDB").collection("packages");

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

    app.put("/users/:email", async (req, res) => {
      const info = req.body;
      const email = req.params.email;
      const filter = { email: email };
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

    // Add Hotel API
    app.post("/hotels", async (req, res) => {
      const info = req.body;
      const result = await hotelCollection.insertOne(info);
      res.send(result);
    });

    app.patch("/rooms/:id", async (req, res) => {
      const info = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $push: {
          hotel_room: info
        }
      }
      const result = await hotelCollection.updateOne(filter, updatedDoc);
      res.send(result)
    })

    app.delete("/hotels/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await hotelCollection.deleteOne(query);
      res.send(result);
    })


    // Bookings Post API
    app.post("/bookings", async (req, res) => {
      const info = req.body.reserveInfoExtend;
      const messageInfo = req.body.emailInfo;
      const result = await bookingCollection.insertOne(info);
      res.send(result);

      const emailFormat = await transporter.sendMail({
        from: '<mdfahim.muntashir28@gmail.com>',
        to: info.email,
        subject: messageInfo.subject,
        text: messageInfo.message,
      });

      transporter.sendMail(emailFormat, (error, info) => {
        if (error) {
          res.send(error);
        }
      })

    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      let filter
      if (email) {
        filter = { email: email }
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

    // Package API
    app.post("/packages", async (req, res) => {
      const data = req.body;
      const result = await packageCollection.insertOne(data);
      res.send(result);
    })

    app.get("/packages", async (req, res) => {
      const limit = parseInt(req.query.limit);
      const result = await packageCollection.find().limit(limit).toArray();
      res.send(result);
    })

    app.delete('/packages/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await packageCollection.deleteOne(query);
      res.send(result)
    })

    app.patch('/packages/:id', async (req, res) => {
      const id = req.params.id;
      const discount = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          discount: discount.discountRate
        }
      }
      const result = await packageCollection.updateOne(filter, updatedDoc);
      res.send(result)
    })
    app.get("/stats", async (req, res) => {
      try {
         const users= await userCollection.estimatedDocumentCount()
         const totalPackages=  await packageCollection.estimatedDocumentCount()
         const totalBookings=  await bookingCollection.estimatedDocumentCount()
         const result=  await bookingCollection.aggregate([
          {
            $group:{
              _id:null,
              totalRevenue:{
                $sum:'$roomPrice'
              }
            }
          }
         ]).toArray()
         revenue= result.length> 0 ? result[0].totalRevenue: 0;
         res.send({users, totalPackages, totalBookings, revenue})
      }
      catch (err) {
        console.log(err);
      }
    })


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
