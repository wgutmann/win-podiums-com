# Docker Dev Environment Reference

## Official Best Practices (Summary)

- Prefer official base images and pin versions for repeatability.
- Use multi-stage builds to keep runtime images small.
- Keep build cache efficient: copy dependency manifests before app code.
- Avoid baking secrets into images; use envs or secret mounts.
- Use non-root users where possible.
- Document all dev defaults and local overrides.

## Compose Guidance

- Prefer `compose.yaml` over legacy naming.
- Use bind mounts for source code and named volumes for data.
- Keep environment variables in `.env` and commit `.env.example`.
- Place local-only overrides in `compose.override.yaml` and gitignore it.
- Use `profiles` to keep optional services out of default runs.

## Debug and Ops Cheatsheet

- Build: `docker compose build`
- Run: `docker compose up`
- Logs: `docker compose logs -f SERVICE`
- Shell: `docker compose exec SERVICE sh`
- Stats: `docker stats`
- Cleanup: `docker compose down --volumes` (dev-only data)

## CI Test Optimization (GitHub Actions)

- Use BuildKit and layer cache to reduce rebuild time.
- Run a quick smoke test job on most PRs; gate heavier tests.
- Use path filters to avoid running on unrelated changes.
- Limit matrix size to supported targets only.
- Stop services after tests to free resources early.

## .NET and Cloudflare Workers Notes

- .NET: prefer `dotnet test` inside the built image so tests match runtime deps.
- Cloudflare Workers: use a Node-based test runner (`npm test` or `wrangler test`).
- For Workers integration tests, mock external APIs where possible to cut CI time.

## When to Use Dockerfile Only

- Single service
- No orchestration
- No external dependencies for dev

## When to Use Compose

- Multiple services
- Dependent services (db, cache)
- Local developer overrides and profiles
