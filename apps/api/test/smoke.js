/**
 * Smoke test: run against the Dockerized API (docker compose up -d).
 * Validates: (1) Docker and Worker config match (health ok, env dev),
 * (2) error shapes (404, 401), (3) API documentation loads (Swagger UI and OpenAPI spec).
 * Run from repo root: docker compose up -d && cd apps/api && npm test
 */
const API_BASE = process.env.API_BASE || 'http://localhost:8787';

// #region agent log
function agentLog(location, message, data, hypothesisId) {
  const payload = { location, message, data: data || {}, hypothesisId, timestamp: Date.now(), sessionId: 'debug-session' };
  fetch('http://127.0.0.1:7242/ingest/1d72bcc7-cc87-407b-8d82-421bf27576d3', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
}
// #endregion

async function main() {
  // #region agent log
  agentLog('smoke.js:main', 'smoke started', { API_BASE }, 'A,B');
  // #endregion
  let res;
  try {
    res = await fetch(`${API_BASE}/api/health`);
  } catch (err) {
    // #region agent log
    agentLog('smoke.js:health-fetch', 'health fetch threw', { error: String(err && err.message), API_BASE }, 'A,B');
    // #endregion
    console.error('Cannot reach API at', API_BASE);
    console.error('Start Docker first: docker compose up -d');
    process.exit(1);
  }

  // #region agent log
  agentLog('smoke.js:health-response', 'health response', { status: res.status, statusText: res.statusText, ok: res.ok }, 'A,B,C');
  // #endregion
  if (!res.ok) {
    console.error('Health check failed:', res.status, res.statusText);
    process.exit(1);
  }

  const data = await res.json();
  // #region agent log
  agentLog('smoke.js:health-json', 'health body', { dataOk: data?.ok, dataEnv: data?.env, fullData: data }, 'C');
  // #endregion
  if (data.ok !== true) {
    console.error('Expected { ok: true }, got:', data);
    process.exit(1);
  }
  if (data.env !== 'dev') {
    // #region agent log
    agentLog('smoke.js:env-check-fail', 'env not dev', { dataEnv: data.env }, 'C');
    // #endregion
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

  // #region agent log
  agentLog('smoke.js:done', 'smoke passed', { env: data.env }, 'A,B,C');
  // #endregion
  console.log('Smoke test passed: API health ok, env=%s, API docs load, protected routes return 401 without auth', data.env);
}

main();
