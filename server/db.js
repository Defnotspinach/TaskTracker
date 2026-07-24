import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const baseConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'task_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  dateStrings: true,
};

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