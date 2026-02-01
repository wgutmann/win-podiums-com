# Development Guide

**Last Updated**: 2026-01-31

## Overview

WinPodiums uses a **Docker-based development environment** for local/repo parity (see [AGENTS.md](../../AGENTS.md) and the docker-dev-environment skill). You can run the API (Worker) in a container; the SimHub plugin is built and run on the host (Windows/.NET).

## Prerequisites

- **Docker** and **Docker Compose** — for API dev (recommended)
- **Node.js** (LTS) — optional; for running the API without Docker
- **.NET Framework 4.8** and **Visual Studio** — for SimHub plugin (host only)
- **Wrangler** — included in container; optional on host for `wrangler dev` without Docker
- **Git** — version control

## Repository Layout

- **`apps/api/`** — Cloudflare Worker (API + static Gate). Run via Docker (recommended) or `wrangler dev` on host.
- **`apps/plugin/`** — SimHub plugin (C# / .NET Framework 4.8). Build and run on host; no container yet.
- **`infra/terraform/`** — Terraform for D1, R2, KV, routes.

## Docker Development (Recommended)

### API (Worker)

1. From repo root:
   ```bash
   docker compose build
   docker compose up
   ```
2. API: **http://localhost:8787**  
   - Health: **http://localhost:8787/health**  
   - Gate: **http://localhost:8787/** or **http://localhost:8787/gate**
3. Live reload: edits under `apps/api/src/` are reflected (volume mount).
4. Optional secrets: create `.dev.vars` in repo root (or `apps/api/`) with Discord client ID/secret etc.; add `env_file: [".dev.vars"]` under the `api` service in `compose.yaml`. **Do not commit `.dev.vars`.**

### Useful commands

- **Logs**: `docker compose logs -f api`
- **Shell**: `docker compose exec api sh`
- **Stop**: `docker compose down`

### SimHub plugin (no Docker)

The plugin targets .NET Framework 4.8 and SimHub on Windows. Build and run on the host (Visual Studio or MSBuild); see `apps/plugin/README.md` when that project exists.

## Non-Docker (Host) Development

If you prefer to run the API on the host:

1. `cd apps/api`
2. `npm install`
3. Create `.dev.vars` if needed (Discord etc.); do not commit.
4. `npx wrangler dev` — API at http://localhost:8787

## Environment Variables / Secrets

- **Worker**: Use `.dev.vars` for local dev (Wrangler loads it). Keep secrets out of images and compose files; use `env_file` pointing to a gitignored file.
- **Plugin**: No secrets in code; Discord OAuth2 (PKCE). API base URL configurable (e.g. `http://localhost:8787` when using Docker).

## Testing

- **API**: After adding tests in `apps/api`, run `npm test` inside the container: `docker compose exec api npm test`, or on host: `cd apps/api && npm test`.
- **Plugin**: Manual testing with SimHub on host.

## Terraform → Wrangler bindings

- **D1 and R2**: `apps/api/wrangler.toml` uses the same names as Terraform default (`winpodiums-dev-db`, `winpodiums-dev-storage`). No change needed after `terraform apply` if you use default `project_name` and `environment`.
- **KV**: The KV namespace **id** is assigned by Cloudflare. After first `terraform apply`, run `terraform -chdir=infra/terraform output -raw kv_namespace_id` and set `id` under `[[kv_namespaces]]` in `wrangler.toml` (or leave placeholder until you use KV).

## TBD

- D1 migration workflow (`wrangler d1 execute` against dev database).
- Optional Docker setup for building the SimHub plugin (e.g. Windows container or CI-only).
