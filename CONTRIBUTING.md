# Contributing to WinPodiums

Guidelines for contributing to this repository. **Status: stub** — full guidelines will be added as the project moves from planning to implementation.

## Current phase

The project is in **Phase 1 MVP**. A minimal Worker (`apps/api/`) and SimHub plugin scaffold (`apps/plugin/`) exist; current focus is implementing Phase 1 (real Discord OAuth, D1 migrations, plugin auth and verification). See [README](README.md) and [docs/architecture/next-steps.md](docs/architecture/next-steps.md).

## What you can do now

- Propose or refine documentation (PRDs, HLD, tech plans) via pull requests.
- Review and comment on architecture decisions in `docs/architecture/decisions/`.
- Follow [AGENTS.md](AGENTS.md) and the skills in `.cursor/skills/` when working with AI agents.

## Before you push

**Run local tests before pushing to a remote branch.** At least **80% of tests must pass** before pushing. See [Run tests before push](docs/guides/development.md#run-tests-before-push) in the development guide for the exact commands (API unit tests and optional smoke if the API is already running).

**Enforce with a git hook (blocks push until 80% pass):** Run once per clone: `git config core.hooksPath .githooks`. Then every push (including from Cursor) runs the pre-push check and blocks if &lt;80% pass. To skip once: `git push --no-verify`.

## Coming soon

- Branching and PR workflow
- Code style and testing expectations
- Review and merge process

Check back or open an issue to request contributing guidelines for a specific area.
