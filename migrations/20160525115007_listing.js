
exports.up = function(knex, Promise) {
  return knex.schema.createTable('listings', function(table) {
    table.increments('tactic_id');
    table.integer('media_plan_id');
    table.integer('user_id');
    table.string('provider_name');
    table.string('tactic_name');
    table.decimal('monthly_spend');
    table.integer('communities');
    table.boolean('io_requested');
    table.boolean('io_received');
    table.boolean('io_signed');
    table.boolean('io_countersigned');
    table.boolean('creative_approved');
    table.boolean('creative_submitted');
    table.boolean('creative_live');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('listings');
};
