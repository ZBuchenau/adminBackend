var express = require('express');
var router = express.Router();
var https = require('https');
var jwt = require('jsonwebtoken');
var knex = require('../db/knex.js');

//====================================================
//  INDEX
//====================================================
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



//====================================================
//  SIGNUP (Enter User into the Database)
//====================================================
router.post('/signup', function(req, res, next){
  console.log('user has hit the /USERS/SIGNUP endpoint');
  console.log(req.body);
});



//====================================================
//  LOGIN (Authenticate User with the Database)
//====================================================
router.post('/login', function(req, res, next){
  console.log('user has hit the /USERS/LOGIN endpoint');
  console.log(req.body);
});

module.exports = router;
