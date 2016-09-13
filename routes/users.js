 var express = require('express');
var router = express.Router();
var https = require('https');
var jwt = require('jsonwebtoken');
var knex = require('../db/knex.js');
var bcrypt = require('bcrypt');
var async = require('async');


var authenticated = false;

var knexDelete = function(tableName, obj) {
  return knex(tableName)
    .where({
      'user_id': obj.user_id,
      'media_plan_id': obj.media_plan_id,
      'tactic_id': obj.tactic_id
    })
    .del();
};

var knexEdit = function(tableName, obj) {
  obj.provider_name = obj.provider_name.toUpperCase();
  return knex(tableName)
    .returning('*')
    .where({
      'user_id': obj.user_id,
      'media_plan_id': obj.media_plan_id,
      'tactic_id': obj.tactic_id
    })
    .update(obj);
};

// ***** USERS *****
//====================================================
//  AUTHENTICATE USER
//====================================================
router.post('/auth', function(req, res, next) {

  console.log('1 USER HAS HIT THE AUTH ENDPOINT...');

  var authenticated;
  var tokenInfo = req.user;
  var tokenId = parseInt(req.user.id);

  if (tokenInfo) {
    knex('users')
      .returning('id', 'first_name', 'last_name', 'username', 'email')
      .where({
        'id': tokenId
      })
      .then(function(data) {
        var info = data[0];
        var userInfo = {
          email: info.email,
          firstname: info.first_name,
          lastname: info.last_name,
          id: info.id,
          username: info.username
        };
        console.log('2 LEAVING AUTH ENDPOINT...');
        res.send(userInfo);
      });
  } else {
    res.send(false);
  }
});

router.get('/mediaPlans/plans', function(req, res, next) {
  console.log("3 USER #" + req.user.id + ' HAS HIT THE mediaPlans/plans ENDPOINT...');
  var userId = parseInt(req.user.id);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@", userId);
  knex('media_plan')
    .where('user_id', userId)
    .select('*')
    .then(function(response) {
      console.log('4 LEAVING THE mediaPlans/plans ENDPOINT...');
      res.send(response);
    })
    .catch(function(err) {
      console.log(err);
    });
});


