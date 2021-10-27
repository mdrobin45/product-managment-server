const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


// Database information
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}`;
const client = new MongoClient(uri);


async function insertData()
{
    try {
        client.connect();
        const database = client.db('ProductManagement');
        const databaseCollection = database.collection('ProductList');


        // Root
        app.get('/', async (req, res) =>
        {
            res.send('This is the server root');
        });

        // POST API
        app.post('/api/products', async (req, res) =>
        {
            const newProduct = req.body;
            const saveToDB = await databaseCollection.insertOne(newProduct);
            res.send(saveToDB);
        });

        // GET API
        app.get('/api/products', async (req, res) =>
        {
            const cursor = databaseCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let makeArray;
            const count = await cursor.count();
            if (page) {
                makeArray = await cursor.skip(page * size).limit(size).toArray();
            } else {
                makeArray = await cursor.toArray();
            }
            res.send({
                count,
                makeArray
            });
        });

        // GET single product API
        app.get('/api/products/:id', async (req, res) =>
        {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const productInfo = await databaseCollection.findOne(query);
            res.send(productInfo);
        });

        // Delete product
        app.delete('/api/products/:id', async (req, res) =>
        {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleted = await databaseCollection.deleteOne(query);
            console.log(deleted);
            res.send(deleted);
        });

        // Update product
        app.put('/api/products/:id', async (req, res) =>
        {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedProduct = req.body;
            const updateInfo = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                    quantity: updatedProduct.quantity
                }
            };
            const updateDB = await databaseCollection.updateOne(filter, updateInfo);
            res.send(updateDB);

        });

        // App listen
        app.listen(port, () =>
        {
            console.log('Node server is running');
        });
    } finally {

    }
}
insertData();