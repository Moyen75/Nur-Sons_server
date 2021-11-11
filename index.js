const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

// connect to database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aghhg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect()
        const database = client.db('nurAuto')
        const carsCollection = database.collection('cars')
        const ordersCollection = database.collection('orders')

        // load all cars
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        // add orders to db
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Hello assignment')
})

app.listen(port, () => {
    console.log('Listening at', port)
})