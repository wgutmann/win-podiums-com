#!/usr/bin/env node
/**
 * Pre-push check: run local tests; require at least 80% to pass before allowing push.
 * See docs/guides/development.md#run-tests-before-push
 *
 * Runs: API unit tests, and (if API is up) API smoke.
 * Exit 0 if passed >= ceil(0.8 * totalRun); exit 1 otherwise.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const http = require('http');

const REPO_ROOT = path.resolve(__dirname, '..');
const THRESHOLD = 0.8;

function runShell(cwd, shellCommand) {
  const isWindows = process.platform === 'win32';
  const result = spawnSync(isWindows ? 'cmd' : 'sh', isWindows ? ['/c', shellCommand] : ['-c', shellCommand], {
    cwd: cwd || REPO_ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  const ok = result.status === 0;
  if (!ok && result.stderr) process.stderr.write(result.stderr);
  return ok;
}

function apiHealthUp() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8787/api/health', { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (ch) => (data += ch));
      res.on('end', () => resolve(res.statusCode === 200 && data.includes('"ok"')));
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const results = [];
  const names = [];

  // 1. API unit tests
  names.push('API unit tests');
  results.push(runShell(path.join(REPO_ROOT, 'apps/api'), 'npm run test:unit'));

  // 2. API smoke (only if API is already up)
  const smokeUp = await apiHealthUp();
  if (smokeUp) {
    names.push('API smoke');
    results.push(runShell(path.join(REPO_ROOT, 'apps/api'), 'npm test'));
  }

  const passed = results.filter(Boolean).length;
  const total = results.length;
  const required = Math.ceil(THRESHOLD * total);

  for (let i = 0; i < names.length; i++) {
    console.log(results[i] ? `  ✓ ${names[i]}` : `  ✗ ${names[i]}`);
  }

  console.log('');
  if (passed >= required) {
    console.log(`Pre-push check: ${passed}/${total} passed (≥${required} required). Push allowed.`);
    process.exit(0);
  } else {
    console.error(`Pre-push check: ${passed}/${total} passed (need ≥${required}). Push blocked. Fix failures and try again.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
