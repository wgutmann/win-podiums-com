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

`apps/api/test/smoke.js` fetches `GET /api/health` and asserts `{ ok: true, env: "dev" }`. It ensures the Worker in Docker is up and that `ENVIRONMENT` matches `wrangler.toml` (Docker and Worker config 1:1).

**CI**: GitHub Actions runs the same test on push/PR to `main` when `apps/api/`, Dockerfile, or compose change (`.github/workflows/worker-test.yml`): build Docker, start API, run smoke test.

## Config alignment (Docker and Worker)

| Source | Purpose |
|--------|---------|
| **`apps/api/wrangler.toml`** | Worker name, bindings (D1, R2, KV), `[vars]` (e.g. `ENVIRONMENT=dev`). Same file is used inside the container. |
| **`apps/api/.dev.vars`** | Secrets (DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, SESSION_SECRET). Loaded via `env_file` in compose and passed into the Worker via `CLOUDFLARE_INCLUDE_PROCESS_ENV`. |

Do not commit `.dev.vars`. Create it from `.dev.vars.example`.

## SimHub plugin (no Docker)

The plugin targets .NET Framework 4.8 and SimHub on Windows. Build and run on the host (Visual Studio or MSBuild). Deploy the built DLL to `C:\Program Files (x86)\SimHub\Plugins`. Point the plugin at `http://localhost:8787` when the API is running in Docker. See `apps/plugin/README.md`.

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
- **Plugin manual token**: Log in on web, then open `/auth/token`, generate token, paste in plugin. Plugin calls `POST /api/auth/token-exchange` then `POST /api/plugin/heartbeat`.

## Alternative: run API on host (no Docker)

If you need to run the API directly on the host (e.g. debugging Wrangler):

1. `cd apps/api`
2. `npm install`
3. Create `.dev.vars` from `.dev.vars.example`; do not commit.
4. `npx wrangler dev` — API at http://localhost:8787

Tests (`npm test`) still expect the API at `http://localhost:8787`; start either Docker or `wrangler dev` first.

## TBD

- Optional Docker setup for building the SimHub plugin (e.g. Windows container or CI-only).
