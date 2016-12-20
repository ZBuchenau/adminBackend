var express = require('express');
var router = express.Router();
var https = require('https');
var jwt = require('jsonwebtoken');
var knex = require('../db/knex.js');
var bcrypt = require('bcrypt');
var Q = require('q');


router.post('/', function(req, res, next) {
  console.log('user has hit the /CLIENTS endpoint');
  console.log(req.body);
});

module.exports = router;
