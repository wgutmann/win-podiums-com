# Testing harness: comment triggers and manual security gate

**Last updated**: 2026-02-01

This doc describes how tests are triggered and how the security gate works so you get fast feedback on push and controlled, “run when I say” security checks before merge.

---

## Design

1. **On every push / PR**: Run **only unit tests (and related checks) for the modified portion** of the app. Path-filtered: API changes → API typecheck, lint, unit tests; plugin changes → plugin build. No security runs automatically.

2. **Merge protection**: You **cannot merge** without security checks passing. Those checks **do not run automatically**; they run only when explicitly requested.

3. **How to “run these tests”**:
   - **Button**: In the Actions tab, run the **Security** workflow via “Run workflow” (choose branch and run). The run is attached to that ref, so the PR sees the status.
   - **Comment**: On a PR, comment **`/run-security`** to trigger the Security workflow on that PR’s head. The run reports status back to the PR.

So: lightweight, path-filtered CI on every push; security only on demand (button or comment); branch protection requires the security gate to pass before merge.

**Diagram:** [PR and testing flow](../architecture/diagrams/pr-testing-flow.md) — Mermaid flowchart of PR events, automatic CI, manual Security trigger, and merge gate.

---

## What runs when

| Trigger | What runs |
|--------|-----------|
| **Push / PR** (path-filtered) | **CI**: Unit tests (and typecheck/lint) for the changed app only. API path → API job; plugin path → plugin build. No security. |
| **Manual “Run workflow”** (Security) | **Security**: Secret scan, dependency audits, CodeQL. Run on the branch you select. Use for “run these tests” before merge. |
| **Comment `/run-security`** on a PR | **Security**: Same as above, but runs on the PR’s head commit so the PR gets the status. |

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

To enforce “cannot merge without security checks”:

1. **Settings → Branches → Branch protection** for `main`.
2. **Require status checks before merging**: enable and add **`security-gate`** (the job name; the full status check may appear as **Security / security-gate** in the UI).
3. Save.

After that, a PR will only be mergeable when at least one Security run for that branch has completed and **Security / security-gate** passed. Because Security runs only on workflow_dispatch or `/run-security`, someone must explicitly run it (button or comment) before merge.

---

## Workflow summary

- **CI** (`.github/workflows/ci.yml`): Runs on push/PR when `apps/**`, `docs/api/**`, or the workflow file change. Path filter runs only the jobs for changed areas (API vs plugin). No security.
- **Security** (`.github/workflows/security.yml`): Runs **only** on:
  - **workflow_dispatch**: “Run workflow” in the Actions tab (choose branch).
  - **issue_comment**: Comment on a PR containing `/run-security`; runs on that PR’s head.
  - When triggered by comment, a **get-ref** job resolves the PR head ref; all other jobs checkout that ref so the run is tied to the PR.
- **PR test instructions** (`.github/workflows/pr-test-instructions.yml`): Runs on every PR (opened, sync, reopened). Posts or updates a single comment on the PR explaining how to run the tests required for merge (Security) that are not triggered automatically.

---

## References

- Workflows: `.github/workflows/ci.yml`, `.github/workflows/security.yml`, `.github/workflows/pr-test-instructions.yml`
- CI performance: `docs/guides/ci-performance-evaluation.md`
- Development and pre-push: `docs/guides/development.md`
