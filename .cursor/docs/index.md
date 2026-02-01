# WinPodiums — Project Context

A merit-based luxury community for elite sim racers, verified through real-time telemetry monitoring.

## Quick Links

### Repository Documentation
- [README](../../README.md) — Project overview and getting started
- [CONTRIBUTING](../../CONTRIBUTING.md) — How to contribute (stub; full guidelines when implementation starts)
- [SECURITY](../../SECURITY.md) — Security policy and vulnerability reporting (stub)
- [CHANGELOG](../../CHANGELOG.md) — Release history

### Technical Documentation
- [High-Level Design](../../docs/architecture/high-level-design.md) — System architecture overview
- [Architecture Decisions](../../docs/architecture/decisions/) — ADRs for key choices
- [Component Design](../../docs/design/components/) — Low-level implementation details
- [API Documentation](../../docs/api/) — REST API endpoint specifications
- [Database Schema](../../docs/design/data-models/database-schema.md) — D1 database structure

### Brand & Design
- [Visual Design System](../../docs/brand/design-system.md) — Colors, typography, animations
- [Brand Philosophy](../../docs/architecture/high-level-design.md#1-executive-summary) — "The Podium Invitation"

### Developer Guides
- [Development Setup](../../docs/guides/development.md) — Run and test locally with Docker; tests run against the Dockerized API
- [Deployment Guide](../../docs/guides/deployment.md) — Release process (TBD)
- [ContextStream mapping](../../docs/guides/contextstream-mapping.md) — Repo docs ↔ ContextStream parallels (PRD↔plans, diagrams, lessons, to-dos), graph usage, tagging

## Project Summary

**Stack**: Cloudflare Workers/D1/R2 (web/API), C#/.NET Framework 4.8 (SimHub plugin), Discord OAuth2 (identity)

**Core Components**:
1. **Web Frontend** — Luxury UI for member onboarding and dashboard
2. **API Layer** — Authentication, telemetry validation, anti-cheat
3. **SimHub Plugin** — Desktop app monitoring race telemetry
4. **Discord Integration** — OAuth2 identity provider

**Key Architecture Decisions**:
- [Cloudflare Stack](../../docs/architecture/decisions/001-cloudflare-stack.md) — Edge compute for global low-latency
- [Discord OAuth](../../docs/architecture/decisions/002-discord-oauth.md) — Sole identity provider (no email/password)
- [Hybrid Auth Paths](../../docs/architecture/decisions/003-hybrid-auth-paths.md) — Web-first (ceremonial) + plugin-first (exploratory)

## Entry Points

### API (Cloudflare Worker)
- Main entry: `apps/api/src/index.ts`
- **Run locally**: `docker compose up` — API at http://localhost:8787 (health: `/health` or `/api/health`, Gate: `/` or `/gate`)
- **Test**: `docker compose up -d && cd apps/api && npm test` (smoke test against Docker; validates Docker and Worker config match)
- Config: `apps/api/wrangler.toml` + `apps/api/.dev.vars` (same config in Docker)

### SimHub Plugin
- Main entry: `apps/plugin/WinPodiums.Plugin/Core/PluginMain.cs`
- Project: `apps/plugin/WinPodiums.Plugin/WinPodiums.Plugin.csproj` (.NET Framework 4.8)
- **Install**: [Plugin installation](../../apps/plugin/README.md#installation) — build, copy `WinPodiums.Plugin.dll` to `C:\Program Files (x86)\SimHub\Plugins`, restart SimHub
- See [plugin README](../../apps/plugin/README.md) and [SimHub Plugin LLD](../../docs/design/components/simhub-plugin.md)
- **Development handoff:** [PRD-001 SimHub Plugin POC](../../docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md) and [TP-SPOC-001–005](../../docs/tech-plans/simhub-plugin-poc/README.md); implement in order 001→002→003→004→005. POC complete per [TP-SPOC-005](../../docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md). See [Development guide — SimHub Plugin POC](../../docs/guides/development.md#simhub-plugin-poc--development-handoff).

## Development Workflow

1. **Clone repo**: `git clone https://github.com/...` (TBD)
2. **Run API**: `docker compose up` (from repo root); API at http://localhost:8787
3. **Run tests**: With Docker up (`docker compose up -d`), run `cd apps/api && npm test` — tests hit the Dockerized API
4. **Plugin**: Build and run on host (F5 in Visual Studio); point at http://localhost:8787 when API is in Docker
5. **Deploy**: `wrangler deploy` (production) or open PR for review

## Skills & Conventions

This project uses [Cursor Skills](.cursor/skills/) for domain-specific tasks:
- `cloudflare-workers` — Workers, D1, R2, KV, Wrangler; use when configuring or implementing Cloudflare edge/API
- `simhub-plugin-builder` — SimHub plugin development
- `discord-authentication` — Discord OAuth2 implementation
- `docker-dev-environment` — Containerized development
- `github-change-control` — GitHub workflow and secrets management
- `cursor-project-docs` — Documentation structure and maintenance
- `security` — Secrets, auth, CI security, test coverage (ADR-006)
- `product-manager` — Product scope and phase alignment

**Project subagents** ([.cursor/agents/](../../.cursor/agents/)): Testing, API contract, local bootstrap, deployment, telemetry proof, and CI are **subagents only** (not skills). Delegate to the matching subagent; do not add skills with those names. One subagent per domain; no duplicates. See [.cursor/agents/README.md](../../.cursor/agents/README.md).

Project rules in [.cursor/rules/](.cursor/rules/) apply when editing matching files (e.g. `docs.mdc` for docs). See [AGENTS.md](../../AGENTS.md) for AI agent instructions. Terraform is out of scope until explicitly introduced as a feature.

## Status

**Phase**: Phase 1 MVP (structure + minimal API + plugin scaffold)  
**Version**: 0.1.0-alpha  
**Last Updated**: 2026-01-31

**Next steps:** ([full sequence](../../docs/architecture/next-steps.md))
1. ~~Close doc gaps~~ (guides, API sub-docs, security LLD)
2. ~~Define Phase 1 scope~~ ([phase-1-mvp-scope.md](../../docs/product/phase-1-mvp-scope.md))
3. ~~Set up repo structure~~ (Worker in `apps/api/`, plugin in `apps/plugin/`, wrangler.toml)
4. ~~Implement Phase 1~~ — real Discord OAuth, D1 migrations (local schema applied), plugin auth + heartbeat
5. **Pick up**: Create D1 tables (already done locally), configure Discord + `.dev.vars`, run and test with Docker (`docker compose up`, `npm test` in apps/api); then deploy when ready (see [Next Steps](../../docs/architecture/next-steps.md)).
6. **SimHub plugin POC**: PRD-001 and TP-SPOC-001–005 are aligned; implement in order 001→002→003→004→005. See [Development guide — SimHub Plugin POC handoff](../../docs/guides/development.md#simhub-plugin-poc--development-handoff).