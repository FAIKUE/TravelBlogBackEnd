const express = require('express');
const assert = require('assert').strict;
const router = express.Router();
const dbConnectionString = 'mongodb+srv://weblab:weblab@cluster0.8q4oo.mongodb.net/traveblog?retryWrites=true&w=majority';
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json()

/* GET alls blogs. */
router.get('/', function(req, res, next) {
    const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(function(err) {
        if (err) {
            res.sendStatus(500);
            throw err;
        }

        let blogs = mongoClient.db("travelblog").collection('blogs');
        blogs.find().toArray((err, docs) => {
            assert.equal(err, null);
            res.status(200).json(docs);
            mongoClient.close();
        });
    });
});

/* POST create blog. */
router.post('/', jsonParser, function(req, res, next) {
    const blog = req.body;

    if (blog["title"] && blog["destination"] && blog["traveltime"] && blog["shortDescription"]) {
        const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        mongoClient.connect(function(err) {
            if (err) {
                res.sendStatus(500);
                throw err;
            }

            let blogs = mongoClient.db('travelblog').collection('blogs');
            blogs.insertOne(blog, function(err, result) {
                assert.equal(err, null);
                assert.equal(blog, result.ops[0], 'Blog from request has to equal to inserted blog in db.');
                console.log(`Inserted ${result} into blogs.`);
                mongoClient.close();
                res.sendStatus(201);
            });
        });
    } else {
        res.status(400).send("A blog has to consist of a title, destination, traveltime (in days) and shortDescription.");
    }
});

router.post('/:id/entries', jsonParser, function(req, res, next) {
    const entry = req.body;

    if (entry["title"] && entry["datetime"] && entry["text"]) {
        const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        mongoClient.connect(function(err) {
            if (err) {
                res.sendStatus(500);
                throw err;
            }

            mongoClient.db('travelblog').collection('blogs').updateOne({ _id: ObjectId(req.params.id) }, { $push: { entries: entry } }, function(err, result) {
                console.log(result);
                assert.equal(result.modifiedCount, 1, "Exactly the one blog addressed with the id should be changed.");
                mongoClient.close();
                res.sendStatus(201);
            });
        });
    } else {
        res.status(400).send("A blog entry has to consist of a title, datetime and text.");
    }
});

module.exports = router;
