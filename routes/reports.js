var express = require('express');
var router = express.Router();
var https = require('https');
var jwt = require('jsonwebtoken');
var knex = require('../db/knex.js');
var bcrypt = require('bcrypt');
var Q = require('q');

// CUSTOM MIDDLEWARE
var knexFunctions = require('../js/knexFunctions.js');



router.post('/', function(req, res, next) {
  console.log(req.user.id);
  console.log(req.body);
  var report = req.body;
  report.user_fk = req.user.id;
  report.client_fk = parseInt(report.client_fk);


  knexFunctions.checkExists('reports', {'report_name' : report.report_name}).then(function(response){
    console.log('$$$', response);
    if(response.length === 0){
      knexFunctions.insert('reports', report, '*').then(function(response){
        console.log('SENDING RESPONSE: ', response);
        res.send(response);
      });
    } else {
      res.send(false);
    }
  });
});

module.exports = router;
