# Documentation Index — Metadata Tables

**Purpose**: Single source of truth for documentation and metadata. **Agents must create and maintain these tables** when adding or updating any PRD, ADR, tech plan, or key guide. See [Documentation Standards](standards/documentation-standards.md) and [Cursor Project Docs skill](../.cursor/skills/cursor-project-docs/SKILL.md).

**How to use (agents)**:
- When you **create** a new PRD, ADR, tech plan, or key guide: add a row to the appropriate table below.
- When you **rename**, **move**, or **deprecate** a doc: update the table row (path, title, Related/Implements).
- When you **change** Related/Implements in a doc: update the corresponding table row.
- Keep tables in sync with area READMEs ([product/README](product/README.md), [tech-plans/README](tech-plans/README.md), [architecture/README](architecture/README.md)).

---

## PRDs (Product Requirements)

| ID | Title | Path | Related (Tech Plans / ADRs) |
|----|-------|------|-----------------------------|
| — | Phase 1 MVP scope | [docs/product/phase-1-mvp-scope.md](product/phase-1-mvp-scope.md) | HLD, Next Steps, ADRs, SimHub POC, Telemetry Proof |
| PRD-001 | SimHub Plugin POC | [docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md](product/simhub-plugin-poc/001-simhub-plugin-poc.md) | TP-SPOC-001–005, ADR-002, ADR-003, API plugin |
| — | Cloudflare Security | [docs/product/cloudflare-security/](product/cloudflare-security/) | ADR-001, ADR-005, ADR-006 |
| — | Telemetry Proof System | [docs/product/telemetry-proof-system/](product/telemetry-proof-system/) | [docs/tech-plans/telemetry-proof-system/](tech-plans/telemetry-proof-system/) |

---

## Tech Plans (Implementation Specs)

| ID | Title | Path | Implements | Related |
|----|-------|------|------------|---------|
| TP-SPOC-001 | Plugin Skeleton, SDK, Config | [docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md](tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md) | PRD-001 | TP-SPOC-002–005, SimHub LLD, API plugin |
| TP-SPOC-002 | Auth (PKCE, Token Storage) | [docs/tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md](tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md) | PRD-001 | TP-SPOC-001,003–005, ADR-002, ADR-003 |
| TP-SPOC-003 | API Client and Heartbeat | [docs/tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md](tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md) | PRD-001 | TP-SPOC-001–002,004–005, API spec |
| TP-SPOC-004 | Minimal SimHub UI | [docs/tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md](tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md) | PRD-001 | TP-SPOC-001–003,005, SimHub LLD |
| TP-SPOC-005 | POC Testing and Completion | [docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md](tech-plans/simhub-plugin-poc/005-poc-testing-completion.md) | PRD-001 | TP-SPOC-001–004 |
| TP-001–005 | Telemetry Proof System | [docs/tech-plans/telemetry-proof-system/](tech-plans/telemetry-proof-system/) | [Telemetry Proof PRDs](product/telemetry-proof-system/) | API spec, security LLD |

---

## ADRs (Architecture Decisions)

| ID | Title | Path | Related |
|----|-------|------|---------|
| ADR-001 | Cloudflare Stack | [docs/architecture/decisions/001-cloudflare-stack.md](architecture/decisions/001-cloudflare-stack.md) | HLD, Phase 1 scope, ADR-005 |
| ADR-002 | Discord OAuth | [docs/architecture/decisions/002-discord-oauth.md](architecture/decisions/002-discord-oauth.md) | HLD, Phase 1 scope, plugin auth |
| ADR-003 | Hybrid Auth Paths | [docs/architecture/decisions/003-hybrid-auth-paths.md](architecture/decisions/003-hybrid-auth-paths.md) | ADR-002, plugin, web |
| ADR-004 | Cloudflare-Only Architecture | [docs/architecture/decisions/004-cloudflare-only-architecture.md](architecture/decisions/004-cloudflare-only-architecture.md) | ADR-001, HLD |
| ADR-005 | Cost-Optimized Cloudflare | [docs/architecture/decisions/005-cost-optimized-cloudflare.md](architecture/decisions/005-cost-optimized-cloudflare.md) | ADR-001, cost-optimization-summary |
| ADR-006 | Security Choices | [docs/architecture/decisions/006-security-choices.md](architecture/decisions/006-security-choices.md) | SECURITY.md, CI, test coverage, Cloudflare security |

---

## Key Guides and References

| Doc | Path | Purpose |
|-----|------|---------|
| Development | [docs/guides/development.md](guides/development.md) | Run and test locally (Docker, plugin, pre-push) |
| Deployment | [docs/guides/deployment.md](guides/deployment.md) | Release process |
| ContextStream mapping | [docs/guides/contextstream-mapping.md](guides/contextstream-mapping.md) | Repo ↔ ContextStream, PR ↔ TP ↔ PRD |
| Documentation standards | [docs/standards/documentation-standards.md](standards/documentation-standards.md) | Format, metadata, Related/Implements |
| High-Level Design | [docs/architecture/high-level-design.md](architecture/high-level-design.md) | System architecture |
| Next Steps | [docs/architecture/next-steps.md](architecture/next-steps.md) | Recommended sequence (test, deploy) |
| API (OpenAPI) | [docs/api/openapi.yaml](api/openapi.yaml), [docs/api/README.md](api/README.md) | All Worker endpoints; Swagger at /api-docs |

---

## Design (Components, Data Models, Integrations)

| Doc | Path | Related |
|-----|------|---------|
| SimHub Plugin LLD | [docs/design/components/simhub-plugin.md](design/components/simhub-plugin.md) | PRD-001, TP-SPOC-001–005, API plugin |
| Database schema (D1) | [docs/design/data-models/database-schema.md](design/data-models/database-schema.md) | entity-relationship.mmd, API, migrations |
| Discord integration | [docs/design/integrations/discord-integration.md](design/integrations/discord-integration.md) | ADR-002, ADR-003, authentication.md |
| Security / anti-cheat | [docs/design/security-anticheat.md](design/security-anticheat.md) | ADR-006, telemetry proof |

---

**Last updated**: When you add or change a row, bump or note the date. Agents: keep this file and area READMEs in sync.
