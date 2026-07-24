const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

function isRailwayRuntime() {
  return Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_PROJECT_ID);
}

function resolveDatabaseConfig() {
  if (isRailwayRuntime() && process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);

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

  return {
    username: isRailwayRuntime() ? (process.env.MYSQLUSER ?? process.env.DB_USER ?? 'root') : (process.env.DB_USER ?? 'root'),
    password: isRailwayRuntime() ? (process.env.MYSQLPASSWORD ?? process.env.DB_PASSWORD ?? '') : 'rootadmin',
    database: isRailwayRuntime() ? (process.env.MYSQLDATABASE ?? process.env.DB_NAME ?? 'task_tracker') : 'task_tracker',
    host: isRailwayRuntime()
      ? (process.env.MYSQLHOST ?? process.env.DB_HOST ?? 'localhost')
      : (process.env.DB_HOST && process.env.DB_HOST !== 'mysql.railway.internal' ? process.env.DB_HOST : 'localhost'),
    port: Number(isRailwayRuntime() ? (process.env.MYSQLPORT ?? process.env.DB_PORT ?? 3306) : (process.env.DB_PORT ?? 3306)),
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
