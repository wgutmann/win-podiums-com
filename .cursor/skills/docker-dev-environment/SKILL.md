---
name: docker-dev-environment
description: Standardizes Docker-based development environments using official Docker best practices. Use when the user mentions Docker, Dockerfile, Docker Compose, containerized dev environments, local/repo parity, or requests Docker test automation, and when asked to set up, manage, debug, monitor, or validate dev containers locally and in CI.
---

# Docker Dev Environment

## Quick Start

When asked to create or standardize a Docker dev environment:
1. Detect existing Docker artifacts (`Dockerfile`, `compose.yaml`/`docker-compose.yml`, `.env`, scripts).
2. Choose the minimal setup that matches the repo's needs (Dockerfile-only vs Compose).
3. Ensure local and repo settings stay in parity (documented defaults, safe overrides).
4. Provide a run/build/debug/monitor workflow and verify it works.
5. Define local and CI tests that validate the Docker environment.

## Decision Flow

1. **Existing Compose?** Prefer Compose for multi-service or dev orchestration.
2. **Single service?** Dockerfile-only is acceptable if no orchestration is needed.
3. **Need dev tooling, volumes, ports, envs?** Compose is usually better.
4. **Ambiguous?** Default to Compose with a minimal `Dockerfile`.

## Implementation Checklist

### Repo Baseline
- [ ] Confirm entrypoint, ports, and runtime (node, dotnet, python, etc.).
- [ ] Identify required dependencies and system packages.
- [ ] Decide on base image (official image, pinned major/minor when possible).
- [ ] Separate build and runtime (multi-stage) when appropriate.
- [ ] Keep secrets out of images; use `.env` and provide `.env.example`.

### Dockerfile Best Practices
- [ ] Use official base images and pinned versions.
- [ ] Minimize layers and remove build-only deps in final image.
- [ ] Use `WORKDIR`, copy only needed files, and leverage build cache.
- [ ] Run as a non-root user when feasible.
- [ ] Add a healthcheck if the app has a stable local endpoint.

### Compose Best Practices
- [ ] Use `compose.yaml` (preferred) or `docker-compose.yml`.
- [ ] Define `services`, `ports`, `volumes`, and `environment` explicitly.
- [ ] Use bind mounts for source code in dev, named volumes for data.
- [ ] Use `profiles` when optional services exist.
- [ ] Ensure local overrides are in ignored files (e.g., `compose.override.yaml`).

## Local vs Repo Parity

Default to repo-owned configuration and allow local overrides:
- Keep canonical config in repo (`compose.yaml`, `Dockerfile`).
- Use `.env` for local values and track `.env.example` in repo.
- Use `compose.override.yaml` for local-only changes; keep it gitignored.
- Document all defaults in README or a dedicated dev doc.

## Execution Workflow

### Build and Run
- Build: `docker build -t app-dev .` or `docker compose build`
- Run: `docker run --rm -p HOST:CONTAINER app-dev` or `docker compose up`
- Verify: check health endpoint or logs

### Debugging
- Attach shell: `docker compose exec SERVICE sh` (or `bash`)
- Inspect logs: `docker compose logs -f SERVICE`
- Check env: `docker compose exec SERVICE env`
- Validate network: `docker network ls` and `docker network inspect`

### Monitoring
- Resource usage: `docker stats`
- Container state: `docker ps -a`
- Disk usage: `docker system df`
- Clean safely: `docker compose down --volumes` (only if data is disposable)

## Testing Workflow

### Local Tests (Docker Environment Validation)
- [ ] Build image(s) and ensure the container starts cleanly.
- [ ] Run a minimal smoke test (health endpoint or a single CLI command).
- [ ] Verify volumes and permissions (read/write in mounted paths).
- [ ] Validate env var defaults and required overrides.
- [ ] Confirm graceful shutdown and clean teardown.

### CI Tests (GitHub Actions)
- [ ] Use cache for build layers (BuildKit + cache-from/cache-to).
- [ ] Reuse service containers where possible; avoid redundant builds.
- [ ] Split fast smoke tests from slower integration tests.
- [ ] Run only relevant workflows on path filters.
- [ ] Use `--no-pull` when images are already cached and pinned.

### Stack-Specific CI Guidance
- .NET: run `dotnet test` inside the built container to match runtime.
- Cloudflare Workers: run `npm test` or `wrangler test` in a Node-based image.
- Use Compose-based integration tests only when dependencies are required.

### Cost Optimization Guidance
- Prefer a single CI job for smoke tests that validates the Docker env quickly.
- Use matrix builds only when necessary; limit OS/versions to required targets.
- Cache dependencies and Docker layers aggressively.
- Avoid long-running background services in CI unless required by tests.

## Output Expectations

When making changes, provide:
- A minimal Dockerfile and/or Compose file
- A run/debug/monitor checklist
- A local and CI test checklist for Docker stability
- Notes on local overrides and secrets handling

If the user requests only guidance, provide docs/checklists without edits.

## Additional Resources

- Official Docker best practices: see `reference.md`
- Common templates and examples: see `examples.md`
