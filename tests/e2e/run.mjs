// Builds nothing: serves the existing dist/ with `astro preview` on :4322, runs the browser specs, stops the server.
import { spawn } from 'node:child_process';
const port = 4322;
const server = spawn('npx', ['astro', 'preview', '--port', String(port)], { shell: true, stdio: 'ignore' });
const ready = async () => { for (let i = 0; i < 60; i++) { try { await fetch(`http://localhost:${port}/`); return; } catch { await new Promise((r) => setTimeout(r, 500)); } } throw new Error('preview server did not start'); };
let code = 1;
try {
  await ready();
  code = await new Promise((res) => spawn('npx', ['vitest', 'run', '--config', 'vitest.e2e.config.ts', ...process.argv.slice(2)], { shell: true, stdio: 'inherit', env: { ...process.env, E2E_URL: `http://localhost:${port}` } }).on('exit', res));
} finally {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  else server.kill();
}
process.exit(code);
