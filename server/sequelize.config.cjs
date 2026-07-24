const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

function parseDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);

  return {
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    host: url.hostname,
    port: Number(url.port || 3306),
    dialect: 'mysql',
    logging: false,
  };
}

function resolveDatabaseConfig() {
  const production = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL ?? process.env.MYSQL_URL ?? process.env.MYSQL_PUBLIC_URL;

  if (databaseUrl) {
    return parseDatabaseUrl(databaseUrl);
  }

  if (production) {
    const username = process.env.MYSQLUSER ?? process.env.DB_USER;
    const password = process.env.MYSQLPASSWORD ?? process.env.DB_PASSWORD;
    const database = process.env.MYSQLDATABASE ?? process.env.DB_NAME;
    const host = process.env.MYSQLHOST ?? process.env.DB_HOST;

    if (!host || !username || !password || !database) {
      throw new Error('Missing production MySQL variables. Attach the Railway MySQL service to the app service so DATABASE_URL or MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE are available.');
    }

    return {
      username,
      password,
      database,
      host,
      port: Number(process.env.MYSQLPORT ?? process.env.DB_PORT ?? 3306),
      dialect: 'mysql',
      logging: false,
    };
  }

  return {
    username: process.env.DB_USER ?? 'root',
    password: 'rootadmin',
    database: 'task_tracker',
    host: 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: 'mysql',
    logging: false,
  };
}

const baseConfig = resolveDatabaseConfig();

module.exports = {
  development: baseConfig,
  test: {
    ...baseConfig,
    database: process.env.DB_NAME ?? 'task_tracker_test',
  },
  production: baseConfig,
};
