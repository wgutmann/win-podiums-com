# Infrastructure as Code (Terraform)

**Status**: Active  
**Last Updated**: 2026-01-31

## Overview

Cloudflare resources for WinPodiums are managed as **infrastructure as code** with Terraform. GitHub Actions runs `terraform plan` on pull requests and `terraform apply` on pushes to `main` (or via manual workflow with apply enabled).

This aligns with:

- [ADR-001: Cloudflare Stack](decisions/001-cloudflare-stack.md)
- [ADR-004: Cloudflare-Only Architecture](decisions/004-cloudflare-only-architecture.md)
- [ADR-005: Cost-Optimized Cloudflare](decisions/005-cost-optimized-cloudflare.md)
- [GitHub change control](../../.cursor/skills/github-change-control/) (secrets in GitHub, no credentials in repo)

## What Terraform Manages

| Resource | Purpose |
|----------|---------|
| **D1 database** | Users, auth, race results, telemetry state (schema applied via Wrangler migrations) |
| **R2 bucket** | Plugin downloads, static assets |
| **Workers KV namespace** | Caching (user profiles, rate limits) per cost optimization |
| **Worker routes** (optional) | Custom domain **winpodiums.com** and **www.winpodiums.com** when `zone_id` is set |

Worker **code** is deployed with **Wrangler** (not Terraform). Terraform creates D1, R2, KV, and (when `zone_id` is set) route patterns for winpodiums.com; Wrangler binds resources and attaches the Worker to those routes.

## Layout

```
infra/terraform/
  versions.tf      # Provider (cloudflare ~> 5), backend
  variables.tf     # cloudflare_account_id, environment, project_name, domain, zone_id
  main.tf          # Provider config, locals
  d1.tf            # cloudflare_d1_database
  r2.tf            # cloudflare_r2_bucket
  kv.tf            # cloudflare_workers_kv_namespace
  routes.tf        # cloudflare_workers_route for winpodiums.com (when zone_id set)
  outputs.tf       # Names/IDs for Wrangler bindings
  terraform.tfvars.example  # Copy to terraform.tfvars (not committed)
```

## Local Usage

1. **Prerequisites**: [Terraform](https://www.terraform.io/downloads) >= 1.5, Cloudflare API token with appropriate permissions.
2. **Secrets**: Never commit `.tfvars` with credentials. Use env or a local `terraform.tfvars` (gitignored):

   ```bash
   export CLOUDFLARE_API_TOKEN="your-api-token"
   cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
   # Edit terraform.tfvars with your cloudflare_account_id
   ```

3. **Commands** (from repo root or `infra/terraform`):

   ```bash
   cd infra/terraform
   terraform init
   terraform plan -var="cloudflare_account_id=YOUR_ACCOUNT_ID" -var="environment=dev"
   terraform apply -var="cloudflare_account_id=YOUR_ACCOUNT_ID" -var="environment=dev"
   ```

4. **Outputs**: After apply, use `terraform output` to get D1 name, R2 bucket name, KV namespace ID for `wrangler.toml` bindings.

## GitHub Actions

- **Trigger**: Changes under `infra/terraform/**` or `.github/workflows/terraform.yml` (push to `main` or open/update PR).
- **Secrets** (repo or environment):
  - `CLOUDFLARE_API_TOKEN` – API token with permissions for D1, R2, KV, Workers, Zone.
  - `CLOUDFLARE_ACCOUNT_ID` – Cloudflare account ID.
  - `CLOUDFLARE_ZONE_ID` (optional) – Zone ID for winpodiums.com; when set, Terraform creates Worker routes for winpodiums.com and www.winpodiums.com.
- **Jobs**:
  1. **Validate**: `terraform fmt -check`, `init -backend=false`, `validate`.
  2. **Plan**: Full `terraform plan` with prod/dev env based on branch; on PR, plan artifact is uploaded.
  3. **Apply**: Runs on **push to `main`** or **workflow_dispatch** with “Run terraform apply” enabled; uses `environment=prod`. Optionally protect the `production` environment with required reviewers.

## Backend (State)

Default is **local** backend. For team or CI stability:

- **Terraform Cloud**: Configure `backend "remote"` in `versions.tf` and set `TF_CLOUD_ORGANIZATION` (and workspace) in GitHub Actions.
- **R2 (S3-compatible)**: Use `backend "s3"` with your R2 bucket and key; store credentials in GitHub Secrets and expose in the workflow.

See comments in `infra/terraform/versions.tf` for placeholders.

## Custom domain (winpodiums.com)

1. Add **winpodiums.com** to Cloudflare (Dashboard → Add site) and set nameservers at your registrar.
2. In Terraform: set **zone_id** (Dashboard → winpodiums.com → Overview → Zone ID) in `terraform.tfvars` or pass `-var="zone_id=YOUR_ZONE_ID"`. Apply creates Worker route patterns for `winpodiums.com/*` and `www.winpodiums.com/*`.
3. In **wrangler.toml**, add routes with that zone so your Worker is attached:
   ```toml
   routes = [
     { pattern = "winpodiums.com/*", zone_id = "YOUR_ZONE_ID" },
     { pattern = "www.winpodiums.com/*", zone_id = "YOUR_ZONE_ID" }
   ]
   ```
4. In CI: set repo secret **CLOUDFLARE_ZONE_ID** so plan/apply create the routes in prod.

## Wrangler binding

After Terraform apply, set your Worker bindings to the created resources, for example:

```toml
# wrangler.toml (in your Worker app)
[[d1_databases]]
binding = "DB"
database_name = "winpodiums-prod-db"   # Use terraform output d1_database_name

[[r2_buckets]]
binding = "R2"
bucket_name = "winpodiums-prod-storage" # Use terraform output r2_bucket_name

[[kv_namespaces]]
binding = "KV"
id = "..."   # Use terraform output kv_namespace_id
```

## Security and Conventions

- Do **not** commit `terraform.tfvars`, `.terraform/`, or `*.tfstate` (see `.gitignore`).
- Use least-privilege Cloudflare API tokens; restrict to the account and required resources.
- Follow [GitHub change control](../../.cursor/skills/github-change-control/) for PRs (scope, risk, rollback, docs).

## Related

- [Database schema](../../design/data-models/database-schema.md) – D1 tables and migrations (Wrangler).
- [High-level design](high-level-design.md) – Overall architecture.
- [API](../../api/) – Endpoints and OpenAPI.
