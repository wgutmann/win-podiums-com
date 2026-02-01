# Deployment Guide

**Last Updated**: 2026-01-31

## Overview

Deploy the Worker with Wrangler after creating D1, R2, and KV in Cloudflare (Dashboard or your own automation). Locally, run and test with Docker (`docker compose up`, then `cd apps/api && npm test`); the same config (`wrangler.toml` + `.dev.vars`) is used in Docker and in production via `wrangler deploy`.

**Terraform**: Not part of the default workflow. The directory `infra/terraform/` exists for future use; ignore it until explicitly introduced as a feature.

## Prerequisites

- Worker app in `apps/api/` with `wrangler.toml` and bindings for D1, R2, KV
- Wrangler CLI and Cloudflare API token (or CI with secrets)
- D1 database, R2 bucket, and KV namespace created in Cloudflare (e.g. via Dashboard)

## Worker Deploy

1. Create D1, R2, and KV in the Cloudflare Dashboard (or your preferred method) if not already created.
2. Update `apps/api/wrangler.toml` with the correct `database_id` (D1), bucket name (R2), and `id` (KV) for your environment.
3. Set secrets: `wrangler secret put DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `SESSION_SECRET` (do not commit).
4. Apply D1 schema: `cd apps/api && npx wrangler d1 migrations apply winpodiums-dev-db --remote`
5. Deploy: `npx wrangler deploy`
6. Attach routes: If using a custom domain, attach the Worker to your zone/routes in the Dashboard (or your automation).

## Plugin Distribution (Phase 1+)

TBD – R2 bucket and optionally GitHub Releases when plugin build exists.

## Related

- [Development](development.md) — Local dev (Docker and wrangler dev, 1:1)
- [Next Steps](../architecture/next-steps.md) — Recommended order of work
