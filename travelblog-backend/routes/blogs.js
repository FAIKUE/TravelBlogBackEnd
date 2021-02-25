const express = require('express');
const assert = require('assert').strict;
const router = express.Router();
const dbConnectionString = 'mongodb+srv://weblab:weblab@cluster0.8q4oo.mongodb.net/traveblog?retryWrites=true&w=majority';
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json()

/* GET alls blogs. */
router.get('/', function(req, res, next) {
    const client = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(function(err) {
        if (err) {
            res.sendStatus(500);
            throw err;
        }

        let blogs = client.db("travelblog").collection('blogs');
        blogs.find().toArray((err, docs) => {
            assert.equal(null, err);
            res.status(200).json(docs);
            client.close();
        });
    });
});

/* POST create blog. */
router.post('/', jsonParser, function(req, res, next) {
    const client = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(function(err) {
        if (err) {
            res.sendStatus(500);
            throw err;
        }
        const blog = req.body;

        if (blog["title"] && blog["destination"] && blog["traveltime"] && blog["shortDescription"]) {
            let blogs = client.db("travelblog").collection('blogs');
            blogs.insertOne(blog, function(err, result) {
                assert.equal(blog, result.ops[0], 'Blog from request has to equal to inserted blog in db.');
                console.log(`Inserted ${result} into blogs.`);
                client.close();
                res.sendStatus(201);
            });
        }
    });
});

module.exports = router;
