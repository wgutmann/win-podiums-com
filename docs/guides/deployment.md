# Deployment Guide

**Last Updated**: 2026-01-31

## Overview

TBD – follow [High-Level Design](../architecture/high-level-design.md) and [Next Steps](../architecture/next-steps.md). Deployment sequence: apply Terraform (D1, R2, KV, routes) → set KV id in `apps/api/wrangler.toml` from `terraform output kv_namespace_id` → deploy Worker → (later) plugin distribution via R2 and/or GitHub Releases.

## Prerequisites

- Terraform applied (single environment, e.g. `dev`) per [Next Steps](../architecture/next-steps.md)
- Worker app in `apps/api/` with `wrangler.toml` bound to Terraform-created resources
- Wrangler CLI and Cloudflare API token (or GitHub Actions with secrets)

## Terraform Apply (when ready)

1. From repo root: `cd infra/terraform`
2. Ensure backend is initialized: `terraform init -backend-config=backend.r2.hcl` (if using R2 backend)
3. Plan: `terraform plan -var="cloudflare_account_id=YOUR_ACCOUNT_ID"`
4. Apply: `terraform apply` (after a minimal Worker exists that uses D1/R2/KV)
5. Note outputs: `d1_database_id`, `d1_database_name`, `r2_bucket_name`, `kv_namespace_id` for `wrangler.toml`

## Worker Deploy

1. Update `apps/api/wrangler.toml` with D1/R2/KV bindings (names/IDs from Terraform outputs; see [Development](development.md)).
2. Set secrets: `wrangler secret put DISCORD_CLIENT_ID` etc. (do not commit).
3. Deploy: `cd apps/api && npx wrangler deploy`
4. Attach routes: if using custom domain, ensure Terraform `zone_id` is set and routes are created; Worker is attached via Terraform or Dashboard.

## Plugin Distribution (Phase 1+)

TBD – R2 bucket and optionally GitHub Releases per deployment guide when plugin build exists.

## Related

- [Development](development.md) — Local dev and Terraform output wiring
- [Next Steps](../architecture/next-steps.md) — When to apply Terraform
- [Infrastructure](../architecture/infrastructure.md) — Terraform resources
