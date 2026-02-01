# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project does not yet use semantic versioning for releases.

## [Unreleased]

### Added

- Stub CONTRIBUTING.md, SECURITY.md, CHANGELOG.md.
- Cursor rules: `.cursor/rules/infra.mdc`, `.cursor/rules/docs.mdc`.
- Cloudflare Workers skill: `.cursor/skills/cloudflare-workers/`.
- Agent instructions: current phase, Terraform guardrails, doc conventions (AGENTS.md).

### Changed

- `.cursor/docs/index.md`: clarified repo docs links and status; added cloudflare-workers skill.
- **Documentation refresh (2026-01-31)**: [docs/architecture/next-steps.md](docs/architecture/next-steps.md) updated for current state — Steps 1–3 (doc gaps, Phase 1 scope, repo structure) marked done; Step 4 (Implement Phase 1) is current focus. README, AGENTS.md, CONTRIBUTING.md, and .cursor/docs/index.md aligned with same; CONTRIBUTING/SECURITY linked from README.

---

## [0.1.0-alpha] — Planning

- Planning & design phase: HLD, ADRs, product/tech plans, Terraform for Cloudflare (D1, R2, KV). No application code yet.
