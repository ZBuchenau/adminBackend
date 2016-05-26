var express = require('express');
var router = express.Router();
var https = require('https');
var jwt = require('jsonwebtoken');
var knex = require('../db/knex.js');
var bcrypt = require('bcrypt');


var authenticated = false;

//====================================================
//  USERS
//====================================================
router.post('/', function(req, res, next) {

    var userState;
    var tokenToVerify = req.body.token;

    if (jwt.verify(tokenToVerify, process.env.JWT_SECRET)) {

        tokenInfo = jwt.verify(tokenToVerify, process.env.JWT_SECRET).id[0];
        //deposit user-state to the database
        console.log(tokenInfo, 'tokenInfo');
        knex('users')
          .where('id', tokenInfo)
          .update({'user_state': true})
          .returning('id')
          .then(function(response){
            userState = response[0];
            res.send(userState);
          })
          .catch(function(err){
            console.log(err);
          });

    } else {
        userState = false;
        res.send(userState);
    }
});


//====================================================
//  AUTHENTICATE USER
//====================================================
router.post('/auth', function(req, res, next) {

    var authenticated;

    // console.log("REQ.BODY:", req.body);
    var tokenToVerify = req.body.token;
    tokenInfo = jwt.verify(tokenToVerify, process.env.JWT_SECRET);
    // console.log(tokenInfo);
    var tokenId = tokenInfo.id[0];
    if(tokenInfo){
      knex('users')
        .where('id', tokenId)
        .then(function(response){
          // console.log(response);
          var info = response[0];

          var userInfo = {
            email: info.email,
            firstname: info.first_name,
            lastname: info.last_name,
            id: info.id,
            username: info.username
          };
          // console.log(userInfo);
          res.send(userInfo);
        });
    } else {
      res.send(false);
    }

    // res.send(authenticated);

});


//====================================================
//  SIGNUP (Enter User into the Database)
//====================================================
router.post('/signup', function(req, res, next) {
    console.log('user has hit the /USERS/SIGNUP endpoint');
    // console.log(req.body);



    var userFirstName = req.body.firstName;
    var userLastName = req.body.lastName;
    var username = req.body.userName;
    var userEmail = req.body.email;
    var userPassword = req.body.password;

    var saltRounds = 13;
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(userPassword, salt);

    knex('users')
        .where('email', userEmail)
        .then(function(response) {
            // console.log(response);

            if (response.length === 0) {
                knex('users')
                    .returning('id')
                    .insert({
                        'first_name': userFirstName,
                        'last_name': userLastName,
                        'username': username,
                        'password': hash,
                        'email': userEmail
                    })
                    .then(function(response) {
                        console.log('User ' + response + ' Has Been Placed In Database');
                        var myToken = jwt.sign({
                            id: response,
                            expiresIn: "14d"
                        }, process.env.JWT_SECRET);

                        // console.log(myToken);

                        res.send({
                            token: myToken
                        });
                    })
                    .catch(function(err) {
                        console.log(err);
                    });

            } else {
                console.log('User already exists in the database');
                res.send(false);
            }

        })
        .catch(function(err) {
            console.log(err);
        });
});



//====================================================
//  LOGIN (Authenticate User with the Database)
//====================================================
router.post('/login', function(req, res, next) {
    console.log('user has hit the /USERS/LOGIN endpoint');
    // console.log(req.body);

    var userEmail = req.body.email;
    var userPassword = req.body.password;

    knex('users')
        .where({
            'email': userEmail,
        })
        .then(function(response) {
            var userInfo = response[0];
            if (bcrypt.compareSync(userPassword, userInfo.password)) {
                userInfo = {
                    id: userInfo.id,
                    firstname: userInfo.first_name,
                    lastname: userInfo.last_name,
                    username: userInfo.username
                };
                return userInfo;
            } else {
                res.send(401, 'Wrong Email or Password');
            }
        })
        .then(function(response) {
            var myToken = jwt.sign({
                id: response.id,
                expiresIn: "14d"
            }, process.env.JWT_SECRET);
            var user = response;
            user.token = myToken;
            // console.log('all good up until here');
            // console.log(user);
            res.send(user);
        })
        .catch(function(err) {
            console.log(err + 'ERROR');
        });

});

//submits and returns whatever object is submitted to the database
var knexInsert = function(tableName, obj){
  return knex(tableName)
    .returning('*')
    .insert(obj);
};

router.get('/mediaPlans/plans', function(req, res, next){
  console.log("USER IS # ", req.user.id[0]);
  var userId = req.user.id[0];
  knex('media_plan')
  .where('user_id', userId)
  .select('*')
  .then(function(response){
    res.send(response);
  })
  .catch(function(err){
    console.log(err);
  });
});

router.post('/mediaPlans/clientInfo', function(req, res, next){
  var mediaPlan = req.body.data.clientName;
  var budget = req.body.data.clientMonthlyBudget;
  var year = req.body.data.year;
  var userId = req.user.id[0];

  var info = {
      'user_id': userId,
      'name': mediaPlan,
      'monthly_budget': budget,
      'year': year
    };


    knexInsert('media_plan', info)
      .then(function(response){
        console.log(response, "THIS IS THE RESPONSE!!!!");
        res.send(response);
      })
      .catch(function(error){
        console.log(error);
      });

});

router.post('/mediaPlans/ppcTactics', function(req, res, next){
  console.log(req.body);
  res.send('(PPC) TACTIC SUBMISSION HAS HIT THE SERVER...');
});

router.post('/mediaPlans/cpmTactics', function(req, res, next){
  console.log(req.body);
  res.send('(CPM) TACTIC SUBMISSION HAS HIT THE SERVER...');
});

router.post('/mediaPlans/listingTactics', function(req, res, next){
  console.log(req.body);
  res.send('(LISTING) TACTIC SUBMISSION HAS HIT THE SERVER...');
});

router.post('/mediaPlans/emailTactics', function(req, res, next){
  console.log(req.body);
  res.send('(EMAIL) TACTIC SUBMISSION HAS HIT THE SERVER...');
});

router.post('/mediaPlans/flatFeeTactics', function(req, res, next){
  console.log(req.body);
  res.send('(FLAT FEE) TACTIC SUBMISSION HAS HIT THE SERVER...');
});

module.exports = router;
