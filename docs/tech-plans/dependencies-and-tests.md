# Dependencies and Test Coverage

**Status**: Living doc  
**Last updated**: 2026-01-31

## Dependency status

### API (`apps/api`)

| Check | Result |
|-------|--------|
| **npm audit** | 0 vulnerabilities (high/critical). CI: `npm audit --audit-level=high` in security workflow. |
| **Lockfile** | `package-lock.json` present; CI uses `npm ci` for reproducible installs. |
| **Outdated** | Optional: run `npm outdated` periodically. Wrangler and TypeScript are kept current via semver ranges. |

No blocking dependency issues. Keep running `npm audit` and `npm ci` in CI.

### Plugin (`apps/plugin`)

| Check | Result |
|-------|--------|
| **dotnet list package --vulnerable** | CI runs this in security workflow; fails if any vulnerable packages. |
| **Newtonsoft.Json** | 13.0.3 in use; CVE-2024-21907 fixed in 13.0.1+. No known vuln for 13.0.3. Bump to 13.0.4 when convenient. |

No blocking dependency issues. Dependabot may suggest minor bumps (e.g. Newtonsoft.Json 13.0.4); apply when appropriate.

### Root

No root `package.json`; monorepo is app-scoped (`apps/api`, `apps/plugin`). No root-level dependency issues.

---

## Test coverage

### Current

| Area | What exists | Gap |
|------|-------------|-----|
| **API smoke** | `apps/api/test/smoke.js`: GET /api/health, GET /api-docs, GET /api-docs/openapi.yaml. Runs in CI (worker-test.yml). | No coverage of auth/profile/heartbeat behavior. |
| **API unit** | None. | Session JWT and response helpers are untested. |
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

---

## CI

- **worker-test.yml**: Builds Docker API, runs `npm test` (smoke only). Extend when new tests are added (e.g. `npm run test:unit`).
- **security.yml**: TruffleHog, npm audit, dotnet vulnerable packages, CodeQL. No change needed for tests.
- New test scripts (e.g. `test:unit`) should be run in CI so that merge is blocked if tests fail.

---

## Related

- [ADR-006 Security Choices](../architecture/decisions/006-security-choices.md) — Test expectations for security-sensitive code.
- [Security skill](../../.cursor/skills/security/SKILL.md) — Test coverage checklist.
- [Development guide](../guides/development.md) — How to run API and tests locally.
