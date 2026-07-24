const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const baseConfig = {
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'task_tracker',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: baseConfig,
  test: {
    ...baseConfig,
    database: process.env.DB_NAME ?? 'task_tracker_test',
  },
  production: baseConfig,
};
