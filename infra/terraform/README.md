# Terraform – Cloudflare IaC

Terraform root for WinPodiums Cloudflare resources (D1, R2, KV). GitHub Actions runs plan on PR and apply on push to `main`.

- **Full docs**: [docs/architecture/infrastructure.md](../../docs/architecture/infrastructure.md)
- **Local**: Copy `terraform.tfvars.example` → `terraform.tfvars`, set `cloudflare_account_id`, then `terraform init` and `terraform plan/apply`. Use `CLOUDFLARE_API_TOKEN` in env; do not commit `.tfvars` or state.
- **CI**: Repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; workflow at [.github/workflows/terraform.yml](../../.github/workflows/terraform.yml).

### R2 backend (TLS handshake failure)

If `terraform init -reconfigure -backend-config=backend.r2.hcl` fails with `remote error: tls: handshake failure`:

1. **Try GODEBUG** (Go 1.22+ cipher workaround):  
   PowerShell: `$env:GODEBUG="tlsrsakex=1"; terraform init -reconfigure -backend-config=backend.r2.hcl`  
   Bash: `GODEBUG=tlsrsakex=1 terraform init -reconfigure -backend-config=backend.r2.hcl`

2. **If that still fails**: TLS to R2 is failing on this network (curl to the R2 endpoint fails too). Use **local backend** so you can keep working:
   - In `versions.tf`, comment out the whole `backend "s3" { ... }` block and uncomment `backend "local" { path = "terraform.tfstate" }`.
   - Run `terraform init -reconfigure` (no `-backend-config`).
   - Do not commit `terraform.tfstate` or `.terraform/`. Use R2 backend in CI or on a network where TLS to R2 works.
