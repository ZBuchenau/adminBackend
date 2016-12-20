
exports.up = function(knex, Promise) {
  return knex.schema.createTable('client_contacts', function(table){
    table.increments('id');
    table.string('first_name');
    table.string('last_name');
    table.string('email');
    table.string('phone');
    table.integer('client_id').unsigned().references('clients.id').onDelete('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('client_contacts');
};
