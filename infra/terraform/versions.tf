terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  # Backend: local by default. For team/CI, use Terraform Cloud or an S3-compatible backend (e.g. R2).
  # backend "remote" { organization = "your-org"; workspaces { name = "winpodiums" } }
  # backend "s3" { bucket = "tfstate"; key = "winpodiums/terraform.tfstate"; region = "auto"; endpoint = "https://<account_id>.r2.cloudflarestorage.com" }
}
