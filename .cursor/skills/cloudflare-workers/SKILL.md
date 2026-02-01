---
name: cloudflare-workers
description: Implements and configures Cloudflare Workers, D1, R2, KV, and Wrangler. Use when building or configuring Workers apps, D1 databases, R2 buckets, KV namespaces, wrangler.toml, bindings, or deploying with Wrangler. Prefer Cloudflare docs and MCP/Context7 for current APIs.
---

# Cloudflare Workers Skill

## Quick Start

Use this skill when the user is **implementing or configuring** Cloudflare Workers, D1, R2, KV, Wrangler, or bindings. **Terraform is out of scope** until explicitly introduced as a feature; see [AGENTS.md](../../../AGENTS.md).

## Scope

- **In scope**: Worker code (TypeScript), `wrangler.toml`, bindings (D1, R2, KV), Wrangler CLI (dev, deploy), secrets (`.dev.vars`), D1 migrations, R2 S3-compatible API, KV get/put. Worker and Docker are 1:1 (same app, same config).
- **Out of scope**: Terraform (ignore `infra/terraform/` unless the user explicitly asks for it); Discord/SimHub (use their skills).

## Conventions (this repo)

- **Secrets**: Keep in `.dev.vars` (or env-specific files). Never commit secrets; `.dev.vars` is in `.gitignore`.
- **Bindings**: Wire D1/R2/KV in `wrangler.toml`; names/IDs from Cloudflare Dashboard or your own automation. Same config for Docker and `wrangler dev`.
- **CPU**: Workers have a 50ms CPU limit per request; design handlers to stay under or offload to Queues/Cron.
- **Stack**: Workers (TypeScript), D1 (SQLite), R2 (S3-compatible), KV (caching). See [ADR-001](../../../docs/architecture/decisions/001-cloudflare-stack.md) and [cost-optimized ADR](../../../docs/architecture/decisions/005-cost-optimized-cloudflare.md).

## Key Resources

- **Wrangler**: Local dev `wrangler dev`; deploy `wrangler deploy`. Use `wrangler d1 execute` for migrations.
- **D1**: SQLite at the edge; use prepared statements and migrations. Free tier: 5M reads/day, 100K writes/day.
- **R2**: S3-compatible; use AWS SDK or R2 API for plugin binaries and static assets. Zero egress fees.
- **KV**: Key-value cache; use for hot data to reduce D1 reads (e.g. session or config cache).

## Documentation

- Prefer **Cloudflare official docs** and **Cloudflare MCP** (e.g. `search_cloudflare_documentation`) or **Context7** for current API and examples.
- Project docs: [infrastructure](../../../docs/architecture/infrastructure.md), [database schema](../../../docs/design/data-models/database-schema.md), [API](../../../docs/api/).

## Checklist (when adding or changing a Worker)

- [ ] `wrangler.toml` defines name, compatibility date, and bindings (d1_databases, r2_buckets, kv_namespaces).
- [ ] Secrets are in `.dev.vars` and not committed.
- [ ] D1 migrations (if any) live in the Worker app and are run via `wrangler d1 execute` or CI.
- [ ] Bindings in `wrangler.toml` match your D1/R2/KV resources (Dashboard or automation); Worker and Docker use the same config.
