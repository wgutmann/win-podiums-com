provider "cloudflare" {
  # CLOUDFLARE_API_TOKEN and optionally CLOUDFLARE_ACCOUNT_ID are read from env in CI.
  # For local use: export CLOUDFLARE_API_TOKEN=... and pass -var="cloudflare_account_id=..."
  # Do not put tokens in .tfvars; use env or a non-committed tfvars file.
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}
