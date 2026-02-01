# Phase 1 MVP Scope

**Status**: Scope definition  
**Date**: 2026-01-31  
**Purpose**: Define the minimum shippable set for Phase 1 so implementation and infra stay aligned.

---

## 1. In Scope (Phase 1)

| Area | Deliverable |
|------|-------------|
| **Discord OAuth2** | Web flow + plugin flows (browser, QR; manual token debug-only, feature-flagged) per [Discord Integration LLD](../design/integrations/discord-integration.md) |
| **Minimal Worker** | Auth endpoints (stub or real) + health + at least one non-auth endpoint (e.g. `GET /api/profile/me`) using D1/KV; config via `wrangler.toml` (same for Docker and wrangler dev, 1:1) |
| **Basic SimHub plugin** | Position detection deferred; minimal auth (browser primary; manual token only as debug feature-flag), one call to verification API (heartbeat) per [SimHub plugin LLD](../design/components/simhub-plugin.md) and [PRD-SPOC-001 SimHub Plugin POC](simhub-plugin-poc/001-simhub-plugin-poc.md) |
| **Static Gate** | Landing page (Worker-served or static) linking to Discord auth and plugin download |
| **Member state** | Pending / verified (stored in D1 when implemented) |
| **Infrastructure** | D1, R2, KV (created in Cloudflare; bindings in `wrangler.toml`). Single environment (e.g. `dev`) first. Terraform is not in scope until explicitly introduced as a feature. |

## 2. Out of Scope (Phase 1)

| Area | Deferred to Phase 2+ |
|------|----------------------|
| **Full Telemetry Proof** | Phase 1 includes one plugin heartbeat call to the API; full Telemetry Proof (validation, continuity, challenge-response per PRDs/tech plans 001–005) is Phase 2+. |
| **Luxury UI** | Full design-system polish; Phase 1 is functional, not pixel-perfect |
| **Discord roles** | Automatic role assignment; community/bot features |
| **Leaderboards** | Public leaderboards and rankings |
| **Anti-cheat LLD** | Full [Security & Anti-Cheat LLD](../design/security-anticheat.md) (deferred; rate limiting and OAuth security only in Phase 1) |

## 3. Trace to Existing Docs

### Phase 1 (apply now)

| Doc | Use in Phase 1 |
|-----|-----------------|
| [HLD](../architecture/high-level-design.md) | Phase 1 checklist, auth paths, state machine |
| [ADR-001 Cloudflare Stack](../architecture/decisions/001-cloudflare-stack.md) | Workers, D1, R2, KV |
| [ADR-002 Discord OAuth](../architecture/decisions/002-discord-oauth.md) | Sole identity provider |
| [ADR-003 Hybrid Auth](../architecture/decisions/003-hybrid-auth-paths.md) | Web-first + plugin-first |
| [Discord Integration LLD](../design/integrations/discord-integration.md) | OAuth flows, plugin methods |
| [SimHub Plugin LLD](../design/components/simhub-plugin.md) | Plugin structure, position detection, API client |
| [Database Schema](../design/data-models/database-schema.md) | D1 tables when implementing auth/profile |
| [OpenAPI](../api/openapi.yaml) + [API README](../api/README.md) | Auth, profile, plugin endpoint surface |
| [Next Steps](../architecture/next-steps.md) | Order of work, test locally, deploy |

### Phase 2+ (reference only)

| Doc | When used |
|-----|-----------|
| [Telemetry Proof PRDs](telemetry-proof-system/) (001–005) | Heartbeat, validation, race submission, continuity, challenge-response |
| [Telemetry Proof tech plans](../tech-plans/telemetry-proof-system/) | Implementation details for above |
| [ADR-004 Cloudflare-only](../architecture/decisions/004-cloudflare-only-architecture.md), [ADR-005 Cost](../architecture/decisions/005-cost-optimized-cloudflare.md) | Already reflected in infra; no Phase 1 change |
| [Security & Anti-Cheat LLD](../design/security-anticheat.md) | Full anti-cheat when Telemetry Proof is implemented |

## 4. Outcome

- **Clear minimum shippable set**: Auth (web + plugin), minimal API (health + profile stub), basic plugin (position + one verified flow), static Gate, member state.
- **No confusion**: D1/R2/KV are for Phase 1 (via wrangler.toml); full Telemetry Proof and luxury UI are Phase 2+. Terraform is out of scope until explicitly introduced as a feature.

## 5. Related

- [Next Steps](../architecture/next-steps.md) — Recommended order of work
- [High-Level Design](../architecture/high-level-design.md) — Phase 1 checklist and system overview
