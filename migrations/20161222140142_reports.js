
exports.up = function(knex, Promise) {
  return knex.schema.createTable('reports', function(table){
    table.increments('id');
    table.integer('client_fk').unsigned().references('clients.id').onDelete('CASCADE');
    table.integer('user_fk').unsigned().references('users.id').onDelete('CASCADE');
    table.string('report_name');
    table.string('complete_by');
    table.string('employee');
    table.string('comments', 250);
    table.boolean('part_1');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('reports');
};
