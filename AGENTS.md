# Agent instructions

Project-level guidance for AI agents working in this repo.

## Current phase

- **Phase**: Phase 1 MVP. Worker in `apps/api/` and SimHub plugin in `apps/plugin/`; real Discord OAuth, D1, plugin auth + heartbeat. **Current focus**: Test Worker and plugin locally; deploy when ready (see [docs/architecture/next-steps.md](docs/architecture/next-steps.md)).
- **Worker and Docker are 1:1**: Same app runs via Docker; one codebase, one config (`wrangler.toml` + `.dev.vars`). **Run and test locally with Docker**: start API with `docker compose up`, run tests against it with `docker compose up -d && cd apps/api && npm test`. Do not document or implement divergent “Docker vs Worker” flows.

## Stack and scope

- **Cloudflare (web/API)**: Workers (TypeScript), D1, R2, KV. Use the cloudflare-workers skill. Prefer Wrangler for local dev and deployment. Config: `apps/api/wrangler.toml` and `.dev.vars`; never commit secrets.
- **.NET (SimHub only)**: C#/.NET Framework 4.8 for the SimHub plugin.
- **SimHub**: Plugin work; use the simhub-plugin-builder skill when relevant.
- **Discord**: Auth and integrations; use the discord-authentication skill when relevant.
- **Docker**: Dev environment; use the docker-dev-environment skill. Run and test locally with Docker; tests run against the Dockerized API so config stays 1:1.
- **GitHub**: Change control, PRs, secrets; use the github-change-control skill when relevant.
- **Terraform**: **Out of scope until explicitly introduced as a feature.** The directory `infra/terraform/` exists but is not part of the standard workflow. Do not run, document, or depend on Terraform in guides or next steps unless the user explicitly asks for Terraform/infra-as-code as a feature.

## Conventions

- Prefer skills in `.cursor/skills` for domain-specific tasks.
- **ContextStream (when MCP enabled):** (1) **Every new session:** call `session_init` (repo folder path + short context hint) then `context_smart`. If ContextStream MCP is unavailable or returns no useful context, fall back to reading [AGENTS.md](AGENTS.md) and [docs/architecture/next-steps.md](docs/architecture/next-steps.md). (2) **Before Grep/Read:** use ContextStream `search` (hybrid/semantic) first for code or docs. (3) **Decisions:** recall or capture via session/memory tools; after significant choices, capture with file path. (4) **Refactors:** use `graph(dependencies|impact)` before changing code. (5) **Lessons:** use `capture_lesson` when the user corrects a mistake. See [development guide](docs/guides/development.md#ai-tooling-optional) and `.cursor/rules/contextstream.mdc`.
- **Documentation**: Use the cursor-project-docs skill; canonical docs in `docs/`. Follow PRD → HLD → Tech Plan.
- **Implementation order**: Follow [docs/architecture/next-steps.md](docs/architecture/next-steps.md). Layout: `apps/api/` (Worker), `apps/plugin/` (SimHub plugin). Current step: test locally, then deploy (Wrangler); Terraform is not in scope.
- Do not commit secrets, tokens, or `.dev.vars` / `.env` files with credentials.
