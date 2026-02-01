/**
 * Smoke test: run against the Dockerized API (docker compose up -d).
 * Validates that Docker and Worker config match (health returns ok + env dev).
 * Run from repo root: docker compose up -d && cd apps/api && npm test
 */
const API_BASE = process.env.API_BASE || 'http://localhost:8787';

async function main() {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/health`);
  } catch (err) {
    console.error('Cannot reach API at', API_BASE);
    console.error('Start Docker first: docker compose up -d');
    process.exit(1);
  }

  if (!res.ok) {
    console.error('Health check failed:', res.status, res.statusText);
    process.exit(1);
  }

  const data = await res.json();
  if (data.ok !== true) {
    console.error('Expected { ok: true }, got:', data);
    process.exit(1);
  }
  if (data.env !== 'dev') {
    console.error('Expected env "dev" (Docker/Worker config match), got:', data.env);
    process.exit(1);
  }

  console.log('Smoke test passed: API health ok, env=%s', data.env);
}

main();
