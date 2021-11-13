const express = require('express')
const app = express()
const ObjectId = require('mongodb').ObjectId
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
        const reviewsCollection = database.collection('reviews')
        const usersCollection = database.collection('users')

        // load all cars
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        // delete specific car
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await carsCollection.deleteOne(filter)
            res.json(result)
        })

        //   update car info
        app.put('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const updatedInfo = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDocs = { $set: updatedInfo }
            const result = await carsCollection.updateOne(filter, updateDocs)
            res.json(result)
        })


        // add a new car to db

        app.post('/cars', async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car)
            res.json(result)
        })

        // add orders to db
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })
        // load all orders
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        // load specific user orders
        app.get('/order', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray()
            res.json(result)
        })


        // modify pending status
        app.put('/orders', async (req, res) => {
            const data = req.body;
            const id = req.body.id
            const type = req.body.type;
            const filter = { _id: ObjectId(id) }
            const updateDocs = { $set: { status: type } }
            const result = await ordersCollection.updateOne(filter, updateDocs)
            res.json(result)
            console.log('confirmation data', result)
        })

        // delete specific order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
            console.log(result)
        })

        // post reviews data to db
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)
            res.json(result)
        })

        // load all review from db
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        // post all user by email and user name to db
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.json(result)
            console.log(result)
        })

        // post all user by google sign in to db
        app.put('/users', async (req, res) => {
            const email = req.body.email
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true };
            const updateDocs = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDocs, options)
            res.json(result)
        })

        // make admin
        app.put('/users/admin', async (req, res) => {
            console.log('admin hitted')
            const email = req.body.email;
            const filter = { email: email }
            const updateDocs = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDocs)
            res.json(result)
            console.log(result)
        })
        // load all users
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({})
            const users = await cursor.toArray()
            res.json(users)
        })

        // load admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            let isAdmin = false
            if (result?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
            console.log(isAdmin)
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