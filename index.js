const { MongoClient, ServerApiVersion } = require("mongodb");
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
    origin: ["http://localhost:5173"],
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

    app.get("/api/services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    //!jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: "72h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
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
