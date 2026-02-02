---
name: docker-dev-environment
description: Standardizes Docker-based development environments using official Docker best practices. Use when the user mentions Docker, Dockerfile, Docker Compose, containerized dev environment, local/repo parity, or requests Docker test automation, and when asked to set up, manage, debug, monitor, or validate dev containers locally and in CI.
---

# Docker Dev Environment

## Quick Start

Use this skill when the user asks to create or standardize a **Docker** or **Docker Compose** setup, achieve **local/repo parity** for a **containerized dev environment**, or to **debug**, **monitor**, or validate dev containers locally and in CI.

**Flow**: (1) Detect existing Docker artifacts. (2) Choose minimal setup (Dockerfile-only vs Compose). (3) Ensure local and repo config stay in parity. (4) Provide run/debug/monitor workflows and verify them. (5) Define local and CI tests for Docker stability.

**ContextStream (when available):** Before changing Docker/Compose, use ContextStream `search` for "Docker", "compose", "wrangler", "Worker" to find existing setup and parity decisions. After Docker/parity decisions, capture in ContextStream (event_type=decision) with path to Dockerfile, compose.yaml, or docs/guides/development.md.

## Scope

- **In scope**: Dockerfile and Docker Compose creation, local/repo config parity, execution (build/run), debugging (shell, logs, env, networks), monitoring (stats, state, disk, cleanup), and validation in CI.
- **Out of scope**: Production orchestration (e.g. Kubernetes) unless the user explicitly asks; image registry publishing; non-Docker dev environments. For change control and secrets in repo config, see github-change-control skill.

## Best-Practices Sources

When creating or updating Dockerfile and Compose files, consult **official Docker documentation** as the standard:

