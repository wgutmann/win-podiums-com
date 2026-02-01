# ADR-007: Dev/Cloud Parity and Local-First Testing

**Doc type**: ADR | **ID**: ADR-007 | **Related**: [Phase 1 scope](../../product/phase-1-mvp-scope.md), [ADR-001 Cloudflare Stack](001-cloudflare-stack.md), [development guide](../../guides/development.md)

**Status**: Accepted  
**Date**: 2026-02-01  
**Deciders**: Architecture Team

## Context

Agents and contributors need a clear, durable decision about how the development environment relates to the Cloudflare production environment. Without this, agents may:
- Propose divergent "Docker vs Worker" or "local vs cloud" flows
- Assume cloud deployment is the primary testing target
- Introduce features that only work in Cloudflare and cannot be validated locally

We need a single source of truth that states: **the Cloudflare environment in production must match the dev environment 1:1**, and **everything is tested locally first** except what strictly requires Cloudflare.

## Decision

### 1. Dev/Cloud parity (non-negotiable)

- **Cloud production MUST match dev environment 1:1.** Same codebase, same config (`wrangler.toml` + `.dev.vars`), same bindings (D1, R2, KV). No divergent flows.
- **Dev is the source of truth.** The Docker-based local environment defines what runs in production. Cloud deployment is the same app, deployed to Cloudflare's edge.
- **Do not document or implement** separate "Docker vs Worker" or "local vs cloud" flows. One path, one config.

### 2. Local-first testing

- **Test everything locally first.** Run the API via `docker compose up`, run tests against it (`cd apps/api && npm test`). Validate auth, endpoints, and integrations against the Dockerized Worker.
- **Use Cloudflare only when strictly required.** See §4 "What needs Cloudflare" below. Everything else is tested locally.

### 3. Run and verify locally

- **Start API**: `docker compose up` (or `docker compose up -d`)
- **Run tests**: `docker compose up -d && cd apps/api && npm test`
- **Pre-push**: `scripts/pre-push-check.js` runs against the local Docker API. At least 80% of tests must pass before pushing.

## Rationale

- **Single config reduces bugs**: One `wrangler.toml` and one `.dev.vars` pattern means no drift between local and production behavior.
- **Fast feedback**: Local testing is faster than deploying to Cloudflare for every change.
- **Agent and contributor clarity**: A durable, searchable ADR ensures this decision is not forgotten across sessions or context switches.

## What needs Cloudflare

Use this list to decide what **must** run in Cloudflare vs what can be tested locally.

| Category | Test locally | Requires Cloudflare |
|----------|--------------|---------------------|
| **Worker code** | ✅ Same code runs in Docker | ❌ |
| **D1 database** | ✅ `wrangler d1 migrations apply --local` (Docker or wrangler dev) | Production D1 (remote), edge replication |
| **R2 storage** | ✅ Miniflare / local R2 emulation if wired | Production R2 buckets, global CDN |
| **KV** | ✅ Local KV in Miniflare | Production KV (edge distribution) |
| **API endpoints** | ✅ All endpoints hit via `http://localhost:8787` | ❌ |
| **Auth flows** | ✅ Discord OAuth with `http://localhost:8787/auth/callback` | ❌ (same flow) |
| **Secrets** | ✅ `.dev.vars` (local, gitignored) | Production secrets (Wrangler secrets, Dashboard) |
| **Tests** | ✅ Smoke, unit, integration against Docker | ❌ |
| **Deployment** | ❌ | ✅ `wrangler deploy` — actual edge deployment |
| **Production D1/R2/KV** | ❌ | ✅ Remote resources, edge replication |
| **Global routing, CDN** | ❌ | ✅ Cloudflare's edge network |
| **Custom domains, SSL** | ❌ | ✅ Cloudflare DNS and certificate management |

**Summary**: Everything except **deployment**, **production D1/R2/KV**, **global routing/CDN**, and **custom domains/SSL** can and should be tested locally. Do not add features that depend on Cloudflare-only behavior without explicit justification.

## Consequences

### Positive

- Agents and contributors have a single, searchable decision record.
- Local-first testing reduces deploy cycles and catches bugs earlier.
- 1:1 parity eliminates "works in dev, broken in prod" surprises.

### Negative

- Some Cloudflare-specific behaviors (e.g. edge replication timing, R2 global distribution) cannot be fully validated locally. Accept this gap; it is small compared to the benefit of local parity.

## Related Decisions

- [ADR-001: Cloudflare Stack](001-cloudflare-stack.md) — Platform choice; Wrangler enables local parity
- [AGENTS.md](../../../AGENTS.md) — Agent instructions reference this ADR
- [development guide](../../guides/development.md) — Local run and test commands
- [leveragable-lessons.md](../../guides/leveragable-lessons.md) — Lesson 1: Maintain Docker ⇄ Worker parity

## References

- [Docker dev environment](../../../.cursor/skills/docker-dev-environment/SKILL.md) — Local/repo parity
- [Cloudflare Workers skill](../../../.cursor/skills/cloudflare-workers/SKILL.md) — Worker and Docker 1:1
- [compose.yaml](../../../compose.yaml) — Config matches wrangler.toml (1:1)
