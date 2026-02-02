---
name: github-change-control
description: Provides GitHub change control, repo management, gitignore, and secret hygiene best practices. Use when the user asks about change control, branch protections, PR template, traceability, labels, .gitignore, or preventing/handling secrets in git.
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

## PR traceability (required)

When **creating or updating a PR**, the agent must:

1. **Fill the PR template** (Summary, **Traceability** with Implements: TP-XXX and PRD: PRD-XXX, **Doc links** to PRD/TP docs, Risk, Test plan, Rollback, Product impact). Resolve doc paths from [.github/traceability-mapping.yaml](../../../.github/traceability-mapping.yaml) for Doc links and for ContextStream implementation events.
2. **Apply traceability labels** from [.github/labels.yaml](../../../.github/labels.yaml) (e.g. `prd:PRD-001`, `tech-plan:TP-SPOC-001`) so the GitHub UI and ContextStream can associate the PR with the tech plan and PRD. Use the traceability mapping to pick the correct labels for the declared TP-XXX and PRD-XXX.
3. **When adding a new PRD or tech plan**: Add entries to `.github/traceability-mapping.yaml` and `.github/labels.yaml` in the same PR. The Sync labels workflow runs on PRs that change `labels.yaml`, so new labels are available when the PR is opened; apply them to the PR. Do not create a separate labels-only branch.

See [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md) and [ContextStream mapping §1.4](../../../docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

## Output Templates

### PR Description Template

Use this when drafting a PR summary (include Traceability and Doc links per the PR template):

```
## Summary
- [what changed]
- [why it changed]

## Traceability (ContextStream / knowledge graph)
- Implements (Tech Plan): [TP-XXX or none]
- PRD: [PRD-XXX or none]
- Doc links: [links from .github/traceability-mapping.yaml]
- Labels: [prd:PRD-XXX, tech-plan:TP-XXX from .github/labels.yaml]

## Risk
- [low/medium/high] [brief rationale]

## Test Plan
- [ ] [test or verification step]

## Rollback
- [how to revert]
```

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
