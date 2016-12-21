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
  var c = req.body;
  var client = {
    'user_fk' : req.user.id,
    'client_name' : c.client_name,
    'client_address' : c.client_address,
    'client_city' : c.client_city,
    'client_state' : c.client_state,
    'client_zip' : c.client_zip
  };
  var contact = {
    'contact_fn' : c.contact_fn,
    'contact_ln' : c.contact_ln,
    'contact_email' : c.contact_email,
    'contact_phone' : c.contact_phone
  };
  var billing = {
    'billing_name' : c.billing_name,
    'billing_address' : c.billing_address,
    'billing_city' : c.billing_city,
    'billing_state' : c.billing_state,
    'billing_zip' : c.billing_zip
  };
  // console.log(client, contact, billing);


  knexFunctions.insert('clients', client, '*')
    .then(function(response){
      contact.client_fk = response[0].id;
      billing.client_fk = response[0].id;
      c.client_id = response[0].id;

      knexFunctions.insert('client_contacts', contact, 'id').then(function(response){
        knexFunctions.insert('client_billing', billing, 'id').then(function(response){
          console.log(response);
          if(response){
            res.send(c);
          } else {
            res.send('DATABASE ERROR');
          }
        });
      });
    });
});

module.exports = router;
