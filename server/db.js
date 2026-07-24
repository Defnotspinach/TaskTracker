import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

function isRailwayRuntime() {
  return Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_PROJECT_ID);
}

function resolveDatabaseConfig() {
  const railwayRuntime = isRailwayRuntime();
  const databaseUrl = railwayRuntime ? process.env.DATABASE_URL : null;

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      dateStrings: true,
    };
  }

  const host = railwayRuntime
    ? (process.env.MYSQLHOST ?? process.env.DB_HOST ?? 'localhost')
    : (process.env.DB_HOST && process.env.DB_HOST !== 'mysql.railway.internal' ? process.env.DB_HOST : 'localhost');
  const port = Number(railwayRuntime ? (process.env.MYSQLPORT ?? process.env.DB_PORT ?? 3306) : (process.env.DB_PORT ?? 3306));
  const user = railwayRuntime ? (process.env.MYSQLUSER ?? process.env.DB_USER ?? 'root') : (process.env.DB_USER ?? 'root');
  const password = railwayRuntime ? (process.env.MYSQLPASSWORD ?? process.env.DB_PASSWORD ?? '') : 'rootadmin';
  const database = railwayRuntime
    ? (process.env.MYSQLDATABASE ?? process.env.DB_NAME ?? 'task_tracker')
    : 'task_tracker';

  return {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    dateStrings: true,
  };
}

const baseConfig = resolveDatabaseConfig();

let pool;

async function ensureDatabase(config) {
  const admin = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });

  try {
    await admin.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    await admin.end();
  }
}

export async function initDatabase() {
  if (pool) return pool;

  await ensureDatabase(baseConfig);

  pool = mysql.createPool(baseConfig);

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database has not been initialized.');
  }

  return pool;
}