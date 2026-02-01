# Dependencies and Test Coverage

**Status**: Living doc  
**Last updated**: 2026-02-01

## Dependency status

### API (`apps/api`)

| Check | Result |
|-------|--------|
| **npm audit** | Run manually when needed (`npm audit --audit-level=high`). CI does not run audits yet. |
| **Lockfile** | `package-lock.json` present; CI uses `npm ci` for reproducible installs. |
| **Outdated** | Optional: run `npm outdated` periodically. Wrangler and TypeScript are kept current via semver ranges. |

No blocking dependency issues. CI uses `npm ci`; run `npm audit` manually when needed.

### Plugin (`apps/plugin`)

| Check | Result |
|-------|--------|
| **dotnet list package --vulnerable** | Run manually when needed; CI does not run audits yet. |
| **Newtonsoft.Json** | 13.0.3 in use; CVE-2024-21907 fixed in 13.0.1+. No known vuln for 13.0.3. Bump to 13.0.4 when convenient. |

No blocking dependency issues. Dependabot may suggest minor bumps (e.g. Newtonsoft.Json 13.0.4); apply when appropriate.

### Root

No root `package.json`; monorepo is app-scoped (`apps/api`, `apps/plugin`). No root-level dependency issues.

---

## Test coverage

### Current

| Area | What exists | Gap |
|------|-------------|-----|
| **API smoke** | `apps/api/test/smoke.js`: GET /api/health, GET /api-docs, GET /api-docs/openapi.yaml. Run locally with `npm test`; no CI workflow. | No coverage of auth/profile/heartbeat behavior. |
| **API unit** | Vitest in `test/required/` (response, session JWT) and `test/optional/`. Run order: required first; optional only if all required pass (`npm run test:unit`). | Add optional tests for non-critical or slower checks as needed. |
| **Plugin** | No test project. | Token storage, API client, auth flows untested. |

ADR-006 and the security skill require tests for auth, token exchange, profile, and heartbeat before merge.

### Tests to add (priority)

1. **API unit (session + response)**  
   - **session.ts**: `createSessionJWT` produces valid JWT; `verifySessionJWT` accepts valid token and rejects wrong secret, malformed token, expired token.  
   - **response.ts**: `jsonResponse` / `errorResponse` return correct status and JSON shape.  
   - Runner: Vitest (or Node `node:test`); runs in Node; no Worker env required for these units.

2. **API smoke (unauthenticated routes)**  
   - GET /api/profile/me without Authorization → 401.  
   - POST /api/plugin/heartbeat without Authorization → 401.  
   - POST /api/auth/token-exchange with invalid/missing token → 401.  
   - Ensures protected routes reject unauthenticated requests (no DB or Discord needed for these assertions).

3. **Plugin (later)**  
   - Unit tests for token storage and API client (mock HTTP); add when Phase 1 stabilizes or security review requests it.

### Test groups (required / optional)

Unit tests run in order by group:

1. **Required** (`test/required/**/*.test.ts`) — Core and security-sensitive behavior (e.g. response helpers, session JWT). Runs first.
2. **Optional** (`test/optional/**/*.test.ts`) — Runs only if all required tests pass (`vitest run test/required/ && vitest run test/optional/`). Use for non-critical or slower tests.

This avoids running optional tests when required ones already failed, saving time and keeping failure output focused.

---

## CI

- **security.yml**: TruffleHog secret scanning (verified only).
- **ci.yml**: API unit tests (`npm run test:unit`).

---

## Related

- [ADR-006 Security Choices](../architecture/decisions/006-security-choices.md) — Test expectations for security-sensitive code.
- [Security skill](../../.cursor/skills/security/SKILL.md) — Test coverage checklist.
- [Development guide](../guides/development.md) — How to run API and tests locally.
