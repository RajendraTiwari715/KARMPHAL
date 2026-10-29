import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m[Karmphal]\x1b[0m Starting backend (port 5000) and web frontend (port 5173)...');

const backend = spawn(npmCmd, ['--prefix', 'karmphal-backend', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

const web = spawn(npmCmd, ['--prefix', 'karmphal-web', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n\x1b[33m[Karmphal]\x1b[0m Stopping development servers...');
  try { backend.kill('SIGINT'); } catch {}
  try { web.kill('SIGINT'); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
