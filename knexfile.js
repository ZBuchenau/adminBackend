// Update with your config settings.

require('dotenv').load();

module.exports = {

  development: {
    client: 'pg',
    connection: {
      database: process.env.DB_NAME,
      user: process.env.USER_NAME,
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'postgres://sqinpifqapcdhe:3A1YMds3H0I0cF-BYDk3tzOyxH@ec2-54-163-230-104.compute-1.amazonaws.com:5432/d1jn05vfkaonph/ssl=true',
      user:     process.env.USERNAME,
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
