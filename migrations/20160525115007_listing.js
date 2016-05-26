
exports.up = function(knex, Promise) {
  return knex.schema.createTable('listings', function(table) {
    table.increments('listing_id');
    table.integer('media_plan_id');
    table.string('provider_name');
    table.string('tactic_name');
    table.decimal('monthly_spend');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('listings');
};
