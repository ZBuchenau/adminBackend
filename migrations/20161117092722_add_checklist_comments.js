
exports.up = function(knex, Promise) {
  return knex.schema.table('media_plan', function(table) {
        table.string('checklist_comments', 500);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('media_plan', function(table) {
        table.dropColumn('checklist_comments');
    });
};
