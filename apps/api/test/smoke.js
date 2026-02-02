/**
 * Smoke test: run against the Dockerized API (docker compose up -d).
 * Validates: (1) Docker and Worker config match (health ok, env dev),
 * (2) GET /api/auth/config returns 200 and data.discordClientId (plugin dependency),
 * (3) POST /api/auth/discord/exchange with empty body returns 400,
 * (4) error shapes (404, 401), (5) API documentation loads (Swagger UI and OpenAPI spec).
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

  // 401: protected route without Authorization
  res = await fetch(`${API_BASE}/api/plugin/verify`, { method: 'POST' });
  const unauthBody = await res.json().catch(() => ({}));
  if (res.status !== 401) {
    console.error('Expected 401 for POST /api/plugin/verify without auth, got:', res.status);
    process.exit(1);
  }
  if (unauthBody.success !== false || unauthBody.error !== 'unauthorized') {
    console.error('Expected { success: false, error: "unauthorized" }, got:', unauthBody);
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

  // GET /api/auth/config — plugin calls this for Discord client ID; must return 200 and data shape
  res = await fetch(`${API_BASE}/api/auth/config`);
  if (!res.ok) {
    console.error('GET /api/auth/config failed:', res.status, res.statusText);
    process.exit(1);
  }
  const configBody = await res.json();
  if (!configBody.data || typeof configBody.data.discordClientId !== 'string') {
    console.error('Expected { data: { discordClientId: string } }, got:', configBody);
    process.exit(1);
  }

  // POST /api/auth/discord/exchange with missing body — must return 400 (bad_request)
  res = await fetch(`${API_BASE}/api/auth/discord/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (res.status !== 400) {
    console.error('POST /api/auth/discord/exchange with empty body: expected 400, got', res.status);
    process.exit(1);
  }
  const exchangeErr = await res.json().catch(() => ({}));
  if (exchangeErr.success !== false || exchangeErr.error !== 'bad_request') {
    console.error('Expected { success: false, error: "bad_request" }, got:', exchangeErr);
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

  // POST /api/auth/refresh without auth or with invalid token — must return 401
  res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer invalid_token' },
    body: '{}',
  });
  if (res.status !== 401) {
    console.error('POST /api/auth/refresh with invalid token: expected 401, got', res.status);
    process.exit(1);
  }
  res = await fetch(`${API_BASE}/api/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res.status !== 401) {
    console.error('POST /api/auth/refresh without Authorization: expected 401, got', res.status);
    process.exit(1);
  }

  console.log('Smoke test passed: API health ok, env=%s, API docs load, protected routes return 401 without auth', data.env);
}

main();
