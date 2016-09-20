// Update with your config settings.

require('dotenv').load();

module.exports = {

  development: {
    client: 'pg',
    connection: {
      database: process.env.DB_NAME,
      user: process.env.USER_NAME,
    }
  },

  production: {
    client: 'pg',
    connection: {
      database: process.env.DATABASE_URL,
      user: process.env.USER,
      password: process.env.PASSWORD 
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
