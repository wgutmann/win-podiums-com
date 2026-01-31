variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID (used for Workers, D1, R2, KV)."
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Environment name (e.g. dev, staging, prod). Used for resource naming."
}

variable "project_name" {
  type        = string
  default     = "winpodiums"
  description = "Project name used as a prefix for Cloudflare resources."
}

# Custom domain (e.g. winpodiums.com). Used for Worker route patterns when zone_id is set.
variable "domain" {
  type        = string
  default     = "winpodiums.com"
  description = "Primary domain for Workers routes (e.g. winpodiums.com)."
}

# Optional: zone_id for attaching Workers routes to the domain.
# Set this when winpodiums.com is added to Cloudflare (Dashboard → domain → Overview → Zone ID).
variable "zone_id" {
  type        = string
  default     = null
  description = "Cloudflare zone ID for the primary domain (optional)."
}

