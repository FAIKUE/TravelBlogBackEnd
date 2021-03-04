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

/* GET blog. */
router.get('/:id', function(req, res, next) {
    jwtAuthentication.authenticateJWT(req, res, function() {
        const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        mongoClient.connect(function(err) {
            if (err) {
                res.sendStatus(500);
                throw err;
            }

            let id;
            try {
                id = ObjectId(req.params.id)
            } catch (error) {
                res.sendStatus(404);
                return;
            }

            mongoClient.db('travelblog').collection('blogs').findOne({ _id: id }, function(err, result) {
                if (err) {
                    res.sendStatus(500);
                    throw err;
                }

                mongoClient.close();
                res.status(200).json(result);
            });
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
});

/* PATCH change blog. */
router.patch('/:id', jsonParser, function(req, res, next) {
    jwtAuthentication.authenticateJWT(req, res, function() {
        const blog = req.body;

        if (blog["title"] && blog["destination"] && blog["traveltime"] && blog["shortDescription"]) {
            const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            mongoClient.connect(function(err) {
                if (err) {
                    res.sendStatus(500);
                    throw err;
                }

                mongoClient.db('travelblog').collection('blogs').updateOne(
                    { "_id": ObjectId(req.params.id) }, 
                    { $set: { 
                        "title": blog.title,
                        "destination": blog.destination,
                        "traveltime": blog.traveltime,
                        "shortDescription": blog.shortDescription
                    } }, 
                    function(err, result) {
                        assert.equal(result.modifiedCount, 1, "Exactly the one blog addressed by the id should be changed.");
                        mongoClient.close();
                        res.sendStatus(200);
                });
            });
        } else {
            res.status(400).send("A blog has to consist of a title, destination, traveltime (in days) and shortDescription.");
        }
    });
});

/* GET alls blogs entries. */
router.get('/:id/entries', jsonParser, function(req, res, next) {
    jwtAuthentication.authenticateJWT(req, res, function() {
        const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        mongoClient.connect(function(err) {
            if (err) {
                res.sendStatus(500);
                throw err;
            }

            mongoClient.db('travelblog').collection('blogs').findOne({ _id: ObjectId(req.params.id) }, function(err, result) {
                mongoClient.close();
                res.status(200).json(result.entries);
            });
        });
    });
});

/* POST add blog entry. */
router.post('/:id/entries', jsonParser, function(req, res, next) {
    jwtAuthentication.authenticateJWT(req, res, function() {
        const entry = req.body;
        entry["_id"] = ObjectId();

        if (entry["title"] && entry["datetime"] && entry["text"]) {
            const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            mongoClient.connect(function(err) {
                if (err) {
                    res.sendStatus(500);
                    throw err;
                }

                mongoClient.db('travelblog').collection('blogs').updateOne({ _id: ObjectId(req.params.id) }, { $push: { entries: entry } }, function(err, result) {
                    assert.equal(result.modifiedCount, 1, "Exactly the one blog addressed by the id should be changed.");
                    mongoClient.close();
                    res.sendStatus(201);
                });
            });
        } else {
            res.status(400).send("A blog entry has to consist of a title, datetime and text.");
        }
    });
});

/* PATCH change blog entry. */
router.patch('/:id/entries/:entryId', jsonParser, function(req, res, next) {
    jwtAuthentication.authenticateJWT(req, res, function() {
        const entry = req.body;

        if (entry["title"] && entry["datetime"] && entry["text"]) {
            const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            mongoClient.connect(function(err) {
                if (err) {
                    res.sendStatus(500);
                    throw err;
                }

                mongoClient.db('travelblog').collection('blogs').updateOne(
                    { "_id": ObjectId(req.params.id), "entries._id": ObjectId(req.params.entryId) }, 
                    { $set: { 
                        "entries.$.title": entry.title,
                        "entries.$.datetime": entry.datetime,
                        "entries.$.text": entry.text,
                        "entries.$.place": entry.place,
                        "entries.$.images": entry.images
                    } }, 
                    function(err, result) {
                        assert.equal(result.modifiedCount, 1, "Exactly the one blog entry addressed by the id should be changed.");
                        mongoClient.close();
                        res.sendStatus(200);
                });
            });
        } else {
            res.status(400).send("A blog entry has to consist of a title, datetime and text.");
        }
    });
});

module.exports = router;
