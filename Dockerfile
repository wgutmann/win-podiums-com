# WinPodiums API — same Worker as wrangler.toml (1:1)
# Build: docker compose build  |  Run: docker compose up
# Use Debian-based image so Wrangler's workerd binary (linux64) runs correctly
FROM node:20-bookworm-slim

# workerd TLS uses system/NODE_EXTRA_CA_CERTS; slim may have minimal CAs. Ensure full bundle so
# outbound HTTPS (e.g. Discord OAuth) succeeds. See cloudflare/workers-sdk#4081.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

WORKDIR /app

# Copy dependency manifests and install (cache layer)
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci

# Copy Worker config and source (wrangler.toml must match Worker bindings)
COPY apps/api/wrangler.toml apps/api/tsconfig.json apps/api/worker-configuration.d.ts ./
COPY apps/api/src ./src
COPY apps/api/scripts ./scripts
COPY docs/api/openapi.yaml ./openapi.yaml
RUN node scripts/inline-openapi.js openapi.yaml src/openapi-spec.ts
COPY apps/api/migrations ./migrations

# Wrangler reads .dev.vars from project dir; use env_file in compose and CLOUDFLARE_INCLUDE_PROCESS_ENV so env matches
ENV CLOUDFLARE_INCLUDE_PROCESS_ENV=true

EXPOSE 8787

# Regenerate openapi-spec at startup; apply D1 migrations so local DB has tables; then start Worker
CMD ["sh", "-c", "node scripts/inline-openapi.js openapi.yaml src/openapi-spec.ts && npx wrangler d1 migrations apply winpodiums-dev-db --local && npx wrangler dev --local --port 8787 --ip 0.0.0.0"]
