/**
 * Smoke test: run against the Dockerized API (docker compose up -d).
 * Validates: (1) Docker and Worker config match (health ok, env dev),
 * (2) API documentation loads (Swagger UI and OpenAPI spec reachable).
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

  // API documentation loads: Swagger UI and OpenAPI spec must be reachable
  res = await fetch(`${API_BASE}/api-docs`);
  if (!res.ok) {
    console.error('API documentation failed to load:', res.status, res.statusText);
    process.exit(1);
  }
  const docsHtml = await res.text();
  if (!docsHtml.includes('swagger-ui') && !docsHtml.includes('WinPodiums')) {
    console.error('API documentation did not contain expected content');
    process.exit(1);
  }

  res = await fetch(`${API_BASE}/api-docs/openapi.yaml`);
  if (!res.ok) {
    console.error('OpenAPI spec failed to load:', res.status, res.statusText);
    process.exit(1);
  }
  const yaml = await res.text();
  if (!yaml.startsWith('openapi: 3')) {
    console.error('OpenAPI spec invalid (expected openapi: 3...)');
    process.exit(1);
  }

  // Protected routes must return 401 without auth (security-sensitive)
  res = await fetch(`${API_BASE}/api/profile/me`);
  if (res.status !== 401) {
    console.error('GET /api/profile/me without auth: expected 401, got', res.status);
    process.exit(1);
  }
  res = await fetch(`${API_BASE}/api/plugin/heartbeat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res.status !== 401) {
    console.error('POST /api/plugin/heartbeat without auth: expected 401, got', res.status);
    process.exit(1);
  }
  res = await fetch(`${API_BASE}/api/auth/token-exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'invalid' }),
  });
  if (res.status !== 401) {
    console.error('POST /api/auth/token-exchange with invalid token: expected 401, got', res.status);
    process.exit(1);
  }

  console.log('Smoke test passed: API health ok, env=%s, API docs load, protected routes return 401 without auth', data.env);
}

main();
