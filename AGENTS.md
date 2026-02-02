# Agent instructions

Project-level guidance for AI agents working in this repo.

**ContextStream (when MCP is available):** Follow [.cursor/rules/contextstream.mdc](.cursor/rules/contextstream.mdc). First message: **init** then **context**; every later message: **context** at the start of your turn; before Grep/Read: **search**(hybrid/semantic) first. If ContextStream is unavailable, fall back to this file and [docs/architecture/next-steps.md](docs/architecture/next-steps.md).

## Current phase

- **Phase**: Phase 1 MVP. Worker in `apps/api/` and SimHub plugin in `apps/plugin/`; real Discord OAuth, D1, plugin auth + heartbeat. **Current focus**: Test Worker and plugin locally; deploy when ready (see [docs/architecture/next-steps.md](docs/architecture/next-steps.md)).
- **Worker and Docker are 1:1**: Same app runs via Docker; one codebase, one config (`wrangler.toml` + `.dev.vars`). **Run and test locally with Docker**: start API with `docker compose up`, run tests against it with `docker compose up -d && cd apps/api && npm test`. Do not document or implement divergent “Docker vs Worker” flows.

## Dev/Cloud parity (non-negotiable)

- **Cloud production MUST match dev environment 1:1.** Dev is the source of truth; cloud deployment is the same app. No divergent flows.
- **Test everything locally first.** Use Cloudflare only for what strictly requires it: deployment, production D1/R2/KV, global routing, custom domains. See [ADR-007 Dev/Cloud Parity](docs/architecture/decisions/007-dev-cloud-parity-local-first.md) for the full "what needs Cloudflare" list.
- **Do not introduce** features that only work in Cloudflare and cannot be validated locally, unless explicitly justified.

## Stack and scope

- **Cloudflare (web/API)**: Workers (TypeScript), D1, R2, KV. Use the cloudflare-workers skill. Prefer Wrangler for local dev and deployment. Config: `apps/api/wrangler.toml` and `.dev.vars`; never commit secrets.
- **.NET (SimHub only)**: C#/.NET Framework 4.8 for the SimHub plugin.
- **SimHub**: Plugin work; use the simhub-plugin-builder skill when relevant. **Only supported SimHub path**: `C:\Program Files (x86)\SimHub\` (plugins in `...\Plugins`); no other install locations are supported.
- **Discord**: Auth and integrations; use the discord-authentication skill when relevant.
- **Docker**: Dev environment; use the docker-dev-environment skill. Run and test locally with Docker; tests run against the Dockerized API so config stays 1:1.
- **GitHub**: Change control, PRs, secrets; use the github-change-control skill when relevant. PRs must use the PR template with Traceability, Doc links, and traceability labels (see [CONTRIBUTING](CONTRIBUTING.md) and [ContextStream mapping §1.4](docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible)). When introducing a new PRD or tech plan, add traceability-mapping and labels in the same PR; labels sync on PR open.
- **Security**: Secrets hygiene, auth, Cloudflare security, CI security, test coverage for security-sensitive code; use the security skill. Canonical choices: [ADR-006 Security Choices](docs/architecture/decisions/006-security-choices.md).
- **Terraform**: **Out of scope until explicitly introduced as a feature.** The directory `infra/terraform/` exists but is not part of the standard workflow. Do not run, document, or depend on Terraform in guides or next steps unless the user explicitly asks for Terraform/infra-as-code as a feature.
- **Project subagents** (`.cursor/agents/`): Testing, API contract, local bootstrap, deployment, telemetry proof, and CI are subagents only (not skills). Delegate to the matching subagent; do not add skills with those names. One subagent per domain; no duplicates. See [.cursor/agents/README.md](.cursor/agents/README.md).

## Pre-push: run tests locally

- **Before pushing to a remote branch**, run local tests; **at least 80% of tests must pass** before pushing. See [Run tests before push](docs/guides/development.md#run-tests-before-push) in the development guide for commands (CI-equivalent typecheck, lint, plugin build, worker smoke, OpenAPI validation). Agents must run or advise running these checks and block or warn on push if the pass threshold is not met.
- **Enforce with a git hook:** Contributors can run `git config core.hooksPath .githooks` once per clone so git (and Cursor) blocks push until the pre-push check passes (≥80%). Hook runs `scripts/pre-push-check.js`.

## Conventions


- **Leveragable lessons:** See [docs/guides/leveragable-lessons.md](docs/guides/leveragable-lessons.md) for the 12 project lessons. Apply them when making changes.
- Prefer skills in `.cursor/skills` for domain-specific tasks.
- **ContextStream (when MCP enabled):** See [.cursor/rules/contextstream.mdc](.cursor/rules/contextstream.mdc) for bootstrap, search-first, decisions, graph, and lessons. If ContextStream is unavailable, fall back to this file and [docs/architecture/next-steps.md](docs/architecture/next-steps.md). See [development guide](docs/guides/development.md#ai-tooling-optional).
- **Documentation**: Use the cursor-project-docs skill; canonical docs in `docs/`. Follow PRD → HLD → Tech Plan.
- **Implementation order**: Follow [docs/architecture/next-steps.md](docs/architecture/next-steps.md). Layout: `apps/api/` (Worker), `apps/plugin/` (SimHub plugin). Current step: test locally, then deploy (Wrangler); Terraform is not in scope.
- Do not commit secrets, tokens, or `.dev.vars` / `.env` files with credentials.
