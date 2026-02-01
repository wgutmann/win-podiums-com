# Security Skill — Examples

Concrete scenarios for applying the security skill and ADR-006.

## 1. Adding a new secret or env var

**Scenario**: The API needs a new secret (e.g. a third-party API key).

**Steps**:

1. Add the variable to `apps/api/.dev.vars.example` with a placeholder (e.g. `NEW_SERVICE_API_KEY=your_key_here`). Do **not** add the real value.
2. Document in README or deployment guide: "Set `NEW_SERVICE_API_KEY` in `.dev.vars` (local) or in Cloudflare Secrets / GitHub Secrets (deploy)."
3. Ensure `.gitignore` already ignores `.dev.vars` and `.dev.vars.*`. If the secret could appear in another file type, add that pattern to `.gitignore`.
4. In CI, if the new secret is required for a test: use a placeholder in the workflow (e.g. env var with placeholder value); never store production secrets in CI config.
5. Update ADR-006 or SECURITY.md if this introduces a new category of secret (e.g. "Third-party API keys: never commit; use Workers secrets or env only").

**Do not**: Commit `.dev.vars` with the real key; add the key to the repo "temporarily"; disable TruffleHog for a path that contains the key.

---

## 2. Adding a new API route (security-sensitive)

**Scenario**: Adding a new endpoint that accepts a token or user input (e.g. `POST /api/something` with auth).

**Steps**:

1. **Auth**: Require a valid session or Bearer token per existing auth pattern. Use least-privilege; do not expose more data than needed.
2. **Input**: Validate and sanitize input; use rate limiting if the route is high-value (e.g. token exchange, profile update).
3. **Tests**: Add a smoke test or unit test that hits the new route (with a placeholder token or mock). See [apps/api/test/smoke.js](../../../apps/api/test/smoke.js). Do not merge without test coverage for the new path.
4. **Docs**: Update [docs/api/](../../../docs/api/) (OpenAPI or README) so the route and auth are documented.
5. **ADR-006**: If the route introduces a new security pattern (e.g. new rate limit), consider documenting it in ADR-006 or the API README.

**Do not**: Add a route that bypasses auth; skip tests "for now"; commit secrets used in tests.

---

## 3. CI failed: TruffleHog found a secret

**Scenario**: Security workflow fails with "Secret detected".

**Steps**:

1. **Do not** add an exclusion for the path unless the finding is a false positive (e.g. example string that looks like a key but is not). Prefer removing or redacting the string.
2. If a real secret was committed: **rotate or revoke** the key immediately (Discord, Cloudflare, etc.). Assume the key is compromised.
3. Remove the secret from the commit history (e.g. `git filter-branch` or BFG, or amend if it was the last commit and not pushed). Prefer force-push only on a branch that has not been merged; if already on main, rotate the key and remove in a new commit (history may still be visible).
4. Update [SECURITY.md](../../../SECURITY.md) or runbook if needed (e.g. "If X key was exposed, rotate in Y dashboard").
5. Re-run CI; it should pass after the secret is removed and keys rotated.

**Do not**: Disable the TruffleHog step; add the secret to a "allowlist"; push again with the same secret.

---

## 4. CI failed: npm audit or dotnet vulnerable packages

**Scenario**: Security workflow fails on dependency audit.

**Steps**:

1. Run locally: `cd apps/api && npm audit` or `cd apps/plugin/WinPodiums.Plugin && dotnet list package --vulnerable --include-transitive`. Fix by upgrading or replacing the vulnerable package.
2. If a fix is not yet available: Document the exception (e.g. in a ticket or ADR) and add a temporary override only if the risk is accepted and tracked. Prefer upgrading or removing the dependency.
3. Re-run CI after updating dependencies.

**Do not**: Disable the audit step; ignore high/critical vulnerabilities without a documented exception.

---

## 5. Ensuring test coverage for auth/heartbeat

**Scenario**: You added or changed auth or heartbeat logic and want to ensure coverage.

**Steps**:

1. **API**: Smoke test should hit health and, if possible, at least one auth-related path (e.g. redirect or stub). Add a smoke test for new auth or heartbeat endpoints: e.g. `GET /api/health`, `POST /api/plugin/heartbeat` with a placeholder token (expect 401 or 200 depending on design). See [smoke.js](../../../apps/api/test/smoke.js); run locally with Docker and `npm test`.
2. **Plugin**: For token storage or API client, add unit tests that mock the API and assert correct headers, retries, or error handling. Prefer tests for any code that handles tokens or secrets.
3. **CI**: Ensure `npm test` (API) and Security/CI workflows pass. Do not merge without running tests locally.

**Do not**: Merge auth or heartbeat changes with no tests; assume "manual testing is enough."

---

## 6. Configuring Cloudflare security (deploy)

**Scenario**: Setting up the domain and Worker in Cloudflare for the first time.

**Steps**:

1. **Proxy**: Ensure DNS is proxied (orange cloud) so traffic goes through Cloudflare.
2. **SSL**: Set SSL/TLS mode to Full or Full (Strict).
3. **WAF**: Enable the free managed ruleset in Security → WAF.
4. **Bot Fight Mode**: Enable for the zone or hostnames.
5. **Security Level**: Set to Medium or High as appropriate; use Under Attack mode during incidents if needed.
6. **Secrets**: Store production secrets in Cloudflare Workers secrets (wrangler secret) or env; never in repo.
7. Align to [PRD-006](../../../docs/product/cloudflare-security/001-free-cloudflare-security.md); no paid add-ons for baseline unless approved.

**Do not**: Turn off proxy for "simplicity"; leave SSL in Flexible if the origin supports Full; commit production secrets to the repo.
