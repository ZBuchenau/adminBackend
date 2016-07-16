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

  var tokenId = tokenInfo.id;
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


// Checks to see if a parameter (in the form of {xyz: abc}) exists in the database.
var knexCheckExists = function(tableName, paramToCheck) {
  return knex(tableName)
    .returning('*')
    .where(paramToCheck);
};

//Inserts and returns whatever object was submitted to the database
var knexInsert = function(tableName, obj) {
  return knex(tableName)
    .returning('*')
    .insert(obj);
};

var knexSelectTactics = function(tableName, obj) {
  return knex(tableName)
    .returning('*')
    .where(obj);
};



var knexDelete = function(tableName, obj) {
  return knex(tableName)
    .returning(['media_plan_id', 'user_id'])
    .where({
      'user_id': obj.user_id,
      'media_plan_id': obj.media_plan_id,
      'tactic_name': obj.tactic_name,
      'monthly_spend': obj.monthly_spend,
      'provider_name': obj.provider_name
    })
    .del();
};



router.get('/mediaPlans/plans', function(req, res, next) {
  console.log("USER IS # ", req.user.id);
  var userId = req.user.id;
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@", userId);
  knex('media_plan')
    .where('user_id', userId)
    .select('*')
    .then(function(response) {
      console.log(response);
      res.send(response);
    })
    .catch(function(err) {
      console.log(err);
    });
});



router.post('/mediaPlans/clientInfo', function(req, res, next) {
  console.log('USER HAS HIT THE CLIENT-INFO ENDPOINT');
  var mediaPlan = req.body.data.clientName;
  var budget = req.body.data.clientMonthlyBudget;
  var year = req.body.data.year;
  var userId = req.user.id;
  console.log(userId);

  var info = {
    'user_id': userId,
    'name': mediaPlan,
    'monthly_budget': budget,
    'year': year
  };


  knexInsert('media_plan', info)
    .then(function(response) {
      console.log("THIS IS THE RESPONSE!!!!: ", response[0]);
      res.send(response[0]);
    })
    .catch(function(error) {
      console.log(error);
    });

});



router.post('/mediaPlans/allTactics', function(req, res, next) {
  // console.log(req.body.mediaPlanId);

  var mediaPlanNumber = req.body.mediaPlanId;
  var userId = req.user.id;
  var mediaPlanObject = [];

  var info = {
    'media_plan_id': mediaPlanNumber,
    'user_id': userId
  };

  knexSelectTactics('ppc', info).then(function(response) {
    mediaPlanObject.push(response);
  }).then(function() {
    knexSelectTactics('cpm', info).then(function(response) {
      mediaPlanObject.push(response);
    }).then(function() {
      knexSelectTactics('listings', info).then(function(response) {
        mediaPlanObject.push(response);
      }).then(function() {
        knexSelectTactics('email', info).then(function(response) {
          mediaPlanObject.push(response);
        }).then(function() {
          knexSelectTactics('flat_fee', info).then(function(response) {
            mediaPlanObject.push(response);
          }).then(function(response) {
            console.log("+++++ MEDIA PLAN OBJECT +++++", mediaPlanObject);
            res.send(mediaPlanObject);
          });
        });
      });
    });
  }).catch(function(error) {
    console.log(error);
  });
});

router.post('/mediaPlans/titles', function(req, res, next) {
  console.log("TITLES HAS BEEN HIT...");
  // console.log(req.body);
  var userId = req.user.id;
  var mediaPlan = req.body.mediaPlanId;
  knex('media_plan')
    .where({
      'media_plan_id': mediaPlan,
      'user_id': userId
    }).select('*')
    .then(function(response) {
      console.log(response[0]);
      res.send(response[0]);
    });
});


router.post('/mediaPlans/ppcTactics', function(req, res, next) {
  console.log(req.body.data);
  var userId = req.user.id;
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
      var data = response;
      data[0].monthly_spend = parseInt(data[0].monthly_spend);
      console.log(data);
      res.send(data);
    })
    .catch(function(error) {
      console.log(error);
    });
});



