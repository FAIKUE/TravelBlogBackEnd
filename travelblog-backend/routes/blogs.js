const express = require('express');
const assert = require('assert').strict;
const router = express.Router();
const dbConnectionString = 'mongodb+srv://weblab:weblab@cluster0.8q4oo.mongodb.net/traveblog?retryWrites=true&w=majority';
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId
const bodyParser = require('body-parser');
const jwtAuthentication = require('../jwt-authentication');

const jsonParser = bodyParser.json()

/* GET all blogs. */
router.get('/', function(req, res, next) {
    const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(function(err) {
        if (err) {
            res.status(500).json(err);
            console.error(err);
        }

        let blogs = mongoClient.db("travelblog").collection('blogs');
        blogs.find().toArray((err, docs) => {
            assert.equal(err, null);
            if (err) {
                res.status(500).json({ error: err, result: docs });
            } else {
                res.status(200).json(docs);
            }
            mongoClient.close();
        });
    });
});

/* GET blog. */
router.get('/:id', function(req, res, next) {
    const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(function(err) {
        if (err) {
            res.sendStatus(500);
            console.error(err);
        }

        let id;
        try {
            id = ObjectId(req.params.id)
        } catch {
            res.status(404).send("Id was invalid.");
        }

        mongoClient.db('travelblog').collection('blogs').findOne({ _id: id }, function(err, result) {
            if (err) {
                res.sendStatus(500);
                console.error(err);
            } else {
                res.status(200).json(result);
            }
            mongoClient.close();
        });
    });
});

/* POST create blog. */
router.post('/', jsonParser, function(req, res, next) {
    jwtAuthentication.authenticateJWT(req, res, function() {
        const blog = req.body;

        if (blog["title"] && blog["destination"] && blog["traveltime"] && blog["shortDescription"]) {
            const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            mongoClient.connect(function(err) {
                if (err) {
                    res.status(500).json(err);
                    console.error(err);
                }
    
                let blogs = mongoClient.db('travelblog').collection('blogs');
                blogs.insertOne(blog, function(err, result) {
                    if (err) {
                        res.status(500).json({ error: err, result: result });
                    } else {
                        console.log(`Inserted ${result} into blogs.`);
                        res.status(201).json(result.ops[0]);
                    }
                    mongoClient.close();
                });
            });
        } else {
            res.status(400).send("A blog has to consist of a title, destination, traveltime (in days) and shortDescription.");
        }
    });
});

/* PATCH change blog. */
router.patch('/:id', jsonParser, function(req, res, next) {
    jwtAuthentication.authenticateJWT(req, res, function() {
        const blog = req.body;

        if (blog["title"] && blog["destination"] && blog["traveltime"] && blog["shortDescription"]) {
            const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            mongoClient.connect(function(err) {
                if (err) {
                    res.status(500).json(err);
                    console.error(err);
                }

                mongoClient.db('travelblog').collection('blogs').updateOne(
                    { "_id": ObjectId(req.params.id) }, 
                    { $set: { 
                        "title": blog.title,
                        "destination": blog.destination,
                        "traveltime": blog.traveltime,
                        "shortDescription": blog.shortDescription,
                        "entries": blog.entries
                    } }, 
                    function(err, result) {
                        if (err) {
                            res.status(500).json({ error: err, result: result });
                        } else {
                            console.log(`${result.matchedCount} blog(s) matched, ${result.modifiedCount} were modieifed.`);
                            res.status(200).json(blog);
                        }
                        mongoClient.close();
                });
            });
        } else {
            res.status(400).send("A blog has to consist of a title, destination, traveltime (in days) and shortDescription.");
        }
    });
});

/* DELETE blog. */
router.delete('/:id', function(req, res, next) {
    jwtAuthentication.authenticateJWT(req, res, function() {
        const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        mongoClient.connect(function(err) {
            if (err) {
                res.status(500).json(err);
                console.error(err);
            }

            mongoClient.db('travelblog').collection('blogs').deleteOne({ "_id": ObjectId(req.params.id) }, (err, result) => {
                if (err || !result.result.ok) {
                    res.status(500).json({ error: err, result: result });
                } else {
                    console.log(`${result.result.n} blog(s) were deleted.`)
                    res.status(200).json(result);
                }
                mongoClient.close();
            });
        });
    });
});

/* GET all blogs entries. */
router.get('/:id/entries', jsonParser, function(req, res, next) {
    const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(function(err) {
        if (err) {
            res.status(500).json(err);
            console.error(err);
        }

        mongoClient.db('travelblog').collection('blogs').findOne({ _id: ObjectId(req.params.id) }, function(err, result) {
            if (err) {
                res.status(500).json({ error: err, result: result });
            } else {
                res.status(200).json(result.entries);
            }

            mongoClient.close();
        });
    });
});

module.exports = router;
