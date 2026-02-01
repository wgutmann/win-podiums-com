# Cloudflare Workers — Reference

Curated pointers for Workers, D1, R2, KV, and Wrangler. Prefer Cloudflare’s official docs and MCP for the latest API.

## Official documentation

- **Workers**: https://developers.cloudflare.com/workers/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **D1**: https://developers.cloudflare.com/d1/
- **R2**: https://developers.cloudflare.com/r2/
- **KV**: https://developers.cloudflare.com/kv/

## This repo

- **Worker and Docker are 1:1**: Run and test locally with Docker (`docker compose up`, then `cd apps/api && npm test`). Config in `wrangler.toml` and `.dev.vars`; compose uses `env_file: ./apps/api/.dev.vars` and `CLOUDFLARE_INCLUDE_PROCESS_ENV=true` so Docker and Worker config match. Terraform is out of scope until explicitly introduced as a feature.
- **ADRs**: `docs/architecture/decisions/001-cloudflare-stack.md`, `005-cost-optimized-cloudflare.md`
- **Database schema**: `docs/design/data-models/database-schema.md`
- **API spec**: `docs/api/openapi.yaml`

## Binding names

Set D1, R2, and KV bindings in `wrangler.toml` to match resources created in Cloudflare (Dashboard or your automation). Same config for local (Docker / wrangler dev) and remote deploy.

## Secrets

- Local: `.dev.vars` (key=value per line). Never commit.
- Production: `wrangler secret put <NAME>` or CI secrets; do not store in repo.
