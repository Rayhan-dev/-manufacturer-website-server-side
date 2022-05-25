const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
var cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.npcm6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const toolCollection = client.db("manufactureDB").collection("tools");
const ReviewCollection = client.db("manufactureDB").collection("reviews");
const ordersCollection = client.db("manufactureDB").collection("orders");
const usersCollection = client.db("manufactureDB").collection("users");

const varifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAnthorized Access" })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" })
    }
    req.decoded = decoded;
    next();
  })
}
async function run() {
  try {
    await client.connect();

    app.get('/tools', async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/tools/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(`${id}`) };
      const result = await toolCollection.findOne(query);
      res.send(result)
    })
    app.get('/reviews', async (req, res) => {
      const query = {};
      const cursor = ReviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    app.post('/orders', async (req, res) => {
      const doc = req.body.data;
      const result = await ordersCollection.insertOne(doc);
    })
    app.get('/orders/:email', varifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.params.email;
      if (decodedEmail == email) {
        const query = { email: email };
        const cursor = ordersCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
      }
      return res.status(403).send({ message: "Forbidden Access" })

    })
    app.delete('/orders/:id', async (req, res) => {
      const authorization = req.headers.authorization;
      const id = req.params.id
      const query = { _id: ObjectId(`${id}`) };
      const result = await ordersCollection.deleteOne(query);
    })
    app.put('/user/:email', async (req, res) => {

      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      var token = jwt.sign({ email: email }, process.env.JWT_TOKEN);
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send({ result, token })
    })
    app.get('/users', async (req, res) => {
      const user = await usersCollection.find().toArray();
      console.log(user);
      res.send(user);
    })
    app.put('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          role:'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result.date);
    })
  } finally {

  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})