# WinPodiums API — same Worker as wrangler.toml (1:1)
# Build: docker compose build  |  Run: docker compose up
# Use Debian-based image so Wrangler's workerd binary (linux64) runs correctly
FROM node:20-bookworm-slim

# CA certificates so outbound HTTPS (e.g. Discord API) passes TLS verification
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

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

# Healthcheck: /api/health must return 200 (uses Node built-in http, no extra deps)
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8787/api/health', (r) => { r.resume(); process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1))" || exit 1

# Regenerate openapi-spec at startup so Swagger works with volume-mounted src.
# Apply D1 migrations so local DB has tables (avoids "internal error" on login callback).
CMD ["sh", "-c", "node scripts/inline-openapi.js openapi.yaml src/openapi-spec.ts && npx wrangler d1 migrations apply winpodiums-dev-db --local && npx wrangler dev --local --port 8787 --ip 0.0.0.0"]
