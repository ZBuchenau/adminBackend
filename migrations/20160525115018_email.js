
exports.up = function(knex, Promise) {
  return knex.schema.createTable('email', function(table) {
    table.increments('email_id');
    table.integer('media_plan_id');
    table.string('provider_name');
    table.string('tactic_name');
    table.decimal('monthly_spend');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('email');
};
