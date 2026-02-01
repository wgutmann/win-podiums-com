---
name: security
description: Applies security-minded thinking and test-coverage expectations for WinPodiums. Use when implementing auth, handling secrets, adding API endpoints, configuring Cloudflare security, writing or reviewing CI, or ensuring tests cover security-sensitive code. References ADR-006 (security choices), SECURITY.md, PRD-006, and CI workflows.
---

# Security and Test Coverage

## Quick Start

Use this skill when the user asks about **security**, **secrets**, **auth**, **rate limiting**, **CI security**, **test coverage**, or when implementing **new API routes**, **OAuth flows**, or **plugin token handling**.

**Flow**: (1) Check [ADR-006: Security Choices](../../../docs/architecture/decisions/006-security-choices.md) for the canonical security decisions. (2) Apply the checklists below. (3) Ensure security-sensitive code has test coverage before merge.

**ContextStream (when available):** Before changing auth, secrets, or CI, use ContextStream `search` for "security", "secrets", "OAuth", "rate limit". After adding a security-related decision, capture it in ContextStream and consider adding it to ADR-006 or the bootstrap table in development.md.

## Scope

- **In scope**: Secrets and credentials hygiene, OAuth and auth security, Cloudflare free security (PRD-006), rate limiting, CI security (secret scan, dependency audit, SAST), test coverage for security-sensitive paths.
- **Out of scope**: Full anti-cheat and Telemetry Proof (Phase 2+); see [Security & Anti-Cheat LLD](../../../docs/design/security-anticheat.md). Branch protection and PR governance (see github-change-control skill).

## Canonical Security Document

**[docs/architecture/decisions/006-security-choices.md](../../../docs/architecture/decisions/006-security-choices.md)** — Single source of truth for:

1. **Secrets and credentials** — Never commit; .gitignore; rotate if exposed; CI placeholders only.
2. **Edge and application security** — Cloudflare free only (proxy, SSL, WAF, Bot Fight, Security Level); rate limiting in Workers; HTTPS only; OAuth least-privilege.
3. **Deferred (Phase 2+)** — Full anti-cheat, Telemetry Proof.
4. **CI security** — TruffleHog, npm/dotnet audits, CodeQL.
5. **Test coverage** — Smoke tests for API; tests required for auth, token, profile, heartbeat; CI must pass.

When in doubt, align to ADR-006. When you add a new security choice, update ADR-006 (and SECURITY.md or PRD-006 if applicable).

## Security Checklist (before implementing or merging)

### Secrets and config

- [ ] No API keys, tokens, or credentials in code or committed config. Use `.dev.vars` (Worker) or env vars; keep them out of version control.
- [ ] `.gitignore` includes `.env`, `.env.*`, `.dev.vars`, `.dev.vars.*`, `secrets.json`, `.cursor/mcp.json`. Do not remove these.
- [ ] If adding a new secret type (e.g. new env var): document in `*.example` or README; never commit the real value.
- [ ] CI uses placeholders for secrets; real secrets only in GitHub Secrets (or equivalent) for deploy.

### Auth and API

- [ ] Discord OAuth: least-privilege scopes; CSRF/state validation for OAuth2 flows. Use [discord-authentication skill](../../discord-authentication/SKILL.md).
- [ ] New API routes that handle auth, tokens, or user data: consider rate limiting and input validation.
- [ ] HTTPS only for production; no intentional HTTP-only flows for app or API.

### Cloudflare (when configuring deploy)

- [ ] Traffic proxied (orange cloud); Universal SSL; free WAF managed ruleset; Bot Fight Mode; Security Level per [PRD-006](../../../docs/product/cloudflare-security/001-free-cloudflare-security.md).
- [ ] No paid security add-ons for baseline unless explicitly approved.

### CI and merge

- [ ] [.github/workflows/security.yml](../../../.github/workflows/security.yml) runs: TruffleHog (secrets), npm audit (API), dotnet vulnerable packages (plugin), CodeQL (JS/TS + C#). Do not disable these for convenience.
- [ ] If CI fails on secrets: remove the secret from history and rotate the key; do not “fix” by excluding paths unless justified and documented.

## Test Coverage Checklist

- [ ] **API**: Smoke test exists and runs in CI ([apps/api/test/smoke.js](../../../apps/api/test/smoke.js), `npm test`, [.github/workflows/worker-test.yml](../../../.github/workflows/worker-test.yml)). New security-sensitive routes (auth, token exchange, profile, heartbeat) must be covered by smoke or unit tests.
- [ ] **Plugin**: Security-sensitive code (token storage, API client, auth flows) should have unit or integration tests before production. Phase 1 may have minimal tests; add as we add features.
- [ ] **Do not merge** without tests for new auth, token, or profile/heartbeat logic. CI (Worker test + Security workflow) must pass.
- [ ] **Before pushing to a remote branch:** Run local tests; **at least 80% of tests must pass** before pushing. Run locally: `docker compose up -d && cd apps/api && npm test` plus typecheck, lint, plugin build, OpenAPI validation per [Run tests before push](../../../docs/guides/development.md#run-tests-before-push). Block or warn on push if the threshold is not met.

## Related Docs and Skills

| Doc / skill | Purpose |
|-------------|---------|
| [ADR-006 Security Choices](../../../docs/architecture/decisions/006-security-choices.md) | Canonical security decisions and test expectations |
| [SECURITY.md](../../../SECURITY.md) | Vulnerability reporting, good practices |
| [PRD-006 Free Cloudflare Security](../../../docs/product/cloudflare-security/001-free-cloudflare-security.md) | Edge security requirements |
| [Security & Anti-Cheat LLD](../../../docs/design/security-anticheat.md) | Phase 2+ anti-cheat scope |
| [ADR-002 Discord OAuth](../../../docs/architecture/decisions/002-discord-oauth.md) | OAuth as sole identity provider |
| [github-change-control](../../github-change-control/SKILL.md) | Secret hygiene, .gitignore, PR governance |
| [discord-authentication](../../discord-authentication/SKILL.md) | OAuth2 implementation, scopes |
| [.github/workflows/security.yml](../../../.github/workflows/security.yml) | CI: secret scan, deps, CodeQL |
| [.github/workflows/worker-test.yml](../../../.github/workflows/worker-test.yml) | API smoke test in CI |

## Anti-Patterns

- **Do not commit secrets** to fix a failing local run; use `.dev.vars` or env and keep it out of git.
- **Do not disable** TruffleHog, npm audit, or CodeQL to unblock merge; fix the underlying issue.
- **Do not add** security-sensitive API or auth code without corresponding tests.
- **Do not rely** on paid Cloudflare security add-ons for baseline without explicit approval (PRD-006 is free-only for baseline).

## Examples

See [examples.md](examples.md) for concrete scenarios (adding a new secret, adding an API route, fixing a failed secret scan, adding tests for auth).
