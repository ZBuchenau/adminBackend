
exports.up = function(knex, Promise) {
  return knex.schema.createTable('client_billing', function(table){
    table.increments('id');
    table.string('entity_name');
    table.string('entity_address');
    table.string('entity_city');
    table.string('entity_state');
    table.string('entity_zip');
    table.integer('client_id').unsigned().references('clients.id').onDelete('CASCADE');
  }); 
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('client_billing');
};
