# Agent instructions

Project-level guidance for AI agents working in this repo.

## Current phase

- **Phase**: Planning & Design (pre-MVP). No application code yet — no Worker app, no SimHub plugin project.
- **Do not run `terraform apply`** until a minimal Cloudflare Worker exists that can bind to D1/R2/KV. Use Terraform for plan/validate only. See [docs/architecture/next-steps.md](docs/architecture/next-steps.md) for recommended order of work.

## Stack and scope

- **Cloudflare (web/API)**: Workers (TypeScript), D1, R2, KV for edge/API and front-end. Use the cloudflare-workers skill when configuring or implementing Workers/D1/R2/KV. Prefer Wrangler for local dev and deployment. Keep secrets in `.dev.vars` (or env-specific files); never commit them. Follow Cloudflare docs and MCP/Context7 when wiring APIs or config.
- **.NET (SimHub only)**: C#/.NET Framework 4.8 for the SimHub plugin; follow existing .NET/.gitignore conventions.
- **SimHub**: Plugin and integration work; use the simhub-plugin-builder skill when relevant.
- **Discord**: Auth and integrations; use the discord-authentication skill when relevant.
- **Docker**: Dev environment and parity; use the docker-dev-environment skill when relevant.
- **GitHub**: Change control, PRs, and secrets; use the github-change-control skill when relevant.
- **Terraform**: Infra lives in `infra/terraform/`. Plan and validate only until a minimal Worker exists; see next-steps above.

## Conventions

- Prefer skills in `.cursor/skills` for domain-specific tasks.
- **Documentation**: Use the cursor-project-docs skill for repo docs, PRDs, tech plans, and `.cursor/docs/`. Follow PRD → HLD → Tech Plan; canonical docs live in `docs/` (see [docs/standards/documentation-standards.md](docs/standards/documentation-standards.md)).
- **Implementation order**: When adding code, follow the sequence in [docs/architecture/next-steps.md](docs/architecture/next-steps.md) (doc gaps → Phase 1 scope → repo structure → Phase 1 implementation → then Terraform apply and deploy). Do not invent `workers/` or `plugin/` paths until the repo structure step is done; align with the documented layout.
- Do not commit secrets, tokens, or `.dev.vars` / `.env` files with credentials.
