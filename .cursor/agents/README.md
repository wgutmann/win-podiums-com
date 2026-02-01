# Project subagents

Custom subagents are stored in **`.cursor/agents/`** (project-level). Each file has YAML frontmatter (`name`, `description`) and a markdown body that is the system prompt. Check into version control to share with the team.

**Subagents in this directory**:
- `testing-pre-push` — Test strategy, vitest, smoke tests, pre-push (≥80%)
- `api-contract-openapi` — OpenAPI spec, route docs, inline-openapi, Spectral
- `local-bootstrap` — First-time setup, run API + plugin locally
- `deployment-wrangler` — Deploy Worker with Wrangler, D1 remote migrations, production secrets
- `telemetry-proof-domain` — PRD-001–005, TP-001–005 (Phase 2+ Telemetry Proof)
- `ci-github-actions` — Workflows (ci, doc-check, security, diagrams)

**No duplicate skills**: These domains are covered by project subagents only. Do not add matching skills under `.cursor/skills/`; remove any such folders if present.

See [create-subagent](https://cursor.com/docs/context/subagents) for format and best practices.
