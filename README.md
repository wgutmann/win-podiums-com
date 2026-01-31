# WinPodiums.com

Luxury, merit-based community for elite sim racers. Access is earned through verified podium finishes via the WinPodiums SimHub plugin, with Discord as the sole identity provider.

## Status

- Phase: Planning & Design (pre-MVP)
- Current focus: PRD-first workflow, then Tech Plans (LLDs)

## What this repo contains

- Product and technical documentation
- Architecture decisions and design system
- SimHub plugin and backend plans (implementation pending)

## Documentation

Start here:
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