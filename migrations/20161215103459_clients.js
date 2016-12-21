
exports.up = function(knex, Promise) {
  return knex.schema.createTable('clients', function(table){
    table.increments('id');
    table.integer('user_fk').unsigned().references('users.id').onDelete('CASCADE');
    table.string('client_name');
    table.string('client_address');
    table.string('client_city');
    table.string('client_state');
    table.string('client_zip');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('clients');
};
