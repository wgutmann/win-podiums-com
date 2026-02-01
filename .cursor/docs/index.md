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
- [Development Setup](../../docs/guides/development.md) — Docker-first dev (API in container); host option for API and plugin
- [Deployment Guide](../../docs/guides/deployment.md) — Release process (TBD)

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
- **Docker dev**: `docker compose up` — API at http://localhost:8787 (health: `/health`, Gate: `/` or `/gate`)
- Config: `apps/api/wrangler.toml` (add D1/KV/R2 bindings when Terraform is applied)

### SimHub Plugin
- Main entry: `apps/plugin/WinPodiums.Plugin/Core/PluginMain.cs`
- Project: `apps/plugin/WinPodiums.Plugin/WinPodiums.Plugin.csproj` (.NET Framework 4.8)
- See `apps/plugin/README.md` and [SimHub Plugin LLD](../../docs/design/components/simhub-plugin.md)

## Development Workflow

1. **Clone repo**: `git clone https://github.com/...` (TBD)
2. **Install dependencies**: `npm install` (web/API), restore NuGet packages (plugin)
3. **Local dev**: `wrangler dev` (web/API), F5 in Visual Studio (plugin)
4. **Run tests**: `npm test` (web/API), run test suite in VS (plugin)
5. **Deploy**: `wrangler deploy` (production) or open PR for review

## Skills & Conventions

This project uses [Cursor Skills](.cursor/skills/) for domain-specific tasks:
- `cloudflare-workers` — Workers, D1, R2, KV, Wrangler; use when configuring or implementing Cloudflare edge/API
- `simhub-plugin-builder` — SimHub plugin development
- `discord-authentication` — Discord OAuth2 implementation
- `docker-dev-environment` — Containerized development
- `github-change-control` — GitHub workflow and secrets management
- `cursor-project-docs` — Documentation structure and maintenance

Project rules in [.cursor/rules/](.cursor/rules/) apply when editing matching files (e.g. `infra.mdc` for Terraform, `docs.mdc` for docs). See [AGENTS.md](../../AGENTS.md) for AI agent instructions.

## Status

**Phase**: Phase 1 MVP (structure + minimal API + plugin scaffold)  
**Version**: 0.1.0-alpha  
**Last Updated**: 2026-01-31

**Next steps:** ([full sequence](../../docs/architecture/next-steps.md))
1. ~~Close doc gaps~~ (guides, API sub-docs, security LLD)
2. ~~Define Phase 1 scope~~ ([phase-1-mvp-scope.md](../../docs/product/phase-1-mvp-scope.md))
3. ~~Set up repo structure~~ (Worker in `apps/api/`, plugin in `apps/plugin/`, wrangler.toml wired to Terraform outputs)
4. **Implement Phase 1** — real Discord OAuth, D1 migrations, plugin auth + one verification flow (Worker stubs and Gate already in place)
5. Then apply Terraform and deploy Worker (and plugin)
