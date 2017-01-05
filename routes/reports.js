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

router.get('/userreports', function(req, res, next){
  var clientArray = [];

  console.log('USER HAS HIT THE REPORTS/GET ENDPOINT!!!');
  console.log(req.user.id);
  knexFunctions.select('reports', {'user_fk' : req.user.id})
  .then(function(response){
    console.log(response);
    res.send(response);
  });
});

router.post('/update', function(req, res, next){
  console.log('USER HAS HIT THE REPORTS/UPDATE ENDPOINT:::');
  console.log(req.body);
  var info = {
    'user_fk' : req.user.id,
    'id' : req.body.id
  };

  var updateObj = req.body;
  delete updateObj.color;
  console.log(':::::::::::::::::::::::::::::::::::::::::::::::::::::::');

  console.log(info);

  knexFunctions.edit('reports', info, updateObj)
  .then(function(response){
    console.log(response);
    response[0].color = '';
    res.send(response[0]);
  });
});

module.exports = router;
