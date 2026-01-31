# Workers KV namespace for caching (user profiles, rate limits) per ADR-005 cost optimization.
resource "cloudflare_workers_kv_namespace" "cache" {
  account_id = var.cloudflare_account_id
  title     = "${local.name_prefix}-cache"
}
