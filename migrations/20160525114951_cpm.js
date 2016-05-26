
exports.up = function(knex, Promise) {
  return knex.schema.createTable('cpm', function(table) {
    table.increments('cpm_id');
    table.integer('media_plan_id');
    table.string('provider_name');
    table.string('tactic_name');
    table.integer('impressions_contracted');
    table.decimal('monthly_spend');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('cpm');
};
