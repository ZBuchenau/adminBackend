
exports.up = function(knex, Promise) {
  return knex.schema.createTable('clients', function(table){
    table.increments('id');
    table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE');
    table.string('name');
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('zip');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('clients');
};
