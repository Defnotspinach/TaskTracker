import dotenv from 'dotenv';
import { initDatabase } from './db.js';
import { createApp } from './app.js';

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);
const JWT_SECRET = process.env.JWT_SECRET ?? 'tasktracker-development-secret';

const pool = await initDatabase();
const app = createApp(pool, { jwtSecret: JWT_SECRET });

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});