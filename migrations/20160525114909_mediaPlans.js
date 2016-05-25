exports.up = function(knex, Promise) {
  return knex.schema.createTable('media_plan', function(table) {
    table.increments('media_plan_id');
    table.integer('user_id');
    table.string('name');
    table.decimal('monthly_budget', 2, 2);
    table.string('year');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('media_plan');
};
