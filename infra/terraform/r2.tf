# R2 bucket for plugin downloads and static assets (ADR-004, ADR-005).
resource "cloudflare_r2_bucket" "storage" {
  account_id = var.cloudflare_account_id
  name       = "${local.name_prefix}-storage"
  location   = "enam" # Eastern North America; optional, use wnam/weur/eeur/apac/oc if needed
}
