
exports.up = function(knex, Promise) {
  return knex.schema.createTable('client_billing', function(table){
    table.increments('id');
    table.integer('client_fk').unsigned().references('clients.id').onDelete('CASCADE');
    table.string('billing_name');
    table.string('billing_address');
    table.string('billing_city');
    table.string('billing_state');
    table.string('billing_zip');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('client_billing');
};
