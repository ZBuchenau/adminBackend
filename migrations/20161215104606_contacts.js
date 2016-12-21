
exports.up = function(knex, Promise) {
  return knex.schema.createTable('client_contacts', function(table){
    table.increments('id');
    table.integer('client_fk').unsigned().references('clients.id').onDelete('CASCADE');
    table.string('contact_fn');
    table.string('contact_ln');
    table.string('contact_email').unique();
    table.string('contact_phone');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('client_contacts');
};
