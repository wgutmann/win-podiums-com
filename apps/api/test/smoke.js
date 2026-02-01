/**
 * Smoke test: run against the Dockerized API (docker compose up -d).
 * Cases: health (ok + env dev), 404 (unknown route), 401 (protected route without auth).
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

  // 404: unknown API route
  res = await fetch(`${API_BASE}/api/nonexistent`);
  if (res.status !== 404) {
    console.error('Expected 404 for /api/nonexistent, got:', res.status);
    process.exit(1);
  }
  const notFoundBody = await res.json();
  if (notFoundBody.success !== false || notFoundBody.error !== 'not_found') {
    console.error('Expected { success: false, error: "not_found" }, got:', notFoundBody);
    process.exit(1);
  }
  console.log('Smoke test passed: 404 and error shape ok');

  // 401: protected route without Authorization
  res = await fetch(`${API_BASE}/api/plugin/verify`, { method: 'POST' });
  if (res.status !== 401) {
    console.error('Expected 401 for POST /api/plugin/verify without auth, got:', res.status);
    process.exit(1);
  }
  const unauthBody = await res.json();
  if (unauthBody.success !== false || unauthBody.error !== 'unauthorized') {
    console.error('Expected { success: false, error: "unauthorized" }, got:', unauthBody);
    process.exit(1);
  }
  console.log('Smoke test passed: 401 and error shape ok');
}

main();
