# Agent instructions

Project-level guidance for AI agents working in this repo.

## Stack and scope

- **.NET**: Primary application stack; follow existing .NET/.gitignore conventions.
- **SimHub**: Plugin and integration work; use the simhub-plugin-builder skill when relevant.
- **Discord**: Auth and integrations; use the discord-authentication skill when relevant.
- **Docker**: Dev environment and parity; use the docker-dev-environment skill when relevant.
- **GitHub**: Change control, PRs, and secrets; use the github-change-control skill when relevant.
- **Cloudflare**: Use for Workers, Pages, D1, R2, or other Cloudflare products when doing edge/API or front-end hosting. Prefer Wrangler for local dev and deployment; keep secrets in `.dev.vars` (or env-specific files) and never commit them. Follow Cloudflare docs and MCP/Context7 when wiring APIs or config.

## Conventions

- Prefer skills in `.cursor/skills` for domain-specific tasks.
- Do not commit secrets, tokens, or `.dev.vars` / `.env` files with credentials.
