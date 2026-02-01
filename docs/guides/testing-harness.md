# Testing harness: comment triggers and manual security gate

**Last updated**: 2026-02-01

This doc describes how tests are triggered and how the security gate works so branch protection required checks run on every PR and merge is unblocked when they pass.

---

## Design

1. **On every push / PR** (path-filtered): **CI** runs unit tests and related checks for the changed app (API or plugin). **Security** runs on the same path filter (apps/api, apps/plugin, docs/api) so Secret scan, dependency audits, and CodeQL report status on the PR. **Lockfile check** and **OpenAPI validation** run as separate CI jobs so branch protection sees those names.

2. **Merge protection**: Branch protection can require the individual check names (e.g. Secret scan, npm audit, CodeQL, Lockfile check, OpenAPI validation). All of these run automatically on PR when the path filter matches, so PRs are mergeable once the workflows complete and pass.

3. **Optional manual trigger**: You can still run **Security** on demand via “Run workflow” in the Actions tab or by commenting **`/run-security`** on a PR (e.g. to re-run security without pushing a new commit).

**Diagram:** [PR and testing flow](../architecture/diagrams/pr-testing-flow.md) — Mermaid flowchart of PR events, automatic CI, manual Security trigger, and merge gate.

---

## What runs when

| Trigger | What runs |
|--------|-----------|
| **Push / PR** (path-filtered) | **CI**: Lockfile check, OpenAPI validation, API job (typecheck, lint, unit tests), plugin build when paths match. **Security**: Secret scan, npm audit, .NET vulnerable packages, CodeQL (when paths match). All report status so branch protection required checks are satisfied. |
| **Manual “Run workflow”** (Security) | **Security**: Same checks; run on the branch you select (e.g. to re-run without pushing). |
| **Comment `/run-security`** on a PR | **Security**: Same as above, on the PR’s head commit so the PR gets the status. |

---

## Comment commands (controls)

These are the supported **comment triggers** for a more verbose, custom harness. Comment on a **pull request** (not on a plain issue).

| Comment | Effect |
|---------|--------|
| **`/run-security`** | Triggers the Security workflow on this PR’s head. Use before merge when you want security checks. Required status for merge is “Security / security-gate”; run Security (button or comment) to get it. |

**Possible future commands** (not implemented yet):

- `/run-full-api` — run full API suite (typecheck, lint, lockfile, OpenAPI, required + optional unit tests) on demand.
- `/run-full-tests` — run CI + Security on demand.

Comment parsing is case-insensitive for the command (e.g. `/Run-Security` works). The comment must be on a **pull request** for `/run-security` so the workflow can run on the PR head.

---

## Branch protection setup

To enforce “cannot merge without required checks”:

1. **Settings → Branches → Branch protection** for `main`.
2. **Require status checks before merging**: enable and add the checks you want (e.g. **Lockfile check**, **OpenAPI validation**, **Secret scan**, **npm audit**, **.NET vulnerable packages**, **CodeQL**, **CodeQL (csharp)**, **CodeQL (javascript-typescript)**, or the single gate **Security / security-gate**).
3. Save.

CI and Security run automatically on pull requests when `apps/api`, `apps/plugin`, or `docs/api` (or the workflow files) change, so those required checks are reported and PRs become mergeable when they pass.

---

## Workflow summary

- **CI** (`.github/workflows/ci.yml`): Runs on push/PR when `apps/**`, `docs/api/**`, or the workflow file change. Includes jobs **Lockfile check** and **OpenAPI validation** (so branch protection can require them by name), plus API (typecheck, lint, tests) and plugin build.
- **Security** (`.github/workflows/security.yml`): Runs on **pull_request** and **push** to main (path-filtered like CI), plus **workflow_dispatch** and **issue_comment** (`/run-security`). Reports Secret scan, npm audit, .NET vulnerable packages, CodeQL (csharp / javascript-typescript), and **security-gate**.
- **PR test instructions** (`.github/workflows/pr-test-instructions.yml`): Runs on every PR. Posts or updates a comment with instructions; Security now runs automatically on PR, so the comment is mainly for manual re-runs.

---

## References

- Workflows: `.github/workflows/ci.yml`, `.github/workflows/security.yml`, `.github/workflows/pr-test-instructions.yml`
- CI performance: `docs/guides/ci-performance-evaluation.md`
- Development and pre-push: `docs/guides/development.md`
