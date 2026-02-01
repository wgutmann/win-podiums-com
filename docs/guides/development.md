# Development Guide

**Last Updated**: 2026-01-31

## Overview

**Run and test locally with Docker.** The API (Worker) runs in a container; you run tests against it from the host. Docker and the Worker use the same config (`wrangler.toml` + `apps/api/.dev.vars`), so behavior is 1:1. The SimHub plugin is built and run on the host (Windows/.NET); no container yet.

## Prerequisites

- **Docker** and **Docker Compose** — required for running and testing the API locally
- **Node.js** (LTS) — for running tests on the host (e.g. `npm test` in `apps/api`)
- **.NET Framework 4.8** and **Visual Studio** — for SimHub plugin (host only)
- **Git** — version control

## Repository Layout

- **`apps/api/`** — Cloudflare Worker (API + static Gate). Run via Docker; tests run against the Dockerized API.
- **`apps/plugin/`** — SimHub plugin (C# / .NET Framework 4.8). Build and run on host; no container yet.

## Running the API (Docker)

1. Create secrets file so Docker and Worker config match:
   ```bash
   cp apps/api/.dev.vars.example apps/api/.dev.vars
   # Edit apps/api/.dev.vars with DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, SESSION_SECRET. Do not commit.
   ```
2. From repo root:
   ```bash
   docker compose build
   docker compose up
   ```
3. API: **http://localhost:8787**
   - Health: **http://localhost:8787/health** or **http://localhost:8787/api/health**
   - Gate: **http://localhost:8787/** or **http://localhost:8787/gate**
   - **API docs (Swagger):** **http://localhost:8787/api-docs** — each endpoint is documented in Swagger; spec source is `docs/api/openapi.yaml`.
4. Live reload: edits under `apps/api/src/` are reflected (volume mount). Config in `wrangler.toml` is baked into the image; rebuild to change it.

Compose uses `env_file: ./apps/api/.dev.vars` so the container gets the same secrets the Worker expects. The Dockerfile sets `CLOUDFLARE_INCLUDE_PROCESS_ENV=true` so Wrangler passes those env vars into the Worker (config match). Wrangler is started with `--ip 0.0.0.0` so the API is reachable from the host (port 8787) for tests and the plugin.

### Useful commands

- **Logs**: `docker compose logs -f api`
- **Shell**: `docker compose exec api sh`
- **Stop**: `docker compose down`

## Testing (against Docker)

Tests run **on the host** and hit the **Dockerized API**. This validates that Docker and Worker config match (e.g. health returns `{ ok: true, env: "dev" }`).

1. Start the API in the background:
   ```bash
   docker compose up -d
   ```
2. Run tests:
   ```bash
   cd apps/api
   npm test
   ```
3. Optional: stop the API when done: `docker compose down`

If the API is not running, `npm test` will fail with a clear message: "Start Docker first: docker compose up -d".

### Smoke test

`apps/api/test/smoke.js` runs against the Dockerized API and validates: (1) Docker and Worker config match — `GET /api/health` returns `{ ok: true, env: "dev" }`; (2) error shapes — 404 for unknown routes (`GET /api/nonexistent`) and 401 for protected routes without auth (`POST /api/plugin/verify`); (3) **API documentation loads** — `GET /api-docs` and `GET /api-docs/openapi.yaml` are reachable (Swagger UI and valid OpenAPI 3 spec). Each API endpoint is documented in `docs/api/openapi.yaml` and surfaced in Swagger.

**Local checks**: Run API smoke and unit tests locally (Docker + `npm test` / `npm run test:unit`). We **recommend** adding GitHub Actions under `.github/workflows/` for CI (typecheck, lint, plugin build, lockfile, OpenAPI, security) on push/PR; see [Recommended GitHub Actions](#recommended-github-actions) below.

### API quality checks (typecheck, lint)

In `apps/api` you can run:

- **Typecheck**: `npm run typecheck` — runs `tsc --noEmit` to catch type errors.
- **Lint**: `npm run lint` — runs ESLint on `src/**/*.ts` (config in `apps/api/.eslintrc.cjs`).

We **recommend** adding a CI workflow under `.github/workflows/` to run typecheck, lint, plugin build, lockfile check, and OpenAPI validation on push/PR when relevant paths change. See [Recommended GitHub Actions](#recommended-github-actions) below.

## Config alignment (Docker and Worker)

| Source | Purpose |
|--------|---------|
| **`apps/api/wrangler.toml`** | Worker name, bindings (D1, R2, KV), `[vars]` (e.g. `ENVIRONMENT=dev`). Same file is used inside the container. |
| **`apps/api/.dev.vars`** | Secrets (DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, SESSION_SECRET). Loaded via `env_file` in compose and passed into the Worker via `CLOUDFLARE_INCLUDE_PROCESS_ENV`. |

Do not commit `.dev.vars`. Create it from `.dev.vars.example`.

## SimHub plugin (no Docker)

The plugin targets .NET Framework 4.8 and SimHub on Windows. Build and run on the host (Visual Studio or MSBuild). **To install the plugin** (build, copy DLL to SimHub Plugins folder, restart SimHub), see [Installation](../apps/plugin/README.md#installation) in the plugin README. Deploy the built DLL to `C:\Program Files (x86)\SimHub\Plugins`. Point the plugin at `http://localhost:8787` when the API is running in Docker. Official SimHub docs sometimes refer to the SimHub install root for plugin DLLs; this repo uses the `Plugins` subfolder unless your SimHub version requires otherwise.

### SimHub Plugin POC — development handoff

**Start here for plugin implementation.** Requirements and implementation order are defined in:

| Doc | Purpose |
|-----|---------|
| [PRD-001: SimHub Plugin POC](../product/simhub-plugin-poc/001-simhub-plugin-poc.md) | What to build and why; success criteria; POC complete when [TP-SPOC-005](../tech-plans/simhub-plugin-poc/005-poc-testing-completion.md) checklist is satisfied. |
| [Tech plans TP-SPOC-001–005](../tech-plans/simhub-plugin-poc/README.md) | Implementation specs; implement in order 001 → 002 → 003 → 004 → 005. |
| [SimHub Plugin LLD](../design/components/simhub-plugin.md) | Target architecture; POC implements minimal subset (browser PKCE, heartbeat, minimal UI). |

**Implementation order:** TP-SPOC-001 (skeleton, SDK, config) → 002 (auth PKCE, token storage) → 003 (API client, heartbeat) → 004 (minimal SimHub UI) → 005 (testing, POC completion). Manual E2E and minimum automated tests per TP-005 define “POC complete.”

## Wrangler bindings (D1, R2, KV)

- **D1 and R2**: `apps/api/wrangler.toml` defines bindings for local dev (`winpodiums-dev-db`, `winpodiums-dev-storage`). Docker runs Wrangler with the same config.
- **KV**: Placeholder `id` in `wrangler.toml` is fine for local dev. For remote deploy, create a KV namespace in Cloudflare and set the `id` in `wrangler.toml`.

## D1 initial schema (create empty tables)

Run migrations from the host (or once inside the container). Local D1 state is in the container; to persist it you can use a volume (optional). For a fresh schema in the container:

```bash
cd apps/api
npx wrangler d1 migrations apply winpodiums-dev-db --local
```

To run the same migration inside the running container:

```bash
docker compose exec api npx wrangler d1 migrations apply winpodiums-dev-db --local
```

Schema SQL lives in `apps/api/migrations/`. See [database schema](../design/data-models/database-schema.md).

## Phase 1 auth (Worker)

- **Secrets** (in `apps/api/.dev.vars`): `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `SESSION_SECRET` (min 32 chars for JWT). Copy from `apps/api/.dev.vars.example`.
- **Web flow**: Visit `/auth/discord` → Discord → callback → session cookie. Gate at `/` or `/gate`.
- **Plugin auth**: Primary flow is browser (PKCE). Manual token is **debug-only** (feature-flagged): when enabled, log in on web, open `/auth/token`, generate token, paste in plugin; plugin calls `POST /api/auth/token-exchange` then `POST /api/plugin/heartbeat`.

## Alternative: run API on host (no Docker)

If you need to run the API directly on the host (e.g. debugging Wrangler):

1. `cd apps/api`
2. `npm install`
3. Create `.dev.vars` from `.dev.vars.example`; do not commit.
4. `npx wrangler dev` — API at http://localhost:8787

Tests (`npm test`) still expect the API at `http://localhost:8787`; start either Docker or `wrangler dev` first.

## AI tooling (optional)

**ContextStream** ([ContextStream](https://contextstream.io)) is the recommended **persistent memory and code-intelligence** layer for AI-assisted work on this repo. It gives Cursor (and other MCP tools) shared memory across sessions, semantic code search, and decision recall so you don’t re-explain the stack every chat.

### Setup

- **Option A (project MCP):** Copy `.cursor/mcp.json.example` to `.cursor/mcp.json`, then replace `PASTE_YOUR_CONTEXTSTREAM_API_KEY_HERE` with your key from [ContextStream](https://contextstream.io) (Account → API Keys). **`.cursor/mcp.json` is in `.gitignore`** so it is never committed; the repo only has the example file. If a real key was ever committed in the past, rotate it in the ContextStream dashboard. On Windows, if Cursor is started from a shortcut, it may not inherit shell env vars; using `mcp.json` with your key avoids that.
- **Option B (wizard):** Run `npx -y @contextstream/mcp-server setup` and add ContextStream to your global Cursor MCP config; no project file change needed.

Restart Cursor after adding or changing MCP config.

### First-time setup (optional)

After connecting ContextStream, run **project(action="ingest_local")** once so the repo (code and docs) is indexed; then run the one-time bootstrap below so new sessions have context from day one.

### Optional: one-time bootstrap

After ContextStream is connected, you can bootstrap project memory once so new sessions have context:

1. In a Cursor chat, run **session_init** with `folder_path` = repo root and a short `context_hint` (e.g. "WinPodiums Phase 1 MVP: Worker + SimHub plugin; Docker and Worker 1:1").
2. Use **session(action="capture", event_type="decision", ...)** to capture key decisions. Point to the doc path in the content so ContextStream can relate decisions to code.

**Suggested decisions to capture** (one per capture, include file path in content):

| Decision | One-line summary | Doc path |
|----------|------------------|----------|
| ADR-001 | Cloudflare stack (Workers, D1, R2, KV) | [001-cloudflare-stack.md](../architecture/decisions/001-cloudflare-stack.md) |
| ADR-002 | Discord OAuth as sole identity provider | [002-discord-oauth.md](../architecture/decisions/002-discord-oauth.md) |
| ADR-003 | Hybrid auth paths (web-first + plugin-first) | [003-hybrid-auth-paths.md](../architecture/decisions/003-hybrid-auth-paths.md) |
| ADR-004 | Cloudflare-only architecture | [004-cloudflare-only-architecture.md](../architecture/decisions/004-cloudflare-only-architecture.md) |
| ADR-005 | Cost-optimized Cloudflare | [005-cost-optimized-cloudflare.md](../architecture/decisions/005-cost-optimized-cloudflare.md) |
| Worker = Docker | Same codebase and config (wrangler.toml + .dev.vars); tests run against Docker | [AGENTS.md](../../AGENTS.md) |
| Terraform out of scope | Not part of default workflow until explicitly introduced | [AGENTS.md](../../AGENTS.md) |
| Phase 1 scope | Auth, minimal Worker, basic plugin, static Gate, D1/KV; single env first | [phase-1-mvp-scope.md](../product/phase-1-mvp-scope.md) |
| Phase 1 out of scope | Full Telemetry Proof, luxury UI, Discord roles, leaderboards, full anti-cheat LLD deferred to Phase 2+ | [phase-1-mvp-scope.md](../product/phase-1-mvp-scope.md) |
| PRD-001 SimHub POC | Plugin POC: browser PKCE, heartbeat, minimal UI; complete when TP-SPOC-005 (manual E2E + min automated tests) satisfied | [001-simhub-plugin-poc.md](../product/simhub-plugin-poc/001-simhub-plugin-poc.md) |
| Free Cloudflare security only | Use only free security features (DDoS, SSL, WAF, Bot Fight); no paid add-ons for baseline | [001-free-cloudflare-security.md](../product/cloudflare-security/001-free-cloudflare-security.md) |
| Never commit secrets | Do not commit .dev.vars, .env, or tokens; rotate if ever exposed | [AGENTS.md](../../AGENTS.md), [SECURITY.md](../../SECURITY.md) |

This is optional; do it once per workspace if you want shared memory from day one.

### Graph and tagging

- **Index the repo:** Run **project(action="ingest_local")** (or equivalent) so ContextStream has code and docs; repeat after major changes. After adding or changing PRDs or tech plans, run **project(action="ingest_local")** so the graph reflects new or updated doc links.
- **PRD↔tech plan in the graph:** When capturing a decision that links a PRD to its tech plan (e.g. "we implement PRD-001 per TP-001"), include both file paths in the capture so the decision node connects both document nodes in the graph.
- **Dependency and impact:** Use **graph(action="dependencies", ...)** and **graph(action="impact", target="...")** before refactors (e.g. "what breaks if I change UserService?").
- **Full graph (Elite/Team):** **graph(action="ingest")** builds richer module/call/dataflow layers when available.
- **Tagging:** Use stable doc IDs (PRD-XXX, ADR-XXX, TP-XXX) and **Related** / **Implements** in docs so ContextStream can relate content. See [ContextStream mapping](contextstream-mapping.md) for parallels (PRD ↔ plans, docs ↔ memory, lessons, to-dos) and labeling guidance. **PRs:** Fill the PR template **Traceability** (Implements: TP-XXX, PRD: PRD-XXX) and optionally capture an implementation event with PR URL and doc paths so the knowledge graph UI shows [PR ↔ Tech Plan ↔ PRD](contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

### Optional: editor rule

A Cursor rule in `.cursor/rules/` tells the AI to use ContextStream when available (session_init/context_smart for project context, ContextStream search before broad Grep/Read, graph for dependencies/impact). No change needed unless you want to adjust that behavior.

### Optional: Router mode and integrations

- **Router mode:** If you use many MCP servers or hit context limits, set `CONTEXTSTREAM_PROGRESSIVE_MODE=true` in the ContextStream MCP env in `.cursor/mcp.json` to use Router mode (~2 meta-tools). See [ContextStream docs](https://contextstream.io/docs/mcp).
- **Pro integrations:** Pro users can connect GitHub and Slack so `context_smart` surfaces relevant issues, PRs, and discussions (see [ContextStream](https://contextstream.io)).

ContextStream is **optional** for contributors and is not required for CI or build.

## Recommended GitHub Actions

The repository does **not** ship workflow files by default. We **recommend** adding workflows under `.github/workflows/` for teams that want automated CI on push/PR:

| Recommended workflow | Purpose |
|----------------------|---------|
| **CI** | TypeScript typecheck, ESLint, plugin build (.NET), lockfile check (`apps/api/package-lock.json`), OpenAPI validation (Spectral). Trigger when `apps/api/`, `apps/plugin/`, or `docs/api/` change. |
| **security** | Secret scanning (e.g. TruffleHog), npm and .NET dependency audits, CodeQL (TypeScript + C#). |
| **doc-check** | Markdown lint, link check (e.g. Lychee), Mermaid diagram validation, OpenAPI (Spectral) for `docs/`. |
| **diagrams** | Mermaid `.mmd` validation for `docs/architecture/diagrams/` and `docs/design/diagrams/`. |

Use path filters so only relevant jobs run. Local pre-push checks (see below) remain the primary gate; GitHub Actions are optional automation.

## Run tests before push

**Policy:** Before pushing to a remote branch, run local tests; **at least 80% of tests must pass** before pushing. Agents and contributors should run (or advise running) these checks and block or warn on push if the threshold is not met.

Run the same checks CI runs (from repo root unless noted):

1. **API typecheck** — `cd apps/api && npm ci && node scripts/inline-openapi.js ../../docs/api/openapi.yaml src/openapi-spec.ts && npm run typecheck`
2. **API lint** — `cd apps/api && npm ci && node scripts/inline-openapi.js ../../docs/api/openapi.yaml src/openapi-spec.ts && npm run lint`
3. **Plugin build** — `cd apps/plugin/WinPodiums.Plugin && dotnet restore && dotnet build --configuration Release --no-restore`
4. **Worker smoke** — `docker compose up -d` (wait for `http://localhost:8787/api/health`), then `cd apps/api && npm ci && npm test`
5. **OpenAPI validation** — `npx @stoplight/spectral-cli@latest lint docs/api/openapi.yaml --fail-severity=error`

Optional: lockfile check — after `npm ci` in `apps/api`, run `git diff --exit-code apps/api/package-lock.json` from repo root. Doc check (markdown lint, Mermaid) — see [Recommended GitHub Actions](#recommended-github-actions); you can add a `doc-check` workflow under `.github/workflows/`.

Count passing steps vs total run; require ≥80% (e.g. 4 of 5, or 5 of 6 if including lockfile) before pushing.

### Enforce with a git hook (blocks push until 80% pass)

A **pre-push** git hook runs the same checks and **blocks the push** (including from Cursor) until at least 80% pass. Enable it once per clone:

```bash
git config core.hooksPath .githooks
```

- **Hook:** `.githooks/pre-push` runs `node scripts/pre-push-check.js` from the repo root.
- **Checks:** API typecheck, API lint, plugin build, OpenAPI validation, and (if the API is already up at `http://localhost:8787`) worker smoke. If the API is not up, only the first four run; you need all four to pass.
- **Skip hook once:** `git push --no-verify` (use only when necessary; policy is 80% pass before push).

To disable the hook for this repo: `git config --unset core.hooksPath`.

## Related

- [Deployment](deployment.md) — Deploy Worker with Wrangler
- [Next Steps](../architecture/next-steps.md) — Recommended order of work (test locally, deploy)
- [Phase 1 scope](../product/phase-1-mvp-scope.md) — MVP deliverables and trace to docs
- [API README](../api/README.md) — Endpoint surface and OpenAPI spec
- [ContextStream mapping](contextstream-mapping.md) — AI tooling (ContextStream MCP, graph, tagging)

## TBD

- Optional Docker setup for building the SimHub plugin (e.g. Windows container or CI-only).
