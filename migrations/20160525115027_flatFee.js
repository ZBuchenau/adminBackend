
exports.up = function(knex, Promise) {
  return knex.schema.createTable('flat_fee', function(table) {
    table.increments('flat_fee_id');
    table.integer('media_plan_id');
    table.string('provider_name');
    table.string('tactic_name');
    table.decimal('monthly_spend', 2, 2);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('flat_fee');
};
