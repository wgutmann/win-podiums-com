output "d1_database_name" {
  value       = cloudflare_d1_database.main.name
  description = "D1 database name for Wrangler bindings (wrangler.toml [[d1_databases]] database_name)."
}

output "d1_database_id" {
  value       = cloudflare_d1_database.main.id
  description = "D1 database UUID (for API/wrangler)."
}

output "r2_bucket_name" {
  value       = cloudflare_r2_bucket.storage.name
  description = "R2 bucket name for Wrangler bindings (wrangler.toml [[r2_buckets]] bucket_name)."
}

output "kv_namespace_id" {
  value       = cloudflare_workers_kv_namespace.cache.id
  description = "KV namespace ID for Wrangler bindings (wrangler.toml [[kv_namespaces]] id)."
}

output "kv_namespace_title" {
  value       = cloudflare_workers_kv_namespace.cache.title
  description = "KV namespace human-readable title."
}

output "domain_routes" {
  value       = var.zone_id != null ? ["${var.domain}/*", "www.${var.domain}/*"] : []
  description = "Worker route patterns created for custom domain (when zone_id is set)."
}
