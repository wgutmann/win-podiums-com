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

## Change Control Checklist

- [ ] Scope: summarize what is changing and why.
- [ ] Risk: note any security, data, or availability impact.
- [ ] Review: confirm required reviewers and review depth.
- [ ] Testing: define minimum verification steps.
- [ ] Rollback: state how to revert if needed.
- [ ] Documentation: update README/CHANGELOG/CONTRIBUTING/SECURITY as appropriate.

## Repo Management Checklist

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

## Output Templates

### PR Description Template

Use this when drafting a PR summary:

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
