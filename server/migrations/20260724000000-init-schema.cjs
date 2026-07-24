'use strict';

const { QueryTypes } = require('sequelize');

const USER_TABLE = 'users';
const CATEGORY_TABLE = 'categories';
const TASK_TABLE = 'tasks';

async function showColumns(queryInterface, tableName) {
  return queryInterface.sequelize.query(`SHOW COLUMNS FROM ${tableName}`, { type: QueryTypes.SELECT });
}

function columnNames(columns) {
  return new Set(columns.map((column) => column.Field));
}

async function ensureUsersTable(queryInterface) {
  await queryInterface.sequelize.query(`
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
}

async function ensureCategoriesTable(queryInterface) {
  await queryInterface.sequelize.query(`
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
}

async function ensureTasksTable(queryInterface) {
  await queryInterface.sequelize.query(`
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
}

module.exports = {
  async up(queryInterface) {
    await ensureUsersTable(queryInterface);
    await ensureCategoriesTable(queryInterface);
    await ensureTasksTable(queryInterface);

    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users ORDER BY id ASC LIMIT 1',
      { type: QueryTypes.SELECT },
    );
    const defaultUserId = users[0]?.id ?? null;

    const categoryColumns = columnNames(await showColumns(queryInterface, CATEGORY_TABLE));
    if (!categoryColumns.has('user_id')) {
      await queryInterface.sequelize.query('ALTER TABLE categories ADD COLUMN user_id BIGINT UNSIGNED NULL AFTER id');
      if (defaultUserId) {
        await queryInterface.sequelize.query(
          'UPDATE categories SET user_id = :userId WHERE user_id IS NULL',
          { replacements: { userId: defaultUserId } },
        );
      }
      await queryInterface.sequelize.query('ALTER TABLE categories MODIFY COLUMN user_id BIGINT UNSIGNED NOT NULL');
    }

    const taskColumns = await showColumns(queryInterface, TASK_TABLE);
    const taskColumnSet = columnNames(taskColumns);

    if (!taskColumnSet.has('priority')) {
      await queryInterface.sequelize.query(
        "ALTER TABLE tasks ADD COLUMN priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium' AFTER status",
      );
    }

    await queryInterface.sequelize.query("UPDATE tasks SET status = 'todo' WHERE status IN ('pending', 'todo')");
    await queryInterface.sequelize.query("UPDATE tasks SET status = 'in-progress' WHERE status = 'in_progress'");
    await queryInterface.sequelize.query("UPDATE tasks SET status = 'done' WHERE status = 'completed'");
    await queryInterface.sequelize.query(
      "ALTER TABLE tasks MODIFY COLUMN status ENUM('todo', 'in-progress', 'hold', 'testing', 'done') NOT NULL DEFAULT 'todo'",
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE tasks MODIFY COLUMN priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium'",
    );
    await queryInterface.sequelize.query("UPDATE tasks SET priority = 'medium' WHERE priority IS NULL OR priority = ''");
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS tasks');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS categories');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS users');
  },
};
