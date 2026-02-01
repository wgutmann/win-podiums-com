# TP-008: Labels and Traceability

**Doc type**: Technical Plan | **ID**: TP-008 | **Implements**: [PRD-008: GitHub Labels and PR Traceability](../../product/github-traceability/001-github-labels-pr-traceability.md) | **Related**: [ContextStream mapping](../../guides/contextstream-mapping.md), [CONTRIBUTING](../../../CONTRIBUTING.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Development Team

## Overview

This Technical Plan describes the implementation of **labels as code** and **PR traceability** for GitHub and ContextStream: canonical traceability mapping (doc ID → path), labels YAML and sync workflow, PR template updates, rules/skills requiring template + labels, and optional PR traceability check. It implements PRD-008.

## Architecture

### Components

- **.github/traceability-mapping.yaml** — Single source of truth: `prds` and `tech_plans` keys mapping doc IDs to repo-relative paths. Consumed by PR template instructions, ContextStream implementation events (`code_refs`), and optional automation.
- **.github/labels.yaml** — Traceability labels (`prd:PRD-XXX`, `tech-plan:TP-XXX`) with color and description. Synced to GitHub via EndBug/label-sync.
- **.github/workflows/sync-labels.yml** — Runs on `workflow_dispatch` and on push to `main` when `labels.yaml` changes; syncs labels to the repo (no delete of other labels).
- **.github/PULL_REQUEST_TEMPLATE.md** — Traceability section includes Implements (Tech Plan), PRD, Doc links (using mapping), and Labels (from labels.yaml).
- **.github/workflows/pr-traceability-check.yml** — Optional: on `pull_request`, checks PR body for Traceability headings and one Doc link, and PR for at least one traceability label; comments and fails if missing.

### Data Flow

1. Maintainer adds or renames a PRD/tech plan → updates `traceability-mapping.yaml` and, if new, `labels.yaml`; runs sync-labels if needed.
2. Author opens a PR → fills template (Traceability, Doc links from mapping, applies labels from labels.yaml).
3. Optional: pr-traceability-check runs; fails if template or labels missing.
4. When capturing a ContextStream implementation event → use mapping to resolve TP-XXX/PRD-XXX to file paths for `code_refs`.

## Implementation Details

### Traceability Mapping

- Path: `.github/traceability-mapping.yaml`.
- Structure: `prds: { PRD-008: path, ... }`, `tech_plans: { TP-008: path, ... }`.
- Update when adding/renaming PRDs or tech plans; referenced in contextstream-mapping.md §1.4 and PR template.

### Labels as Code

- Path: `.github/labels.yaml`.
- Format: Array of `{ name, color, description }`; names `prd:PRD-XXX`, `tech-plan:TP-XXX`.
- Sync: `.github/workflows/sync-labels.yml` uses EndBug/label-sync@v2, `delete-other-labels: false`.

### PR Template

- Traceability section: Implements (Tech Plan), PRD, Doc links (markdown links using mapping), Labels (from labels.yaml).
- CONTRIBUTING and rules/skills require every PR to use template + Doc links + labels.

### Rules and Skills

- **.cursor/rules/contextstream.mdc** — Tagging bullet: every PR must use template with Traceability, Doc links, labels; use mapping for implementation event `code_refs`.
- **github-change-control skill** — When creating/updating a PR: fill template, apply traceability labels; resolve paths from mapping.
- **cursor-project-docs, product-manager skills** — Reference PR template, mapping, labels; expect Traceability and Doc links on PRs.

### Optional PR Traceability Check

- Workflow: `pr-traceability-check.yml`; runs on pull_request opened/edited/synchronize.
- Checks: PR body contains "Implements (Tech Plan):" and "PRD:" and at least one link matching `docs/(product|tech-plans)/*.md`; PR has at least one label matching `prd:` or `tech-plan:`.
- On failure: comment with link to CONTRIBUTING and template; set job failure.

## Testing Strategy

- **Mapping**: Manually verify all entries point to existing files.
- **Labels sync**: Run workflow (manual or push to labels.yaml); verify labels appear in GitHub.
- **PR template**: Open a draft PR and confirm Traceability, Doc links, and Labels sections are present and instructions reference mapping and labels.yaml.
- **pr-traceability-check**: Open a PR without Doc link or without traceability label; confirm check fails and comment is posted.

## Deployment

- No runtime deployment; repo config and workflows only. After merge, sync-labels can be run once to create labels if not already present.

## Related Documentation

- [PRD-008: GitHub Labels and PR Traceability](../../product/github-traceability/001-github-labels-pr-traceability.md)
- [ContextStream mapping §1.4](../../guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible)
- [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md), [.github/traceability-mapping.yaml](../../../.github/traceability-mapping.yaml), [.github/labels.yaml](../../../.github/labels.yaml)
