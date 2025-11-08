require('dotenv').config();

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'socialfeed',
    charset: 'utf8mb4',
    multipleStatements: true
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000, // 30 seconds to acquire connection
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    propagateCreateError: false // Don't crash on connection errors in tests
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  }
};

module.exports = knexConfig;
