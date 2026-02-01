# Project subagents

Custom subagents are stored in **`.cursor/agents/`** (project-level). Each file has YAML frontmatter (`name`, `description`) and a markdown body that is the system prompt. Check into version control to share with the team.

**Subagents in this directory** (one per domain; no duplicates):
- `testing-pre-push` — Test strategy, vitest, smoke tests, pre-push (≥80%); use for running local checks or adding tests
- `api-contract-openapi` — OpenAPI spec, route docs, inline-openapi, Spectral
- `local-bootstrap` — First-time setup, run API + plugin locally
- `deployment-wrangler` — Deploy Worker with Wrangler, D1 remote migrations, production secrets
- `telemetry-proof-domain` — PRD-001–005, TP-001–005 (Phase 2+ Telemetry Proof)
- `ci-github-actions` — Workflows (ci, doc-check, security, diagrams)

**No duplicate skills or subagents**:
- **Reserved names (subagents only)** — Do not add skills under `.cursor/skills/` with these names: `testing-pre-push`, `api-contract-openapi`, `local-bootstrap`, `deployment-wrangler`, `telemetry-proof-domain`, `ci-github-actions`. Remove any such skill folders if present.
- **One subagent per domain** — Do not add another subagent that overlaps (e.g. a second "local test" or "pre-push" agent); use the existing one above.

See [create-subagent](https://cursor.com/docs/context/subagents) for format and best practices.
