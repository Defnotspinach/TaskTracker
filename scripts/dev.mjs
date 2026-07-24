import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeCommand = process.execPath;
const viteEntry = path.resolve(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');

const migrateResult = spawnSync(npmCommand, ['run', 'db:migrate'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

if (migrateResult.status !== 0) {
  process.exit(migrateResult.status ?? 1);
}

const serverProcess = spawn(nodeCommand, ['server/index.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

const clientProcess = spawn(nodeCommand, [viteEntry], {
  cwd: projectRoot,
  stdio: 'inherit',
});

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  serverProcess.kill();
  clientProcess.kill();
  process.exit(exitCode);
}

serverProcess.on('exit', (code) => {
  shutdown(code ?? 0);
});

clientProcess.on('exit', (code) => {
  shutdown(code ?? 0);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
