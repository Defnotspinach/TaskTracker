import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

function parseDatabaseUrl(databaseUrl) {
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

function resolveDatabaseConfig() {
  const production = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL ?? process.env.MYSQL_URL ?? process.env.MYSQL_PUBLIC_URL;

  if (databaseUrl) {
    return parseDatabaseUrl(databaseUrl);
  }

  if (production) {
    const host = process.env.MYSQLHOST ?? process.env.DB_HOST;
    const user = process.env.MYSQLUSER ?? process.env.DB_USER;
    const password = process.env.MYSQLPASSWORD ?? process.env.DB_PASSWORD;
    const database = process.env.MYSQLDATABASE ?? process.env.DB_NAME;

    if (!host || !user || !password || !database) {
      throw new Error('Missing production MySQL variables. Attach the Railway MySQL service to the app service so DATABASE_URL or MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE are available.');
    }

    return {
      host,
      port: Number(process.env.MYSQLPORT ?? process.env.DB_PORT ?? 3306),
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      dateStrings: true,
    };
  }

  const host = process.env.DB_HOST && process.env.DB_HOST !== 'mysql.railway.internal' ? process.env.DB_HOST : 'localhost';
  const port = Number(process.env.DB_PORT ?? 3306);
  const user = process.env.DB_USER ?? 'root';
  const password = 'rootadmin';
  const database = 'task_tracker';

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