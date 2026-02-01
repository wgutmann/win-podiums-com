# WinPodiums API — same Worker as wrangler.toml (1:1)
# Build: docker compose build  |  Run: docker compose up
# Use Debian-based image so Wrangler's workerd binary (linux64) runs correctly
FROM node:20-bookworm-slim

WORKDIR /app

# Copy dependency manifests and install (cache layer)
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci

# Copy Worker config and source (wrangler.toml must match Worker bindings)
COPY apps/api/wrangler.toml apps/api/tsconfig.json apps/api/worker-configuration.d.ts ./
COPY apps/api/src ./src
COPY apps/api/migrations ./migrations

# Wrangler reads .dev.vars from project dir; use env_file in compose and CLOUDFLARE_INCLUDE_PROCESS_ENV so env matches
ENV CLOUDFLARE_INCLUDE_PROCESS_ENV=true

EXPOSE 8787

CMD ["npx", "wrangler", "dev", "--local", "--port", "8787", "--ip", "0.0.0.0"]
