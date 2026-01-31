# D1 database for WinPodiums (users, auth, race results, etc.).
# Schema and migrations are applied via Wrangler (see docs/design/data-models/database-schema.md).
resource "cloudflare_d1_database" "main" {
  account_id = var.cloudflare_account_id
  name       = "${local.name_prefix}-db"
}
