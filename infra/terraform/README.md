# Terraform – Cloudflare IaC

Terraform root for WinPodiums Cloudflare resources (D1, R2, KV). GitHub Actions runs plan on PR and apply on push to `main`.

- **Full docs**: [docs/architecture/infrastructure.md](../../docs/architecture/infrastructure.md)
- **Local**: Copy `terraform.tfvars.example` → `terraform.tfvars`, set `cloudflare_account_id`, then `terraform init` and `terraform plan/apply`. Use `CLOUDFLARE_API_TOKEN` in env; do not commit `.tfvars` or state.
- **CI**: Repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; workflow at [.github/workflows/terraform.yml](../../.github/workflows/terraform.yml).
