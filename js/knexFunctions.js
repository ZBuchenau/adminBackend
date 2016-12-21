// var express = require('express');
// var router = express.Router();
// var https = require('https');
// var jwt = require('jsonwebtoken');
var knex = require('../db/knex.js');
// var Q = require('q');

// ============================================================================
// EXPORTED KNEX FUNCTIONS
// ============================================================================

// Checks to see if a parameter (in the form of {xyz: abc}) exists in the database.
var checkExists = function(tableName, paramToCheck) {
  return knex(tableName)
    .returning('*')
    .where(paramToCheck);
};

// Insert an object into a table in the database
var insert = function(tableName, obj, ret) {
  return knex(tableName)
    .returning(ret)
    .insert(obj);
};

// Select something from the database
var select = function(tableName, obj) {
  return knex(tableName)
    .returning('*')
    .where(obj);
};


module.exports = {
  checkExists: checkExists,
  insert: insert,
  select: select
};
