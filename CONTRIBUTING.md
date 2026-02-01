# Contributing to WinPodiums

Guidelines for contributing to this repository. **Status: stub** — full guidelines will be added as the project moves from planning to implementation.

## Current phase

The project is in **Phase 1 MVP**. A minimal Worker (`apps/api/`) and SimHub plugin scaffold (`apps/plugin/`) exist; current focus is implementing Phase 1 (real Discord OAuth, D1 migrations, plugin auth and verification). See [README](README.md) and [docs/architecture/next-steps.md](docs/architecture/next-steps.md).

## What you can do now

- Propose or refine documentation (PRDs, HLD, tech plans) via pull requests.
- Review and comment on architecture decisions in `docs/architecture/decisions/`.
- Follow [AGENTS.md](AGENTS.md) and the skills in `.cursor/skills/` when working with AI agents.

## Before you push

**Run local tests before pushing to a remote branch.** At least **80% of tests must pass** before pushing. See [Run tests before push](docs/guides/development.md#run-tests-before-push) in the development guide for the exact commands (typecheck, lint, plugin build, worker smoke, OpenAPI validation).

**Enforce with a git hook (blocks push until 80% pass):** Run once per clone: `git config core.hooksPath .githooks`. Then every push (including from Cursor) runs the pre-push check and blocks if &lt;80% pass. To skip once: `git push --no-verify`.

## Review and merge process

- **All PRs**: Require approval and passing CI (see [Run tests before push](docs/guides/development.md#run-tests-before-push)). Fill out the [PR template](.github/PULL_REQUEST_TEMPLATE.md) (summary, **traceability** (Implements: TP-XXX, PRD: PRD-XXX), risk, test plan, rollback).
- **Product review**: PRs that change **scope, requirements, or user-facing copy** should get product review before merge. That means:
  - **Paths**: `docs/product/**`, `docs/brand/**`, or any change that adds/edits user-facing text (UI strings, API contract descriptions, landing copy).
  - **Who**: A human product manager, or an agent using the [product manager personality](docs/brand/product-manager-personality.md) (e.g. @-mention the personality doc when asking for review).
  - **What**: Reviewer checks phase alignment, user value, brand voice, and PRD/HLD traceability using the [PM review checklist](docs/brand/product-manager-personality.md#review-process) in the personality doc.
- **Optional**: When you have a designated PM GitHub user or team, add a [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) file so `docs/product/` and `docs/brand/` automatically request that reviewer.

### ContextStream: PR ↔ Tech Plan ↔ PRD in the knowledge graph

PRs must declare **Traceability** (Tech Plan ID(s) and PRD ID) in the PR template so the [ContextStream](https://contextstream.io) knowledge graph can show **PR ↔ Tech Plan ↔ PRD**. To make that link **visible in the ContextStream UI**, capture an **implementation** event when opening or merging the PR: include the PR URL and the tech plan + PRD doc paths (e.g. `docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md`, `docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md`). See [ContextStream mapping – Linking pull requests](docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible). Optional: use GitHub labels such as `tech-plan: TP-SPOC-001` and `prd: PRD-001` for filters and UI.

## Coming soon

- Branching and PR workflow (branch naming, base branch)
- Code style and testing expectations (lint, coverage)

Check back or open an issue to request contributing guidelines for a specific area.
