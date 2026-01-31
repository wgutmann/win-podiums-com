# Cloudflare Workers — Reference

Curated pointers for Workers, D1, R2, KV, and Wrangler. Prefer Cloudflare’s official docs and MCP for the latest API.

## Official documentation

- **Workers**: https://developers.cloudflare.com/workers/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **D1**: https://developers.cloudflare.com/d1/
- **R2**: https://developers.cloudflare.com/r2/
- **KV**: https://developers.cloudflare.com/kv/

## This repo

- **Infrastructure (Terraform)**: `infra/terraform/` — D1, R2, KV, optional routes. Do not run `terraform apply` until a minimal Worker exists.
- **ADRs**: `docs/architecture/decisions/001-cloudflare-stack.md`, `005-cost-optimized-cloudflare.md`
- **Database schema**: `docs/design/data-models/database-schema.md`
- **API spec**: `docs/api/openapi.yaml`

## Binding names (when Worker exists)

Terraform outputs (see `infra/terraform/outputs.tf`) provide resource names/IDs. Use them in `wrangler.toml` or env so the Worker binds to Terraform-managed D1, R2, and KV.

## Secrets

- Local: `.dev.vars` (key=value per line). Never commit.
- Production: `wrangler secret put <NAME>` or CI secrets; do not store in repo.
