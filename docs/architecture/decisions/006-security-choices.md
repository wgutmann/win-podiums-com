# ADR-006: Security Choices and Test Coverage

**Doc type**: ADR | **ID**: ADR-006 | **Related**: [Phase 1 scope](../../product/phase-1-mvp-scope.md), [PRD-006 Free Cloudflare Security](../../product/cloudflare-security/001-free-cloudflare-security.md), [Security & Anti-Cheat LLD](../../design/security-anticheat.md)

**Status**: Accepted  
**Date**: 2026-01-31  
**Deciders**: Architecture Team  
**Related**: [SECURITY.md](../../../SECURITY.md), [ADR-002 Discord OAuth](002-discord-oauth.md), [ADR-005 Cost-Optimized](005-cost-optimized-cloudflare.md), [API README](../../api/README.md), [.github/workflows/security.yml](../../../.github/workflows/security.yml)

## Context

WinPodiums must protect user data, API endpoints, and infrastructure while staying cost-optimized and maintainable. We need a single place that records the security choices we have made and the test-coverage expectations so that new work stays consistent.

## Decision

We adopt the following security choices and test-coverage expectations.

### 1. Secrets and credentials

- **Never commit secrets**: No API keys, tokens, `.dev.vars`, `.env`, or credentials in version control. Use [.gitignore](../../../.gitignore) patterns: `.env`, `.env.*`, `.dev.vars`, `.dev.vars.*`, `secrets.json`, `.cursor/mcp.json`.
- **Local config**: Copy `.dev.vars.example` to `.dev.vars` (or use env vars); never commit the copy. Same for any `.env` or MCP config that holds keys.
- **If a secret is ever committed**: Rotate or revoke it immediately; document in [SECURITY.md](../../../SECURITY.md) and use private reporting for vulnerabilities.
- **CI**: Use placeholder values in CI (e.g. `SESSION_SECRET=ci-placeholder-at-least-32-chars-here`); real secrets only in secure env (e.g. GitHub Secrets for deploy).
- **Alignment**: [AGENTS.md](../../../AGENTS.md), [SECURITY.md](../../../SECURITY.md), [github-change-control skill](../../../.cursor/skills/github-change-control/SKILL.md) (secret hygiene).

### 2. Edge and application security (Phase 1)

- **Cloudflare free security only**: Per [PRD-006](../../product/cloudflare-security/001-free-cloudflare-security.md): traffic proxied (orange cloud), Universal SSL, free WAF managed ruleset, Bot Fight Mode, Security Level. No paid security add-ons for baseline. Optional Zero Trust for protected endpoints within free tier.
- **Application-level rate limiting**: Implement in Worker code for critical paths (auth, telemetry submit) where needed; free tier does not rely on paid WAF rate-limiting rules.
- **HTTPS only**: No intentional HTTP-only user flows for the main app or API.
- **OAuth**: Discord OAuth2 as sole identity provider ([ADR-002](002-discord-oauth.md)); least-privilege scopes; CSRF/state validation for OAuth2 flows. Use [discord-authentication skill](../../../.cursor/skills/discord-authentication/SKILL.md) for implementation.

### 3. Deferred (Phase 2+)

- **Full anti-cheat and Telemetry Proof**: Threat model, telemetry validation, continuity, challenge-response per [Security & Anti-Cheat LLD](../../design/security-anticheat.md) and Telemetry Proof tech plans. Phase 1: rate limiting and OAuth security only.

### 4. CI security

- **Secret scanning**: [.github/workflows/security.yml](../../../.github/workflows/security.yml) runs TruffleHog (verified only) on push/PR to main; blocks merge if secrets are detected.
- **Dependency audits**: `npm audit --audit-level=high` for API; `dotnet list package --vulnerable` for plugin. CI fails when high/critical or vulnerable packages are reported.
- **SAST**: CodeQL (security-extended) for JavaScript/TypeScript and C#. Required for merge on main.

### 5. Test coverage

- **API**: Smoke test against running API (Docker or wrangler). [apps/api/test/smoke.js](../../../apps/api/test/smoke.js) and `npm test`; [.github/workflows/worker-test.yml](../../../.github/workflows/worker-test.yml) runs on push/PR when API or Docker change. New API routes or auth flows must be covered by smoke or unit tests; do not merge without tests for security-sensitive paths (auth, token exchange, profile, heartbeat).
- **Plugin**: Unit tests and integration tests as the plugin grows; Phase 1 may have minimal automated tests but security-sensitive code (token storage, API client) should have tests before production.
- **Coverage goal**: Critical paths (auth, token handling, profile, heartbeat) must have test coverage; expand to broader coverage as we add features. CI must pass (Worker test + Security workflow) before merge.

## Rationale

- **Secrets**: Single policy (never commit, rotate if exposed) keeps risk low and aligns with GitHub and Cloudflare best practices.
- **Free Cloudflare only**: Aligns with [ADR-005](005-cost-optimized-cloudflare.md); PRD-006 defines the exact free features we use.
- **OAuth least-privilege**: Reduces scope creep and attack surface ([ADR-002](002-discord-oauth.md)).
- **CI security**: Automated secret scan, dependency audit, and SAST catch issues before merge.
- **Test coverage**: Smoke tests validate that the API runs and critical endpoints respond; requiring tests for security-sensitive code prevents regressions and gives confidence for deploy.

## Consequences

- **Positive**: Clear, single document for security choices; contributors and AI agents can align to it. Test expectations are explicit so coverage stays in mind.
- **Negative**: Stricter CI (security + tests) can block merge until issues are fixed; this is intended.
- **Ongoing**: When we add Phase 2+ security (anti-cheat, Telemetry Proof), update this ADR and the Security & Anti-Cheat LLD.

## Related

- [SECURITY.md](../../../SECURITY.md) — Vulnerability reporting and good practices
- [PRD-006: Free Cloudflare Security](../../product/cloudflare-security/001-free-cloudflare-security.md)
- [Security & Anti-Cheat LLD](../../design/security-anticheat.md) — Phase 2+ scope
- [ADR-002: Discord OAuth](002-discord-oauth.md)
- [ADR-005: Cost-Optimized Cloudflare](005-cost-optimized-cloudflare.md)
- [.github/workflows/security.yml](../../../.github/workflows/security.yml) — CI security checks
- [.github/workflows/worker-test.yml](../../../.github/workflows/worker-test.yml) — API smoke test