router.post('/mediaPlans/cpmTactics', function(req, res, next) {
  console.log(req.body);
  var userId = req.user.id;
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
      var data = response;
      data[0].monthly_spend = parseInt(data[0].monthly_spend);
      console.log(data);
      res.send(data);
    })
    .catch(function(error) {
      console.log(error);
    });
});



router.post('/mediaPlans/listingTactics', function(req, res, next) {
  console.log(req.body);
  var userId = req.user.id;
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
      var data = response;
      data[0].monthly_spend = parseInt(data[0].monthly_spend);
      console.log(data);
      res.send(data);
    })
    .catch(function(error) {
      console.log(error);
    });
});


router.post('/mediaPlans/emailTactics', function(req, res, next) {
  console.log(req.body);
  var userId = req.user.id;
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
      var data = response;
      data[0].monthly_spend = parseInt(data[0].monthly_spend);
      console.log(data);
      res.send(data);
    })
    .catch(function(error) {
      console.log(error);
    });
});



router.post('/mediaPlans/flatFeeTactics', function(req, res, next) {
  console.log(req.body);
  console.log(req.body);
  var userId = req.user.id;
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
      var data = response;
      data[0].monthly_spend = parseInt(data[0].monthly_spend);
      console.log(data);
      res.send(data);
    })
    .catch(function(error) {
      console.log(error);
    });
});
// =============================================================================
// SUBMIT TACTIC FUNCTION FOR ALL TACTICS
// =============================================================================



router.post('/mediaPlans/submitTactic', function(req, res) {
  var tacticTableNames = ['ppc', 'cpm', 'listings', 'email', 'flat_fee'];
  var user = req.user.id;
  var mediaPlan = parseInt(req.body.data.mediaPlan);
  var tableName = req.body.data.tacticType;
  var provider = req.body.data.providerName;
  var tacticName = req.body.data.tacticName;
  var spend = req.body.data.tacticSpend;
  var info = {
    'user_id': user,
    'media_plan_id': mediaPlan,
    'provider_name': provider,
    'tactic_name': tacticName,
    'monthly_spend': spend
  };
  var mediaPlanIdentifiers = {
    'user_id': user,
    'media_plan_id': mediaPlan,
  };
  var mediaPlanArray = [];

  knexCheckExists(tableName, {
    'user_id': user,
    'media_plan_id': mediaPlan,
    'tactic_name': tacticName
  }).then(function(response) {
    if (response.length === 0) {
      // RUN FUNCTION TO SUBMIT ANY TACTIC INTO ANY TABLE
      console.log('EMPTY RESPONSE');
      knexInsert(tableName, info)
        .then(function(response) {
          // RETRIEVE ALL TACTICS FOR EVERY ASPECT OF THIS MEDIA PLAN
          knexSelectTactics('ppc', mediaPlanIdentifiers).then(function(response) {
            mediaPlanArray.push(response);
          }).then(function(response) {
            knexSelectTactics('cpm', mediaPlanIdentifiers).then(function(response) {
              mediaPlanArray.push(response);
            }).then(function(response) {
              knexSelectTactics('listings', mediaPlanIdentifiers).then(function(response) {
                mediaPlanArray.push(response);
              }).then(function(response) {
                knexSelectTactics('email', mediaPlanIdentifiers).then(function(response) {
                  mediaPlanArray.push(response);
                }).then(function(response) {
                  knexSelectTactics('flat_fee', mediaPlanIdentifiers).then(function(response) {
                    mediaPlanArray.push(response);
                  }).then(function(response) {
                    res.send(mediaPlanArray);
                  });
                });
              });
            });
          });
        });
    } else {
      console.log('TACTIC ALREADY EXISTS IN DATABASE');
      res.send('Already Exists');
    }
  });
});

router.post('/tactics/delete', function(req, res) {
  console.log("++++++++++++++++++++++++++++++++++", req.body);
  knexDelete(req.body.tactic_id, req.body)
    .then(function(response) {
      res.send(response);
    });
});

module.exports = router;
