const express = require('express');
const assert = require('assert').strict;
const router = express.Router();
const dbConnectionString = 'mongodb+srv://weblab:weblab@cluster0.8q4oo.mongodb.net/traveblog?retryWrites=true&w=majority';
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtAuthentication = require('../jwt-authentication');

const jsonParser = bodyParser.json()

/* POST login */
router.post('/', jsonParser, function(req, res, next) {
    const {username, password} = req.body;

    const mongoClient = new MongoClient(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(function(err) {
        if (err) {
            res.sendStatus(500);
            throw err;
        }

        let users = mongoClient.db('travelblog').collection('users');
        users.findOne({'username': username}, function(err, result) {
            assert.equal(err, null);

            if (result) {
                // password hashing and comparing
                const correctPassword = bcrypt.compareSync(password, result.password);
                if (correctPassword) {
                    // token signing
                    const token = jwt.sign({ 'username': username }, jwtAuthentication.jwtAcessTokenSecret);
                    res.status(200).json({ 'username': username, 'firstname': result.firstname, 'lastname': result.lastname, 'token': token });
                } else {
                    res.status(401).json({ 'sucess': false, 'message': 'Username and password incorrect.' });
                }
            } else {
                res.status(401).json({ 'sucess': false, 'message': 'Username and password incorrect.' });
            }
            mongoClient.close();
        });
    });
});

module.exports = router;