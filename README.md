# WinPodiums.com

Luxury, merit-based community for elite sim racers. Access is earned through verified podium finishes via the WinPodiums SimHub plugin, with Discord as the sole identity provider.

## Status

- **Phase**: Planning & Design (pre-MVP)
- **Current focus**: PRD-first workflow, then Tech Plans (LLDs). **No application code yet** — no Worker app, no SimHub plugin project.
- **Infrastructure**: Terraform (D1, R2, KV, optional winpodiums.com routes) and GitHub Actions are in place; **do not run `terraform apply` until a minimal Worker exists** to use those resources.

**Recommended next steps**: See [docs/architecture/next-steps.md](docs/architecture/next-steps.md) for the full sequence: close doc gaps → define Phase 1 scope → set up repo structure (Worker + plugin) → implement Phase 1 → then deploy infra and app.

## What this repo contains

- Product and technical documentation (PRDs, tech plans, HLD, ADRs, design system)
- API spec (OpenAPI), database schema, Discord and SimHub LLDs
- Infrastructure as code (Terraform for Cloudflare) and CI (GitHub Actions)
- SimHub plugin and Worker backend **plans** (implementation pending)

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

## Getting started (coming soon)

This repo is in planning mode. Implementation instructions will be added once the PRD and tech plans are finalized.

## Contributing

Guidelines will be added in `CONTRIBUTING.md`.

## Security

Security policy will be added in `SECURITY.md`.

## License

License will be added in `LICENSE`.