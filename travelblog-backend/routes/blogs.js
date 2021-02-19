const express = require('express');
const assert = require('assert').strict;
const router = express.Router();
const dbConnectionString = 'mongodb+srv://weblab:weblab@cluster0.8q4oo.mongodb.net/traveblog?retryWrites=true&w=majority';
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json()

/* GET alls blogs. */
router.get('/', function(req, res, next) {
  res.send("hello");
});

/* POST create blog. */
router.post('/', jsonParser, function(req, res, next) {
    const client = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect(function(err) {
        if (err) {
            throw err;
        }
        const blog = req.body;

        if (blog["title"] && blog["destination"] && blog["traveltime"] && blog["shortDescription"]) {
            let blogs = client.db("travelblog").collection('blogs');
            blogs.insertOne(blog, function(err, result) {
                assert.equal(blog, result);
                console.log(`Inserted ${result} into blogs.`);
                client.close();
            });
        }
    });
});

module.exports = router;
