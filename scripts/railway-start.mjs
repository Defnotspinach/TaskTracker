import { spawnSync } from 'node:child_process';

function hasProductionDatabaseConfig() {
  return Boolean(
    process.env.DATABASE_URL
    || process.env.MYSQL_URL
    || process.env.MYSQL_PUBLIC_URL
    || (process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLPASSWORD && process.env.MYSQLDATABASE)
    || (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME),
  );
}

function logDatabaseHint() {
  const vars = [];

  if (process.env.DATABASE_URL) vars.push('DATABASE_URL');
  if (process.env.MYSQL_URL) vars.push('MYSQL_URL');
  if (process.env.MYSQL_PUBLIC_URL) vars.push('MYSQL_PUBLIC_URL');
  if (process.env.MYSQLHOST) vars.push('MYSQLHOST');
  if (process.env.MYSQLUSER) vars.push('MYSQLUSER');
  if (process.env.MYSQLPASSWORD) vars.push('MYSQLPASSWORD');
  if (process.env.MYSQLDATABASE) vars.push('MYSQLDATABASE');

  if (vars.length > 0) {
    console.log(`Railway DB config detected via: ${vars.join(', ')}`);
  }
}

if (process.env.NODE_ENV !== 'production') {
  console.error('Railway start script is only intended for production. Use npm run dev locally.');
  process.exit(1);
}

if (!hasProductionDatabaseConfig()) {
  console.error('Missing Railway MySQL connection variables on the app service. Attach the Railway MySQL service to the app service so DATABASE_URL, MYSQL_URL, MYSQL_PUBLIC_URL, or MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE are available.');
  process.exit(1);
}

logDatabaseHint();

const migrateResult = spawnSync('npm', ['exec', '--', 'sequelize-cli', 'db:migrate'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

if (migrateResult.status !== 0) {
  process.exit(migrateResult.status ?? 1);
}

const serverResult = spawnSync('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(serverResult.status ?? 0);