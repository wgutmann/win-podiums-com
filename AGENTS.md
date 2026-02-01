# Agent instructions

Project-level guidance for AI agents working in this repo.

**ContextStream bootstrap (mandatory, no exceptions):** When ContextStream MCP is available, **every new chat** you must do this first, before any other tool or reply: (1) call `session_init(folder_path=<repo root>, context_hint=<user's message or "WinPodiums Phase 1 MVP">)` then (2) call `context_smart(user_message=<user's message>)`. On **every subsequent message** in that chat, call `context_smart(user_message=<current message>)` at the start of your turn. Do not skip these; they load project memory and decisions. If ContextStream is unavailable, fall back to reading this file and [docs/architecture/next-steps.md](docs/architecture/next-steps.md).

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
- **Security**: Secrets hygiene, auth, Cloudflare security, CI security, test coverage for security-sensitive code; use the security skill. Canonical choices: [ADR-006 Security Choices](docs/architecture/decisions/006-security-choices.md).
- **Terraform**: **Out of scope until explicitly introduced as a feature.** The directory `infra/terraform/` exists but is not part of the standard workflow. Do not run, document, or depend on Terraform in guides or next steps unless the user explicitly asks for Terraform/infra-as-code as a feature.

## Pre-push: run tests locally

- **Before pushing to a remote branch**, run local tests; **at least 80% of tests must pass** before pushing. See [Run tests before push](docs/guides/development.md#run-tests-before-push) in the development guide for commands (CI-equivalent typecheck, lint, plugin build, worker smoke, OpenAPI validation). Agents must run or advise running these checks and block or warn on push if the pass threshold is not met.
- **Enforce with a git hook:** Contributors can run `git config core.hooksPath .githooks` once per clone so git (and Cursor) blocks push until the pre-push check passes (≥80%). Hook runs `scripts/pre-push-check.js`.

## Conventions

- Prefer skills in `.cursor/skills` for domain-specific tasks.
- **ContextStream (when MCP enabled):** (1) **Every new session (mandatory):** first action must be `session_init` then `context_smart`; on every later message, call `context_smart` at the start of your turn—do not skip. (2) **Before Grep/Read:** use ContextStream `search` (hybrid/semantic) first for code or docs. (3) **Decisions:** recall or capture via session/memory tools; after significant choices, capture with file path. (4) **Refactors:** use `graph(dependencies|impact)` before changing code. (5) **Lessons:** use `capture_lesson` when the user corrects a mistake. If ContextStream is unavailable, fall back to [AGENTS.md](AGENTS.md) and [docs/architecture/next-steps.md](docs/architecture/next-steps.md). See [development guide](docs/guides/development.md#ai-tooling-optional) and `.cursor/rules/contextstream.mdc`.
- **Documentation**: Use the cursor-project-docs skill; canonical docs in `docs/`. Follow PRD → HLD → Tech Plan.
- **Implementation order**: Follow [docs/architecture/next-steps.md](docs/architecture/next-steps.md). Layout: `apps/api/` (Worker), `apps/plugin/` (SimHub plugin). Current step: test locally, then deploy (Wrangler); Terraform is not in scope.
- Do not commit secrets, tokens, or `.dev.vars` / `.env` files with credentials.
