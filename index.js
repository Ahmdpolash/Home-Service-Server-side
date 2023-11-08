const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");

const port = process.env.PORT || 5000;
require("dotenv").config();

//!middleware ::
app.use(
  cors({
    origin: [
      "https://assignment-11-b297b.web.app",
      "https://assignment-11-b297b.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//!verify

const verify = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yrssrk8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const serviceCollection = client.db("houseService").collection("services");
    const bookingCollection = client.db("houseService").collection("bookings");

    //!get all service
    app.get("/api/services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    //!post to collection (add service)

    app.post("/api/services", async (req, res) => {
      const services = req.body;
      const result = await serviceCollection.insertOne(services);
      res.send(result);
    });

    //!bookings (email)

    app.post("/api/bookings", async (req, res) => {
      const bookings = req.body;
      console.log(bookings);
      const result = await bookingCollection.insertOne(bookings);
      res.send(result);
    });

    app.get("/api/bookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    //!myservice

    app.get("/api/services/:yourEmail", async (req, res) => {
      console.log(req.query.email);

      const yourEmail = req.params.yourEmail;

      const result = await serviceCollection.find({ yourEmail }).toArray();
      res.send(result);
    });

    //!{email}

    app.get("/api/bookings/:userEmail", async (req, res) => {
      console.log(req.query.email);

      const userEmail = req.params.userEmail;

      const result = await bookingCollection.find({ userEmail }).toArray();
      res.send(result);
    });

    app.get("/api/pending/:userEmail", async (req, res) => {
      console.log(req.query.email);

      const providerEmail = req.params.userEmail;

      const result = await bookingCollection.find({ providerEmail }).toArray();
      res.send(result);
    });

    //!delete
    app.delete("/api/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    //!update
    app.put("/api/services/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateService = {
        $set: {
          service_name: data.service_name,
          service_image: data.service_image,
          description: data.description,
          price: data.price,
        },
      };
      const result = await serviceCollection.updateOne(
        filter,
        updateService,
        options
      );

      res.send(result);
    });

    // app.put("/api/pending/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const data = req.body;
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };

    //   if (data?.status) {
    //     const updateService = {
    //       $set: {
    //         serviceName: data.serviceName,
    //         userEmail: data.service_image,
    //         providerEmail: data.providerEmail,
    //         status: data.status,
    //       },
    //     };

    //     const result = await serviceCollection.updateOne(
    //       filter,
    //       updateService,
    //       options
    //     );

    //     res.send(result);
    //   } else {
    //     res.send({});
    //   }
    // });

    //!jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: "72h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Set to true in production
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ message: true });
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("assignment project running");
});

app.listen(port, () => {
  console.log(`assignment project running on port : ${port}`);
});
