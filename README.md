# WinPodiums.com

Luxury, merit-based community for elite sim racers. Access is earned through verified podium finishes via the WinPodiums SimHub plugin, with Discord as the sole identity provider.

## Status

- **Phase**: Phase 1 MVP — implementation complete; local D1 schema applied.
- **Current focus**: Configure Discord + `.dev.vars`, test Worker and plugin locally; deploy when ready (see [docs/guides/deployment.md](docs/guides/deployment.md)).

**Run and test locally with Docker**: Start the API with `docker compose up`; run tests against it with `docker compose up -d && cd apps/api && npm test`. Worker and Docker use the same config (`wrangler.toml` + `.dev.vars`).

**Terraform**: Not part of the default workflow. The directory `infra/terraform/` exists for future use; ignore it until explicitly introduced as a feature. See [AGENTS.md](AGENTS.md).

**Recommended next steps**: See [docs/architecture/next-steps.md](docs/architecture/next-steps.md). Development: [docs/guides/development.md](docs/guides/development.md) (Docker-first).

## What this repo contains

- Product and technical documentation (PRDs, tech plans, HLD, ADRs, design system)
- API spec (OpenAPI), database schema, Discord and SimHub LLDs
- **Worker app** (`apps/api/`) — API + Gate; run and test via **Docker** (see [Development Guide](docs/guides/development.md))
- **Docker dev environment** — `Dockerfile` and `compose.yaml`; local run and tests use Docker so config stays 1:1 with the Worker

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

- **Run locally**: From repo root run `docker compose up`. API at **http://localhost:8787** (health: `/health` or `/api/health`, Gate: `/` or `/gate`).
- **Test**: With Docker running (`docker compose up -d`), run `cd apps/api && npm test` to validate the API (smoke test against Docker).
- **Docs**: [docs/guides/development.md](docs/guides/development.md) — run and test with Docker; [docs/architecture/next-steps.md](docs/architecture/next-steps.md) — pre-deploy sequence.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) (stub; full guidelines as implementation progresses).

## Security

See [SECURITY.md](SECURITY.md) (stub; full policy before production).

## License

License will be added in `LICENSE`.
