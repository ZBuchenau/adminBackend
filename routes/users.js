var express = require('express');
var router = express.Router();
var https = require('https');
var jwt = require('jsonwebtoken');
var knex = require('../db/knex.js');

//====================================================
//  INDEX
//====================================================
router.get('/', function(req, res, next) {
  res.send('Waiting for User requests');
});



//====================================================
//  SIGNUP (Enter User into the Database)
//====================================================
router.post('/signup', function(req, res, next){
  console.log('user has hit the /USERS/SIGNUP endpoint');
  console.log(req.body);

  var userFirstName = req.body.firstName;
  var userLastName = req.body.lastName;
  var username = req.body.userName;
  var userEmail = req.body.email;
  var userPassword = req.body.password;

  knex('users')
    .where('email', userEmail)
    .then(function(response){
      console.log(response);

      if(response.length === 0){
        knex('users')
          .returning('id')
          .insert({
            'first_name' : userFirstName,
            'last_name' : userLastName,
            'username' : username,
            'password' : userPassword,
            'email' : userEmail
          })
          .then(function(response){
            console.log('User ' + response + ' Has Been Placed In Database' );
            var myToken = jwt.sign({
              id : response
            }, process.env.JWT_SECRET);

            console.log(myToken);

            res.send(myToken);
          })
          .catch(function(err){
            console.log(err);
          });

      } else {
        console.log('User already exists in the database');
        res.end();
      }

    })
    .catch(function(err){
      console.log(err);
    });
});



//====================================================
//  LOGIN (Authenticate User with the Database)
//====================================================
router.post('/login', function(req, res, next){
  console.log('user has hit the /USERS/LOGIN endpoint');
  console.log(req.body);
});

module.exports = router;
