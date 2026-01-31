---
name: cloudflare-workers
description: Implements and configures Cloudflare Workers, D1, R2, KV, and Wrangler. Use when building or configuring Workers apps, D1 databases, R2 buckets, KV namespaces, wrangler.toml, bindings, or deploying with Wrangler. Prefer Cloudflare docs and MCP/Context7 for current APIs.
---

# Cloudflare Workers Skill

## Quick Start

Use this skill when the user is **implementing or configuring** Cloudflare Workers, D1, R2, KV, Wrangler, or bindings. For **infrastructure as code** (Terraform), follow [AGENTS.md](../../../AGENTS.md) and the infra rule: plan/validate only until a minimal Worker exists.

## Scope

- **In scope**: Worker code (TypeScript), `wrangler.toml`, bindings (D1, R2, KV), Wrangler CLI (dev, deploy), secrets (`.dev.vars`), D1 migrations, R2 S3-compatible API, KV get/put.
- **Out of scope**: Terraform for creating resources (see `infra/terraform/` and `.cursor/rules/infra.mdc`); Discord/SimHub (use their skills).

## Conventions (this repo)

- **Secrets**: Keep in `.dev.vars` (or env-specific files). Never commit secrets; `.dev.vars` is in `.gitignore`.
- **Bindings**: When the Worker app exists, wire D1/R2/KV using **names or IDs from Terraform outputs** (see `infra/terraform/outputs.tf`). Do not hardcode resource IDs in `wrangler.toml` if they are managed by Terraform.
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
- [ ] If resources are created by Terraform, bind using output values (e.g. `env.D1_DATABASE_ID`) or documented names.
