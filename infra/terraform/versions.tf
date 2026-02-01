terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }

  # Backend: R2 for shared state. If TLS to R2 fails on this network (e.g. corporate proxy),
  # use local backend: comment out backend "s3" { ... }, uncomment backend "local" below, then
  # terraform init -reconfigure. Do not commit .terraform/ or terraform.tfstate.
  # backend "remote" { organization = "your-org"; workspaces { name = "winpodiums" } }
  backend "local" { path = "terraform.tfstate" }
  # backend "s3" {
  #   bucket                       = "win-podiums-com-tfstate"
  #   key                          = "win-podiums-com-terraform.tfstate"
  #   region                       = "auto"
  #   workspace_key_prefix         = ""
  #   skip_credentials_validation  = true
  #   skip_metadata_api_check      = true
  #   skip_region_validation       = true
  #   skip_requesting_account_id   = true
  #   skip_s3_checksum             = true
  #   use_path_style               = true
  #   endpoints = {
  #     s3 = "https://02a88ffc-ae2e-45bb-afe6-cee0a4010729.r2.cloudflarestorage.com"
  #   }
  # }
}