- **Docker**: Dockerfile reference, best practices for writing Dockerfiles, and engine documentation at [docs.docker.com](https://docs.docker.com/).
- **Compose**: Compose file specification and best practices at [docs.docker.com/compose](https://docs.docker.com/compose/).

See [reference.md](reference.md) for curated links to specific Docker and Compose docs. Do not invent patterns; align to official Docker best practices.

## Decision Flow

1. **Existing Compose?** Prefer Compose for multi-service or dev orchestration.
2. **Single service?** Dockerfile-only is acceptable if no orchestration is needed.
3. **Need dev tooling, volumes, ports, envs?** Compose is usually better.
4. **Ambiguous?** Default to Compose with a minimal Dockerfile.

## Local vs remote (Cloudflare)

- **Rebuild and restart** (`docker compose build`, `docker compose up`, `docker compose down` then `up`) are entirely **local**. Nothing is deployed to Cloudflare.
- **Commands in the container CMD** (e.g. `wrangler d1 migrations apply DB_NAME --local`) run **inside** the dev environment. The **`--local`** flag applies migrations to the **local** D1 database that `wrangler dev` uses (SQLite in the container). That does **not** create or update D1 on Cloudflare.
- **Deploying to Cloudflare** is a separate step: e.g. `wrangler deploy`, and when you want the remote DB schema, `wrangler d1 migrations apply DB_NAME --remote` (run from host or CI, not necessarily from the dev container). Do not conflate container rebuild/restart or `--local` migrations with deployment.

---

## Step-by-Step Workflows

### 1. Dockerfile / Compose Creation

1. **Identify** entrypoint, ports, and runtime (Node, .NET, Python, etc.) and any system/dependency requirements.
2. **Choose** base image: use an official image and pin major/minor version when possible.
3. **Dockerfile**: Use multi-stage builds when build-only deps differ from runtime; minimize layers; copy dependency manifests before app code for cache; do not bake secrets into the image.
4. **Optional Compose**: If using Compose, create `compose.yaml` (or `docker-compose.yml`) with explicit `services`, `ports`, `volumes`, and `environment`; use bind mounts for source in dev and named volumes for data.
5. **Secrets and env**: Keep secrets out of images; use `.env` and provide `.env.example` in repo; document required variables.
6. **Checklist** before finishing:
   - [ ] Official base image and pinned version.
   - [ ] Multi-stage used when appropriate; final image has no build-only deps.
   - [ ] WORKDIR set; only needed files copied; build cache leveraged.
   - [ ] Non-root user when feasible; healthcheck if the app has a stable local endpoint.

### 2. Local / Repo Config Parity

1. **Canonical config in repo**: Keep `Dockerfile` and `compose.yaml` (or `docker-compose.yml`) as the source of truth in the repo.
2. **Local overrides**: Use `.env` for local values; track `.env.example` in repo with documented defaults and required vars.
3. **Compose overrides**: Use `compose.override.yaml` for local-only changes (extra ports, debug env, etc.); add it to `.gitignore`.
4. **Document**: Record all defaults and override behavior in README or a dedicated dev doc.
5. **Checklist**:
   - [ ] Repo has `compose.yaml` and/or `Dockerfile`; no secrets in committed files.
   - [ ] `.env.example` committed; `.env` and `compose.override.yaml` gitignored.
   - [ ] Defaults and override strategy documented.

### 3. Execution (Build and Run)

1. **Build**: From project root, run `docker build -t app-dev .` or `docker compose build`.
2. **Run**: `docker run --rm -p HOST:CONTAINER app-dev` for a single image, or `docker compose up` for Compose.
3. **Verify**: Hit a health endpoint or run a minimal CLI command to confirm the app starts.
4. **Optional**: Use `docker compose up -d` for detached mode; document how to stop (`docker compose down`).

### 4. Debugging

1. **Shell**: Attach a shell with `docker compose exec SERVICE sh` (or `bash` if available).
2. **Logs**: Stream logs with `docker compose logs -f SERVICE` (or `docker logs -f CONTAINER`).
3. **Environment**: Inspect env with `docker compose exec SERVICE env` (or `docker exec CONTAINER env`).
4. **Networks**: List networks with `docker network ls`; inspect with `docker network inspect NETWORK`.
5. **State**: Use `docker ps -a` to see all containers and their status.

### 5. Monitoring

1. **Resource usage**: Run `docker stats` for live CPU/memory.
2. **Container state**: Use `docker ps -a` for status and exit codes.
3. **Disk usage**: Run `docker system df` to see space used by images, containers, volumes.
4. **Cleanup**: For dev, `docker compose down --volumes` only when data is disposable; document which volumes are safe to remove.

---

## Implementation Checklist (Summary)

### Repo Baseline
- [ ] Entrypoint, ports, and runtime confirmed; dependencies and base image chosen.
- [ ] Multi-stage used when appropriate; secrets not in images; `.env.example` provided.

### Dockerfile
- [ ] Official base, pinned version; minimal layers; non-root when feasible; healthcheck if applicable.

### Compose
- [ ] `compose.yaml` or `docker-compose.yml`; explicit services, ports, volumes, environment; bind mounts for source in dev; `profiles` for optional services; local overrides in gitignored file.

## Testing Workflow

- **Before pushing to a remote branch:** Run local tests; at least 80% of tests must pass. See [Run tests before push](../../../docs/guides/development.md#run-tests-before-push) and [AGENTS.md](../../../AGENTS.md). Block or warn on push if the threshold is not met.

### Local (Docker environment validation)
- [ ] Build image(s) and start container(s) cleanly.
- [ ] Run a minimal smoke test (health endpoint or one CLI command).
- [ ] Verify volumes and permissions on mounted paths.
- [ ] Validate env defaults and required overrides.
- [ ] Confirm graceful shutdown and clean teardown.

### CI (e.g. GitHub Actions)
- [ ] Use BuildKit and layer cache (cache-from/cache-to) to speed builds.
- [ ] Reuse service containers where possible; avoid redundant builds.
- [ ] Split fast smoke tests from slower integration tests; use path filters for workflows.
- [ ] Use `--no-pull` when images are cached and pinned.

### Stack-specific
- **.NET**: Run `dotnet test` inside the built container to match runtime.
- **Cloudflare Workers**: Run `npm test` or `wrangler test` in a Node-based image.
- Use Compose-based integration tests only when dependencies are required.

## Output Expectations

When making changes, provide:
- A minimal Dockerfile and/or Compose file.
- A short run/debug/monitor checklist (or pointer to the workflows above).
- Local and CI test checklist for Docker stability.
- Notes on local overrides and secrets handling.

If the user requests only guidance, provide docs and checklists without editing files.

## Anti-Patterns

- Do not bake secrets or long-lived credentials into images.
- Do not skip official Docker best practices when writing Dockerfile or Compose.
- Do not commit `.env` or `compose.override.yaml` with secrets or machine-specific values.
- Do not run production-only workflows (e.g. full K8s) unless the user asks.

## Additional Resources

- Official Docker best practices and curated links: [reference.md](reference.md)
- Common templates and examples: [examples.md](examples.md)
