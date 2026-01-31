# Docker Dev Environment — Official References

Use these when creating or updating Dockerfile and Compose files. Prefer **official Docker documentation** as the standard for structure, syntax, and best practices.

## Docker (docs.docker.com)

- **Dockerfile reference**  
  https://docs.docker.com/reference/dockerfile/  
  All instructions (FROM, RUN, COPY, WORKDIR, CMD, etc.) and syntax.

- **Best practices for writing Dockerfiles**  
  https://docs.docker.com/build/best-practices/  
  Image size, layer order, cache, security (non-root, no secrets in layers), multi-stage builds.

- **Docker run reference**  
  https://docs.docker.com/reference/cli/docker/run/  
  Options for `docker run` (ports, volumes, env, network).

## Docker Compose (docs.docker.com/compose)

- **Compose file specification**  
  https://docs.docker.com/compose/compose-file/  
  Services, build, ports, volumes, environment, profiles, depends_on.

- **Compose best practices**  
  https://docs.docker.com/compose/production/  
  Production-oriented guidance; for dev, adapt (e.g. bind mounts for source, override files).

- **Compose CLI reference**  
  https://docs.docker.com/compose/reference/  
  `docker compose build`, `up`, `down`, `exec`, `logs`, etc.

## Summary (Quick Guidance)

- Prefer official base images and pin versions for repeatability.
- Use multi-stage builds to keep runtime images small; copy dependency manifests before app code.
- Keep secrets out of images; use env vars or secret mounts.
- Use non-root users where possible; document dev defaults and local overrides.
- Prefer `compose.yaml`; use bind mounts for source in dev, named volumes for data; put local-only overrides in `compose.override.yaml` and gitignore it.

## Debug and Ops Cheatsheet

- Build: `docker compose build`
- Run: `docker compose up` (or `up -d`)
- Logs: `docker compose logs -f SERVICE`
- Shell: `docker compose exec SERVICE sh`
- Stats: `docker stats`
- Cleanup: `docker compose down --volumes` (only when dev data is disposable)

## CI (e.g. GitHub Actions)

- Use BuildKit and layer cache to reduce rebuild time.
- Run a quick smoke test on most PRs; gate heavier tests.
- Use path filters so Docker workflows run only when Docker/Compose or app code changes.
- Limit matrix to supported targets; stop services after tests.

When in doubt, follow the official Docker and Compose docs for syntax and recommended patterns.
