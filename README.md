# WinPodiums.com

Luxury, merit-based community for elite sim racers. Access is earned through verified podium finishes via the WinPodiums SimHub plugin, with Discord as the sole identity provider.

## Status

- **Phase**: Phase 1 MVP (structure + minimal API + Docker dev)
- **Current focus**: Docker-based dev environment for the API; minimal Worker in `apps/api/`. **Do not run `terraform apply`** until you are ready to deploy the Worker to Terraform-created resources.
- **Infrastructure**: Terraform (D1, R2, KV, optional routes) and GitHub Actions are in place.

**Recommended next steps**: See [docs/architecture/next-steps.md](docs/architecture/next-steps.md). Development: [docs/guides/development.md](docs/guides/development.md) (Docker-first).

## What this repo contains

- Product and technical documentation (PRDs, tech plans, HLD, ADRs, design system)
- API spec (OpenAPI), database schema, Discord and SimHub LLDs
- Infrastructure as code (Terraform for Cloudflare) and CI (GitHub Actions)
- **Worker app** (`apps/api/`) — minimal API (health, Gate); run via **Docker** (recommended) or `wrangler dev` on host
- **Docker dev environment** — `Dockerfile` and `compose.yaml` for local/repo parity (see [AGENTS.md](AGENTS.md))

## Documentation

Start here:
- **Next steps (pre-deployment)**: `docs/architecture/next-steps.md` — What to do before deploying anything
- `docs/architecture/high-level-design.md` — System overview and architecture
- `docs/architecture/decisions/` — Architecture Decision Records (ADRs)
- `docs/design/` — Component and integration design (tech plans)
- `docs/brand/design-system.md` — Visual design system
- `docs/api/README.md` — API overview
- `.cursor/docs/index.md` — Cursor indexing summary

## Stack (planned)

- Web/API: Cloudflare Workers
- Data: Cloudflare D1 (SQLite), R2 for assets
- Desktop: C#/.NET Framework 4.8 (SimHub plugin)
- Identity: Discord OAuth2 (Authorization Code + PKCE)

## Getting started

- **API (Docker, recommended)**: From repo root run `docker compose up`. API at **http://localhost:8787** (health: `/health`, Gate: `/` or `/gate`).
- **API (host)**: `cd apps/api && npm install && npx wrangler dev`.
- **Docs**: [docs/guides/development.md](docs/guides/development.md) — Docker-first dev; [docs/architecture/next-steps.md](docs/architecture/next-steps.md) — pre-deploy sequence.

## Contributing

Guidelines will be added in `CONTRIBUTING.md`.

## Security

Security policy will be added in `SECURITY.md`.

## License

License will be added in `LICENSE`.