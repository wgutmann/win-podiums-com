---
name: github-change-control
description: Provides GitHub change control, repo management, documentation, gitignore, and secret hygiene best practices. Use when the user asks about change control, branch protections, PR review standards, repository governance, documentation updates, .gitignore changes, or preventing/handling secrets in git.
---

# GitHub Change Control

## Quick Start

When handling change control or repo governance:
1. Identify the change type: code, config, docs, repo settings, or secrets.
2. Apply the relevant checklist below.
3. Provide output as a checklist plus a concise template when needed.

**ContextStream (when available):** Before editing CONTRIBUTING, SECURITY, .gitignore, or CHANGELOG, use ContextStream `search` for "branch protection", "secrets", "CONTRIBUTING" to find existing policy. Recall or capture change-control decisions (e.g. branch protection, secret policy) in ContextStream with path to the doc.

## Change Control Checklist

- [ ] Scope: summarize what is changing and why.
- [ ] Risk: note any security, data, or availability impact.
- [ ] Review: confirm required reviewers and review depth.
- [ ] Testing: define minimum verification steps.
- [ ] Rollback: state how to revert if needed.
- [ ] Documentation: update README/CHANGELOG/CONTRIBUTING/SECURITY as appropriate.

## Repo Management Checklist

- [ ] **Before pushing to a remote branch:** Run local tests; **at least 80% of tests must pass** before pushing. See [Run tests before push](../../../docs/guides/development.md#run-tests-before-push). Block or warn on push if the threshold is not met.
- [ ] Branching: ensure main is protected; feature branches for changes.
- [ ] Protections: require reviews, status checks, and linear history when appropriate.
- [ ] Permissions: least-privilege access; remove stale admins.
- [ ] Releases: tag versions, draft notes, and keep CHANGELOG current.
- [ ] Automation: ensure CI checks required for merge.

## Documentation Checklist

- [ ] README: reflects current usage and setup.
- [ ] CONTRIBUTING: describes branching, PR, review, and testing.
- [ ] SECURITY: includes reporting guidance and secret handling policy.
- [ ] CHANGELOG: captures user-visible changes.

## Gitignore and Secret Hygiene

### Gitignore Updates

- [ ] Use targeted patterns; avoid ignoring entire source trees.
- [ ] Add .env and local config files; add .env.example instead.
- [ ] Keep language and tool specific patterns grouped.
- [ ] Verify new ignore patterns do not hide needed artifacts.

### Secrets Handling

- [ ] Never commit secrets; stop and surface risk immediately if detected.
- [ ] Recommend rotation and revocation for exposed tokens.
- [ ] Add patterns to .gitignore and update docs with secure workflows.
- [ ] Suggest secret scanning and pre-commit checks when relevant.

## PR description and ContextStream traceability (SimHub / Phase 1)

When creating or filling a **PR that implements PRD-001 or TP-SPOC-001–005** (SimHub plugin / Phase 1):

1. **Automatically populate the PR description** from [.github/PR_DESCRIPTION_SIMHUB_PLUGIN.md](../../.github/PR_DESCRIPTION_SIMHUB_PLUGIN.md): copy **Summary**, **PRD and tech plan table**, and **Traceability** (including **Doc paths**). This is **required** on the first PR that touches this scope. Do not leave Traceability blank; use the same Implements (TP-SPOC-001–005), PRD (PRD-001), and Doc paths as in that file.
2. **After the PR is opened or merged:** When ContextStream MCP is available, **capture an implementation event**: `session(action="capture", event_type="implementation", title="PR #<number>: <short summary> (TP-SPOC-004)", content="<PR URL>. Implements TP-SPOC-001–005, PRD-001.", provenance={ pr_url: "<PR URL>" }, code_refs=[ { file_path: "docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md" }, ... ])` with all Doc paths from the Traceability section. See [ContextStream mapping §1.4](../../docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).
3. **When opening the PR:** Add labels **prd-PRD-001** and **tech-plan-TP-SPOC-004** (and **tech-plan-TP-SPOC-001** through **TP-SPOC-005** as desired). If the repo has a workflow that adds labels from PR body (e.g. [.github/workflows/pr-labels.yml](../../.github/workflows/pr-labels.yml)), ensure the PR body contains the Traceability section so labels are applied; otherwise add labels manually or via `gh pr edit --add-label`.

See [.cursor/rules/pr-contextstream.mdc](../../.cursor/rules/pr-contextstream.mdc) for the full rule.

## Output Templates

### PR Description Template (generic)

Use this when drafting a PR summary (for non–SimHub/Phase 1 PRs):

```
## Summary
- [what changed]
- [why it changed]

## Risk
- [low/medium/high] [brief rationale]

## Test Plan
- [ ] [test or verification step]

## Rollback
- [how to revert]
```

### PR Description (SimHub / Phase 1 — use canned content)

For PRs that implement PRD-001 / TP-SPOC-001–005, **do not use the generic template**. Use the content from [.github/PR_DESCRIPTION_SIMHUB_PLUGIN.md](../../.github/PR_DESCRIPTION_SIMHUB_PLUGIN.md) so Traceability and Doc paths are filled.

### Change Control Log Entry

```
Title: [short change title]
Scope: [areas impacted]
Risk: [low/medium/high] [rationale]
Approvals: [reviewers or policy]
Tests: [verification steps]
Rollback: [revert approach]
Docs: [files updated]
```

### Repo Governance Audit Summary

```
## Findings
- [branch protections status]
- [required checks status]
- [permissions status]

## Recommendations
- [actionable improvement]
- [actionable improvement]
```

### Gitignore Update Note

```
Files ignored:
- [pattern] (reason)

Safety checks:
- Verified no required artifacts are hidden
- Added/updated .env.example if needed
```

## Additional Guidance

- Prefer minimal, reversible changes in repo settings.
- Keep language consistent across docs and templates.
- If requirements are unclear, default to least-privilege and safer merges.
