import http from 'node:http';
import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import { createApp } from '../server/app.js';

async function startTestServer(app) {
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
  };
}

test('POST /api/auth/login rate limits repeated failures', async () => {
  const hashedPassword = await bcrypt.hash('correct-password', 12);
  const pool = {
    async query(sql) {
      if (String(sql).includes('SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1')) {
        return [[{
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
        }]];
      }

      throw new Error(`Unexpected query in test: ${sql}`);
    },
  };

  const app = createApp(pool, {
    jwtSecret: 'test-secret',
    loginAttemptLimit: 5,
    loginWindowMs: 60_000,
  });

  const { server, baseUrl } = await startTestServer(app);

  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong-password' }),
      });

      assert.equal(response.status, 401);
      const payload = await response.json();
      assert.equal(payload.error, 'Invalid email or password.');
    }

    const blocked = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong-password' }),
    });

    assert.equal(blocked.status, 429);
    const payload = await blocked.json();
    assert.equal(payload.error, 'Too many login attempts. Please try again later.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
