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

  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(191) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY users_email_unique (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        name VARCHAR(120) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY categories_user_name_unique (user_id, name),
        KEY categories_user_id_index (user_id),
        CONSTRAINT categories_user_fk
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        category_id BIGINT UNSIGNED NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NULL,
        status ENUM('todo', 'in-progress', 'hold', 'testing', 'done') NOT NULL DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
        due_date DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY tasks_user_id_index (user_id),
        KEY tasks_category_id_index (category_id),
        CONSTRAINT tasks_user_fk
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE,
        CONSTRAINT tasks_category_fk
          FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [users] = await connection.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
    const defaultUserId = users[0]?.id;

    if (!defaultUserId) {
      throw new Error('No users are available to migrate legacy task data.');
    }

    const [categoryColumns] = await connection.query('SHOW COLUMNS FROM categories');
    const categoryColumnNames = new Set(categoryColumns.map((column) => column.Field));

    if (!categoryColumnNames.has('user_id')) {
      await connection.query('ALTER TABLE categories ADD COLUMN user_id BIGINT UNSIGNED NULL AFTER id');
      await connection.query('UPDATE categories SET user_id = ? WHERE user_id IS NULL', [defaultUserId]);
      await connection.query('ALTER TABLE categories MODIFY COLUMN user_id BIGINT UNSIGNED NOT NULL');
    }

    const [taskColumns] = await connection.query('SHOW COLUMNS FROM tasks');
    const taskColumnMap = new Map(taskColumns.map((column) => [column.Field, column]));

    if (!taskColumnMap.has('priority')) {
      await connection.query(
        "ALTER TABLE tasks ADD COLUMN priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium' AFTER status",
      );
    }

    const taskStatusType = String(taskColumnMap.get('status')?.Type ?? '').toLowerCase();
    if (!taskStatusType.includes('todo') || !taskStatusType.includes('in-progress')) {
      await connection.query('ALTER TABLE tasks MODIFY COLUMN status VARCHAR(32) NOT NULL DEFAULT \'todo\'');
      await connection.query("UPDATE tasks SET status = 'todo' WHERE status IN ('pending', 'todo')");
      await connection.query("UPDATE tasks SET status = 'in-progress' WHERE status = 'in_progress'");
      await connection.query("UPDATE tasks SET status = 'done' WHERE status = 'completed'");
      await connection.query(
        "ALTER TABLE tasks MODIFY COLUMN status ENUM('todo', 'in-progress', 'hold', 'testing', 'done') NOT NULL DEFAULT 'todo'",
      );
    }

    await connection.query("UPDATE tasks SET priority = 'medium' WHERE priority IS NULL OR priority = ''");
  } finally {
    connection.release();
  }

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database has not been initialized.');
  }

  return pool;
}