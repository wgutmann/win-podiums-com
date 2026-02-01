# R2 backend config — copy to backend.r2.hcl and fill in. Do not commit backend.r2.hcl.
# Run: terraform init -reconfigure -backend-config=backend.r2.hcl
#
# Replace <account_id> in versions.tf endpoint with your Cloudflare account ID.
# Create R2 bucket "tfstate" and R2 API token in Dashboard → R2.

# Terraform S3 backend expects "access_key" and "secret_key" (not access_key_id/secret_access_key).
access_key = "e81fa3772f30198ddc513e25275bdc31"
secret_key = "f9ca2665865300433363860a1e0a2fbb606cd2f7ffd3a5a6ea7244893a82df34"