import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function getAvatar(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatUser(row) {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    avatar: getAvatar(row.name),
  };
}

function formatTask(row) {
  return {
    id: Number(row.id),
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    category: row.category_name ?? 'Uncategorized',
    categoryId: row.category_id ? Number(row.category_id) : null,
  };
}

function isValidStatus(status) {
  return ['todo', 'in-progress', 'hold', 'testing', 'done'].includes(status);
}

function isValidPriority(priority) {
  return ['low', 'medium', 'high', 'critical'].includes(priority);
}

function parsePositiveInt(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function createLoginThrottle({ limit, windowMs }) {
  const attempts = new Map();

  function getKey(req, email = '') {
    return `${req.ip}:${String(email).trim().toLowerCase()}`;
  }

  function getEntry(key) {
    const now = Date.now();
    const entry = attempts.get(key);
    if (!entry) {
      return null;
    }

    if (entry.resetAt <= now) {
      attempts.delete(key);
      return null;
    }

    return entry;
  }

  return {
    getKey,
    isBlocked(key) {
      const entry = getEntry(key);
      return Boolean(entry && entry.count >= limit);
    },
    recordFailure(key) {
      const now = Date.now();
      const entry = getEntry(key);
      if (!entry) {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return;
      }

      attempts.set(key, { count: entry.count + 1, resetAt: entry.resetAt });
    },
    clear(key) {
      attempts.delete(key);
    },
  };
}

function createResetTokenStore({ ttlMs }) {
  const tokens = new Map();

  return {
    create(userId) {
      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = Date.now() + ttlMs;
      tokens.set(token, { userId: Number(userId), expiresAt });
      return { token, expiresAt };
    },
    consume(token) {
      const record = tokens.get(token);
      if (!record) {
        return null;
      }

      if (record.expiresAt <= Date.now()) {
        tokens.delete(token);
        return null;
      }

      tokens.delete(token);
      return record;
    },
  };
}

async function resolveCategoryId(pool, userId, categoryId, categoryName) {
  if (categoryId) {
    const [rows] = await pool.query(
      'SELECT id FROM categories WHERE id = ? AND user_id = ? LIMIT 1',
      [categoryId, userId],
    );

    if (rows.length === 0) {
      throw new ApiError(400, 'Category not found');
    }

    return Number(rows[0].id);
  }

  if (categoryName) {
    const [rows] = await pool.query(
      'SELECT id FROM categories WHERE user_id = ? AND name = ? LIMIT 1',
      [userId, categoryName],
    );

    if (rows.length === 0) {
      throw new ApiError(400, 'Category not found');
    }

    return Number(rows[0].id);
  }

  throw new ApiError(400, 'Category is required');
}

export function createApp(pool, options = {}) {
  const jwtSecret = options.jwtSecret ?? process.env.JWT_SECRET ?? 'tasktracker-development-secret';
  const loginThrottle = createLoginThrottle({
    limit: options.loginAttemptLimit ?? 5,
    windowMs: options.loginWindowMs ?? 15 * 60 * 1000,
  });
  const resetTokens = createResetTokenStore({
    ttlMs: options.resetTokenTtlMs ?? 30 * 60 * 1000,
  });

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api', (_req, res) => {
    res.json({ status: 'ok', message: 'TaskTracker API is running.' });
  });

  function requireAuth(req, _res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
      req.userId = Number(payload.userId);
      return next();
    } catch {
      return next(new ApiError(401, 'Unauthorized'));
    }
  }

  app.get('/api/health', asyncHandler(async (_req, res) => {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  }));

  app.post('/api/auth/register', asyncHandler(async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
    );

    const user = {
      id: Number(result.insertId),
      name,
      email,
      avatar: getAvatar(name),
    };

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  }));

  app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    const rateLimitKey = loginThrottle.getKey(req, email);

    if (loginThrottle.isBlocked(rateLimitKey)) {
      throw new ApiError(429, 'Too many login attempts. Please try again later.');
    }

    if (!email || !password) {
      loginThrottle.recordFailure(rateLimitKey);
      throw new ApiError(400, 'Email and password are required');
    }

    const [rows] = await pool.query('SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1', [email]);
    const userRow = rows[0];

    if (!userRow) {
      loginThrottle.recordFailure(rateLimitKey);
      throw new ApiError(401, 'Invalid email or password.');
    }

    const matches = await bcrypt.compare(password, userRow.password);
    if (!matches) {
      loginThrottle.recordFailure(rateLimitKey);
      throw new ApiError(401, 'Invalid email or password.');
    }

    loginThrottle.clear(rateLimitKey);

    const user = formatUser(userRow);
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, user });
  }));

  app.post('/api/auth/password-reset/request', asyncHandler(async (req, res) => {
    const { email } = req.body ?? {};

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    const [rows] = await pool.query('SELECT id, name, email FROM users WHERE email = ? LIMIT 1', [email]);
    const userRow = rows[0];

    if (!userRow) {
      return res.json({ message: 'If the account exists, a reset token has been generated.' });
    }

    const { token, expiresAt } = resetTokens.create(userRow.id);
    res.json({
      message: 'If the account exists, a reset token has been generated.',
      resetToken: token,
      expiresAt,
      user: formatUser(userRow),
    });
  }));

  app.post('/api/auth/password-reset/confirm', asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body ?? {};

    if (!token || !newPassword) {
      throw new ApiError(400, 'Reset token and new password are required');
    }

    const record = resetTokens.consume(token);
    if (!record) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, record.userId]);

    res.json({ message: 'Password has been reset.' });
  }));

  app.get('/api/auth/me', requireAuth, asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ? LIMIT 1', [req.userId]);
    const userRow = rows[0];

    if (!userRow) {
      throw new ApiError(404, 'User not found');
    }

    res.json(formatUser(userRow));
  }));

  app.get('/api/categories', requireAuth, asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      'SELECT id, name FROM categories WHERE user_id = ? ORDER BY name ASC',
      [req.userId],
    );

    res.json(rows.map((row) => ({ id: Number(row.id), name: row.name })));
  }));

  app.post('/api/categories', requireAuth, asyncHandler(async (req, res) => {
    const { name } = req.body ?? {};

    if (!name || !name.trim()) {
      throw new ApiError(400, 'Category name is required');
    }

    const trimmedName = name.trim();
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE user_id = ? AND name = ? LIMIT 1',
      [req.userId, trimmedName],
    );

    if (existing.length > 0) {
      throw new ApiError(409, 'Category already exists.');
    }

    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name) VALUES (?, ?)',
      [req.userId, trimmedName],
    );

    res.status(201).json({ id: Number(result.insertId), name: trimmedName });
  }));

  app.put('/api/categories/:id', requireAuth, asyncHandler(async (req, res) => {
    const categoryId = Number.parseInt(req.params.id, 10);
    const { name } = req.body ?? {};

    if (!Number.isInteger(categoryId)) {
      throw new ApiError(400, 'Invalid category id');
    }

    if (!name || !name.trim()) {
      throw new ApiError(400, 'Category name is required');
    }

    const trimmedName = name.trim();
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE user_id = ? AND name = ? AND id <> ? LIMIT 1',
      [req.userId, trimmedName, categoryId],
    );

    if (existing.length > 0) {
      throw new ApiError(409, 'Category name already in use.');
    }

    const [result] = await pool.query(
      'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
      [trimmedName, categoryId, req.userId],
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({ id: categoryId, name: trimmedName });
  }));

  app.delete('/api/categories/:id', requireAuth, asyncHandler(async (req, res) => {
    const categoryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(categoryId)) {
      throw new ApiError(400, 'Invalid category id');
    }

    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [categoryId, req.userId],
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Category not found');
    }

    res.json({ success: true });
  }));

  app.get('/api/tasks', requireAuth, asyncHandler(async (req, res) => {
    const { status, category_id: categoryIdQuery, search, page, limit, sort = 'dueDate' } = req.query;
    const clauses = ['t.user_id = ?'];
    const params = [req.userId];
    const sortKey = String(sort).toLowerCase();
    const orderDirection = String(req.query.order ?? 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    if (status) {
      clauses.push('t.status = ?');
      params.push(status);
    }

    if (categoryIdQuery) {
      clauses.push('t.category_id = ?');
      params.push(Number.parseInt(categoryIdQuery, 10));
    }

    if (search) {
      clauses.push('t.title LIKE ?');
      params.push(`%${search}%`);
    }

    const sortClause = sortKey === 'status'
      ? `FIELD(t.status, 'todo', 'in-progress', 'hold', 'testing', 'done') ${orderDirection}, t.due_date ASC, t.id DESC`
      : `t.due_date ${orderDirection}, t.id DESC`;

    let sql = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.category_id,
        c.name AS category_name
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY ${sortClause}
    `;

    const limitValue = parsePositiveInt(limit);
    const pageValue = parsePositiveInt(page);

    if (limitValue) {
      sql += ' LIMIT ?';
      params.push(limitValue);

      if (pageValue) {
        sql += ' OFFSET ?';
        params.push((pageValue - 1) * limitValue);
      }
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(formatTask));
  }));

  app.get('/api/tasks/:id', requireAuth, asyncHandler(async (req, res) => {
    const taskId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(taskId)) {
      throw new ApiError(400, 'Invalid task id');
    }

    const [rows] = await pool.query(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.due_date,
          t.category_id,
          c.name AS category_name
        FROM tasks t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.id = ? AND t.user_id = ?
        LIMIT 1
      `,
      [taskId, req.userId],
    );

    const taskRow = rows[0];
    if (!taskRow) {
      throw new ApiError(404, 'Task not found');
    }

    res.json(formatTask(taskRow));
  }));

  app.post('/api/tasks', requireAuth, asyncHandler(async (req, res) => {
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      dueDate,
      category,
      category_id: categoryId,
    } = req.body ?? {};

    if (!title || !title.trim()) {
      throw new ApiError(400, 'Title is required');
    }

    if (!dueDate) {
      throw new ApiError(400, 'Due date is required');
    }

    if (!isValidStatus(status)) {
      throw new ApiError(400, 'Invalid status');
    }

    if (!isValidPriority(priority)) {
      throw new ApiError(400, 'Invalid priority');
    }

    const resolvedCategoryId = await resolveCategoryId(pool, req.userId, categoryId, category);

    const [result] = await pool.query(
      `
        INSERT INTO tasks (user_id, category_id, title, description, status, priority, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [req.userId, resolvedCategoryId, title.trim(), description, status, priority, dueDate],
    );

    const [rows] = await pool.query(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.due_date,
          t.category_id,
          c.name AS category_name
        FROM tasks t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.id = ? AND t.user_id = ?
        LIMIT 1
      `,
      [result.insertId, req.userId],
    );

    res.status(201).json(formatTask(rows[0]));
  }));

  app.put('/api/tasks/:id', requireAuth, asyncHandler(async (req, res) => {
    const taskId = Number.parseInt(req.params.id, 10);
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      category,
      category_id: categoryId,
    } = req.body ?? {};

    if (!Number.isInteger(taskId)) {
      throw new ApiError(400, 'Invalid task id');
    }

    const [existingRows] = await pool.query(
      'SELECT id, category_id, title, description, status, priority, due_date FROM tasks WHERE id = ? AND user_id = ? LIMIT 1',
      [taskId, req.userId],
    );

    const existing = existingRows[0];
    if (!existing) {
      throw new ApiError(404, 'Task not found');
    }

    const nextTitle = title !== undefined ? title.trim() : existing.title;
    const nextDescription = description !== undefined ? description : existing.description;
    const nextStatus = status !== undefined ? status : existing.status;
    const nextPriority = priority !== undefined ? priority : existing.priority;
    const nextDueDate = dueDate !== undefined ? dueDate : existing.due_date;

    if (!nextTitle) {
      throw new ApiError(400, 'Title is required');
    }

    if (!isValidStatus(nextStatus)) {
      throw new ApiError(400, 'Invalid status');
    }

    if (!isValidPriority(nextPriority)) {
      throw new ApiError(400, 'Invalid priority');
    }

    const nextCategoryId = category !== undefined || categoryId !== undefined
      ? await resolveCategoryId(pool, req.userId, categoryId, category)
      : existing.category_id;

    const [result] = await pool.query(
      `
        UPDATE tasks
        SET category_id = ?, title = ?, description = ?, status = ?, priority = ?, due_date = ?
        WHERE id = ? AND user_id = ?
      `,
      [nextCategoryId, nextTitle, nextDescription, nextStatus, nextPriority, nextDueDate, taskId, req.userId],
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Task not found');
    }

    const [rows] = await pool.query(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.due_date,
          t.category_id,
          c.name AS category_name
        FROM tasks t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.id = ? AND t.user_id = ?
        LIMIT 1
      `,
      [taskId, req.userId],
    );

    res.json(formatTask(rows[0]));
  }));

  app.delete('/api/tasks/:id', requireAuth, asyncHandler(async (req, res) => {
    const taskId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(taskId)) {
      throw new ApiError(400, 'Invalid task id');
    }

    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.userId],
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Task not found');
    }

    res.json({ success: true });
  }));

  app.use((err, _req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof ApiError) {
      return res.status(err.status).json({ error: err.message });
    }

    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Duplicate entry.' });
    }

    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
