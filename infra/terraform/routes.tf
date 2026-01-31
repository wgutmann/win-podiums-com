# Worker routes for custom domain (winpodiums.com and www).
# Only created when zone_id is set. Attach your Worker to these routes via wrangler.toml (routes with zone_id).

resource "cloudflare_workers_route" "root" {
  count   = var.zone_id != null ? 1 : 0
  zone_id = var.zone_id
  pattern = "${var.domain}/*"
}

resource "cloudflare_workers_route" "www" {
  count   = var.zone_id != null ? 1 : 0
  zone_id = var.zone_id
  pattern = "www.${var.domain}/*"
}
