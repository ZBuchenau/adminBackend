exports.up = function(knex, Promise) {
  return knex.schema.createTable('ppc', function(table) {
    table.increments('tactic_id');
    table.integer('media_plan_id');
    table.integer('user_id');
    table.string('provider_name');
    table.string('tactic_name');
    table.decimal('monthly_spend');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ppc');
};
