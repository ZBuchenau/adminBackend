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
      .update({
        'user_state': true
      })
      .returning('id')
      .then(function(response) {
        userState = response[0];
        res.send(userState);
      })
      .catch(function(err) {
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

  console.log('USER HAS HIT THE AUTH ENDPOINT...');

  var authenticated;

  var tokenToVerify = req.body.token;

  tokenInfo = jwt.verify(tokenToVerify, process.env.JWT_SECRET);
  console.log("tokenInfo = ", tokenInfo);

  var tokenId = tokenInfo.id[0];
  console.log("tokenID = ", tokenId);

  if (tokenInfo) {
    knex('users')
      .where({
        'id': tokenId
      })
      .select('*')
      .then(function(data) {
        console.log(data);
        var info = data[0];
        // console.log(info);

        var userInfo = {
          email: info.email,
          firstname: info.first_name,
          lastname: info.last_name,
          id: info.id,
          username: info.username
        };
        console.log(userInfo);
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
var knexInsert = function(tableName, obj) {
  return knex(tableName)
    .returning('*')
    .insert(obj);
};

var knexSelectTactics = function(tableName, obj) {
  return knex(tableName)
    .where(obj)
    .select('*');
};



router.get('/mediaPlans/plans', function(req, res, next) {
  console.log("USER IS # ", req.user.id[0]);
  var userId = req.user.id[0];
  knex('media_plan')
    .where('user_id', userId)
    .select('*')
    .then(function(response) {
      res.send(response);
    })
    .catch(function(err) {
      console.log(err);
    });
});



router.post('/mediaPlans/clientInfo', function(req, res, next) {
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
    .then(function(response) {
      console.log(response, "THIS IS THE RESPONSE!!!!");
      res.send(response);
    })
    .catch(function(error) {
      console.log(error);
    });

});



router.post('/mediaPlans/allTactics', function(req, res, next) {
  // console.log(req.body.mediaPlanId);
  // console.log(req.user.id[0]);
  var mediaPlanNumber = req.body.mediaPlanId;
  var userId = req.user.id[0];
  var mediaPlanObject = [];
  var tables = ['ppc', 'cpm', 'listings', 'email', 'flat_fee'];


  knexSelectTactics('ppc', {
    'media_plan_id': mediaPlanNumber,
    'user_id': userId
  }).then(function(response) {
    console.log("#################", response);
    mediaPlanObject.push(response);
  }).then(function(){
    knexSelectTactics('cpm', {
      'media_plan_id': mediaPlanNumber,
      'user_id': userId
    }).then(function(response) {
      console.log("#################", response);
      mediaPlanObject.push(response);
    }).then(function(){
      knexSelectTactics('listings', {
        'media_plan_id': mediaPlanNumber,
        'user_id': userId
      }).then(function(response) {
        console.log("#################", response);
        mediaPlanObject.push(response);
      }).then(function(){
        knexSelectTactics('email', {
          'media_plan_id': mediaPlanNumber,
          'user_id': userId
        }).then(function(response) {
          console.log("#################", response);
          mediaPlanObject.push(response);
        }).then(function(){
          knexSelectTactics('flat_fee', {
            'media_plan_id': mediaPlanNumber,
            'user_id': userId
          }).then(function(response) {
            console.log("#################", response);
            mediaPlanObject.push(response);
          }).then(function(response){
            console.log("+++++ MEDIA PLAN OBJECT +++++", mediaPlanObject);
            res.send(mediaPlanObject);
          });
        });
      });
    });
  }).catch(function(error){
    console.log(error);
  });
});




router.post('/mediaPlans/ppcTactics', function(req, res, next) {
  console.log(req.body.data);
  var userId = req.user.id[0];
  var provider = req.body.data.providerName;
  var tactic = req.body.data.tacticName;
  var spend = req.body.data.tacticSpend;
  var mediaPlan = req.body.data.mediaPlan;

  var info = {
    'media_plan_id': mediaPlan,
    'user_id': userId,
    'provider_name': provider,
    'tactic_name': tactic,
    'monthly_spend': spend
  };

  knexInsert('ppc', info)
    .then(function(response) {
      console.log(response, "PPC TACTIC SUBMITTED TO DATABASE...");
      res.send(response);
    })
    .catch(function(error) {
      console.log(error);
    });
});



router.post('/mediaPlans/cpmTactics', function(req, res, next) {
  console.log(req.body);
  var userId = req.user.id[0];
  var provider = req.body.data.providerName;
  var tactic = req.body.data.tacticName;
  var impressions = req.body.data.contractedImpressions;
  var spend = req.body.data.tacticSpend;
  var mediaPlan = req.body.data.mediaPlan;

  var info = {
    'media_plan_id': mediaPlan,
    'user_id': userId,
    'provider_name': provider,
    'tactic_name': tactic,
    'impressions_contracted': impressions,
    'monthly_spend': spend
  };

  knexInsert('cpm', info)
    .then(function(response) {
      console.log(response, "CPM TACTIC SUBMITTED TO DATABASE...");
      res.send(response);
    })
    .catch(function(error) {
      console.log(error);
    });
});



router.post('/mediaPlans/listingTactics', function(req, res, next) {
  console.log(req.body);
  var userId = req.user.id[0];
  var provider = req.body.data.providerName;
  var tactic = req.body.data.tacticName;
  var spend = req.body.data.tacticSpend;
  var mediaPlan = req.body.data.mediaPlan;

  var info = {
    'media_plan_id': mediaPlan,
    'user_id': userId,
    'provider_name': provider,
    'tactic_name': tactic,
    'monthly_spend': spend
  };

  knexInsert('listings', info)
    .then(function(response) {
      console.log(response, "LISTING TACTIC SUBMITTED TO DATABASE...");
      res.send(response);
    })
    .catch(function(error) {
      console.log(error);
    });
});


router.post('/mediaPlans/emailTactics', function(req, res, next) {
  console.log(req.body);
  var userId = req.user.id[0];
  var provider = req.body.data.providerName;
  var tactic = req.body.data.tacticName;
  var spend = req.body.data.tacticSpend;
  var mediaPlan = req.body.data.mediaPlan;

  var info = {
    'media_plan_id': mediaPlan,
    'user_id': userId,
    'provider_name': provider,
    'tactic_name': tactic,
    'monthly_spend': spend
  };

  knexInsert('email', info)
    .then(function(response) {
      console.log(response, "EMAIL TACTIC SUBMITTED TO DATABASE...");
      res.send(response);
    })
    .catch(function(error) {
      console.log(error);
    });
});



router.post('/mediaPlans/flatFeeTactics', function(req, res, next) {
  console.log(req.body);
  console.log(req.body);
  var userId = req.user.id[0];
  var provider = req.body.data.providerName;
  var tactic = req.body.data.tacticName;
  var spend = req.body.data.tacticSpend;
  var mediaPlan = req.body.data.mediaPlan;

  var info = {
    'media_plan_id': mediaPlan,
    'user_id': userId,
    'provider_name': provider,
    'tactic_name': tactic,
    'monthly_spend': spend
  };

  knexInsert('flat_fee', info)
    .then(function(response) {
      console.log(response, "FLAT FEE TACTIC SUBMITTED TO DATABASE...");
      res.send(response);
    })
    .catch(function(error) {
      console.log(error);
    });
});

module.exports = router;
