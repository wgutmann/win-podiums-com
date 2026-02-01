# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project does not yet use semantic versioning for releases.

## [Unreleased]

### Added

- Stub CONTRIBUTING.md, SECURITY.md, CHANGELOG.md.
- Cursor rules: `.cursor/rules/infra.mdc`, `.cursor/rules/docs.mdc`.
- Cloudflare Workers skill: `.cursor/skills/cloudflare-workers/`.
- Agent instructions: current phase, Worker/Docker 1:1, Terraform out of scope until explicit feature (AGENTS.md).

### Changed

- **GitHub Actions removed; documentation recommends workflows (2026-02-01)**: All workflow files removed from `.github/workflows/` (ci.yml, diagrams.yml, doc-check.yml, security.yml). The repository no longer ships GitHub Actions by default. Documentation now **recommends** adding workflows under `.github/workflows/` for teams that want automated CI (typecheck, lint, plugin build, lockfile, OpenAPI, security, doc-check, diagrams). Updated: docs/guides/development.md (new "Recommended GitHub Actions" section), SECURITY.md, docs/standards/documentation-standards.md, docs/architecture/high-level-design.md, docs/architecture/infrastructure.md, docs/architecture/decisions/006-security-choices.md, .cursor/agents/ci-github-actions.md, .cursor/agents/README.md, .cursor/skills/security/SKILL.md and examples.md, infra/terraform/README.md, docs/tech-plans/dependencies-and-tests.md. Local pre-push checks remain the primary gate; GitHub Actions are optional.
- `.cursor/docs/index.md`: clarified repo docs links and status; added cloudflare-workers skill.
- **Documentation refresh (2026-01-31)**: [docs/architecture/next-steps.md](docs/architecture/next-steps.md) updated for current state — Steps 1–3 (doc gaps, Phase 1 scope, repo structure) marked done; Step 4 (Implement Phase 1) is current focus. README, AGENTS.md, CONTRIBUTING.md, and .cursor/docs/index.md aligned with same; CONTRIBUTING/SECURITY linked from README.
- **Worker/Docker 1:1, Terraform out of scope (2026-01-31)**: README, AGENTS.md, next-steps.md, development.md, deployment.md, wrangler.toml, phase-1-mvp-scope.md, infrastructure.md, .cursor/docs/index.md, and cloudflare-workers skill updated so that (1) Worker and Docker are documented as 1:1 (same app, same config), and (2) Terraform is ignored until explicitly introduced as a feature; all Terraform-based deploy steps removed from the default workflow.
- **Run and test with Docker (2026-01-31)**: Dockerfile added (Node 20 Bookworm, Wrangler with `--ip 0.0.0.0`); compose uses `env_file: ./apps/api/.dev.vars` and Docker/Worker config aligned via `CLOUDFLARE_INCLUDE_PROCESS_ENV`. Smoke test `apps/api/test/smoke.js` runs against Docker API and asserts `{ ok: true, env: "dev" }`. All docs updated: local run and testing use Docker; start API with `docker compose up`, run tests with `docker compose up -d && cd apps/api && npm test`.
- **GitHub Action Worker test (2026-01-31)**: `.github/workflows/worker-test.yml` — on push/PR to main (when `apps/api/`, Dockerfile, or compose change): build Docker, start API, run smoke test against it.
- **npm audit (2026-01-31)**: Upgraded wrangler from ^3.91.0 to ^4.61.1 in `apps/api` to resolve 4 moderate vulnerabilities (esbuild GHSA-67mh-4wv8-2f99, undici GHSA-g9mf-h72j-4rw9). Docker build and smoke test verified.

### Removed

- **GitHub Actions workflows (2026-02-01)**: `.github/workflows/ci.yml`, `.github/workflows/diagrams.yml`, `.github/workflows/doc-check.yml`, `.github/workflows/security.yml` removed. Add your own under `.github/workflows/` if desired; see [Development Guide — Recommended GitHub Actions](docs/guides/development.md#recommended-github-actions).
- **Worker test workflow (2026-01-31)**: `.github/workflows/worker-test.yml` removed. API smoke and unit tests are run locally (Docker + `npm test` / `npm run test:unit`); CI runs typecheck, lint, plugin build, lockfile check, OpenAPI validation, and security checks only.

---

## [0.1.0-alpha] — Planning

- Planning & design phase: HLD, ADRs, product/tech plans, Terraform for Cloudflare (D1, R2, KV). No application code yet.
