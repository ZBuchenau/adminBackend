
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments('id');
    table.string('first_name');
    table.string('last_name');
    table.string('username');
    table.string('password');
    table.string('email').unique();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