//====================================================
//  SIGNUP (Enter User into the Database)
//====================================================
router.post('/signup', function(req, res, next) {
  console.log('user has hit the /USERS/SIGNUP endpoint');

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
        console.log('here');
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

router.post('/mediaPlans/clientInfo', function(req, res, next) {
  console.log('USER HAS HIT THE CLIENT-INFO ENDPOINT');
  var mediaPlan = req.body.clientName;
  var budget = req.body.clientMonthlyBudget;
  var year = req.body.year;
  var userId = parseInt(req.user.id);
  console.log(userId);

  var info = {
    'user_id': userId,
    'name': mediaPlan,
    'monthly_budget': budget,
    'year': year
  };

  knexCheckExists('media_plan', {'user_id':userId, 'name':mediaPlan})
  .then(function(response){
    console.log('CHECK THIS RESPONSE!!', response);
    if(response.length !== 0){
      console.log('CLIENT ALREADY EXISTS!!!');
      res.send(false);
    } else {
      knexInsert('media_plan', info)
        .then(function(response) {
          console.log("THIS IS THE RESPONSE!!!!: ", response[0]);
          res.send(response[0]);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  });
});

router.post('/mediaPlans/clientEdit', function(req, res, next){

  var user = req.user.id;
  var mediaPlan = req.body.mediaPlanId;
  var name = req.body.clientName;
  var budget = req.body.clientMonthlyBudget;
  var year = req.body.year;

  var clientInfo = {
    'user_id': user,
    'media_plan_id': mediaPlan,
    'name': name,
    'monthly_budget': budget,
    'year': year
  };
  console.log("CLIENT INFO:", clientInfo);

  knexCheckExists('media_plan', clientInfo)
  .then(function(response){
    if(response.length !== 0){
      console.log('CLIENT ALREADY EXISTS!!!');
      res.send(false);
    } else {
      knexSelectTactics('media_plan', clientInfo)
      .then(function(response){
        knex('media_plan')
          .returning('*')
          .where({
            'user_id': user,
            'media_plan_id': mediaPlan,
          })
          .update(clientInfo)
          .then(function(response){
            console.log(response);
            res.send(response);
          });
      });
    }
  });


});


router.post('/mediaPlans/allTactics', function(req, res, next) {
  // console.log(req.body.mediaPlanId);

  var mediaPlanNumber = req.body.mediaPlanId;
  var userId = parseInt(req.user.id);
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
  var userId = parseInt(req.user.id);
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


// =============================================================================
// SUBMIT TACTIC FUNCTION FOR ALL TACTICS
// =============================================================================
router.post('/mediaPlans/submitTactic', function(req, res) {
  console.log(req.body);
  // var tacticTableNames = ['ppc', 'cpm', 'listings', 'email', 'flat_fee'];
  var user = parseInt(req.user.id);
  var mediaPlan = parseInt(req.body.mediaPlan);
  var tableName = req.body.tacticType;
  var provider = req.body.providerName.toUpperCase();
  var tacticName = req.body.tacticName;
  var spend = req.body.tacticSpend;
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
    'tactic_name': tacticName,
    'provider_name': provider
  }).then(function(response) {
    console.log(response);
    if (response.length === 0 && tableName !== 'cpm' && tableName !== 'listings' && tableName !== 'email') {
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
    } else if (response.length === 0 && tableName === 'cpm') {
      info.cost_per_thousand = req.body.cost_per_thousand;

      console.log(info);
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

    } else if(response.length === 0 && tableName === 'listings'){
      info.communities = req.body.communities;

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
    } else if(response.length === 0 && tableName === 'email'){
      console.log("IIIIIIIIIIIIIIII", req.body);
      info.emails_per_year = req.body.emails_per_year;

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
      res.send(false);
    }
  });
});



router.post('/tactics/delete', function(req, res) {
  console.log("++++++++++++++++++++++++++++++++++", req.body);
  var mediaPlanArr = [];
  var tacticInfo = req.body;
  var user = req.body.user_id;
  var mediaPlanId = req.body.media_plan_id;
  var table = req.body.tacticType;
  console.log(table);
  var mediaPlanIdentifiers = {
    'user_id': user,
    'media_plan_id': mediaPlanId,
  };
  console.log(req.body.tactic_id);
  knexDelete(table, tacticInfo)
    .then(function(response) {
      console.log('here', mediaPlanIdentifiers);
      // console.log(response);
      // RETRIEVE ALL TACTICS FOR EVERY ASPECT OF THIS MEDIA PLAN
      knexSelectTactics('ppc', mediaPlanIdentifiers).then(function(response) {
        mediaPlanArr.push(response);
      }).then(function(response) {
        knexSelectTactics('cpm', mediaPlanIdentifiers).then(function(response) {
          mediaPlanArr.push(response);
        }).then(function(response) {
          knexSelectTactics('listings', mediaPlanIdentifiers).then(function(response) {
            mediaPlanArr.push(response);
          }).then(function(response) {
            knexSelectTactics('email', mediaPlanIdentifiers).then(function(response) {
              mediaPlanArr.push(response);
            }).then(function(response) {
              knexSelectTactics('flat_fee', mediaPlanIdentifiers).then(function(response) {
                mediaPlanArr.push(response);
              }).then(function(response) {
                res.send(mediaPlanArr);
              });
            });
          });
        });
      });
    });
});

router.post('/tactics/edit', function(req, res) {
  console.log(req.body);
  var mediaPlanArr = [];
  var user = req.body.user_id;
  var mediaPlanId = req.body.media_plan_id;
  var table = req.body.tacticType;
  // var tacticInfo = {
  //   'user_id': user,
  //   'media_plan_id': mediaPlanId,
  //   'tactic_id': req.body.tactic_id,
  //   'provider_name': req.body.provider_name,
  //   'tactic_name': req.body.tactic_name,
  //   'monthly_spend': req.body.monthly_spend
  // };
  var tacticInfo = req.body;
  var mediaPlanIdentifiers = {
    'user_id': user,
    'media_plan_id': mediaPlanId,
  };
  delete tacticInfo.tacticType;
  // console.log('NEW TACTIC INFO!!! ', tacticInfo);

  knexEdit(table, tacticInfo)
    .then(function(response) {
      console.log('RESPONSE!!!: ', response);
      knexSelectTactics('ppc', mediaPlanIdentifiers).then(function(response) {
        mediaPlanArr.push(response);
      }).then(function(response) {
        knexSelectTactics('cpm', mediaPlanIdentifiers).then(function(response) {
          mediaPlanArr.push(response);
        }).then(function(response) {
          knexSelectTactics('listings', mediaPlanIdentifiers).then(function(response) {
            mediaPlanArr.push(response);
          }).then(function(response) {
            knexSelectTactics('email', mediaPlanIdentifiers).then(function(response) {
              mediaPlanArr.push(response);
            }).then(function(response) {
              knexSelectTactics('flat_fee', mediaPlanIdentifiers).then(function(response) {
                mediaPlanArr.push(response);
              }).then(function(response) {
                res.send(mediaPlanArr);
              });
            });
          });
        });
      });
    });
});

module.exports = router;
