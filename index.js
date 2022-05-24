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
    app.get('/orders/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(`${id}`) };
      const result = await ordersCollection.deleteOne(query);
    })
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      console.log(user)
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
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