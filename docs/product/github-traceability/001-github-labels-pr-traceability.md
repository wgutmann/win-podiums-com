# PRD-008: GitHub Labels and PR Traceability

**Doc type**: PRD | **ID**: PRD-008 | **Related**: [Phase 1 MVP Scope](../phase-1-mvp-scope.md), [ContextStream mapping](../../guides/contextstream-mapping.md), [CONTRIBUTING](../../../CONTRIBUTING.md) | **Technical Plans**: [TP-008](../../tech-plans/github-traceability/001-labels-and-traceability.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Product / Engineering  
**Related**: [Phase 1 MVP Scope](../phase-1-mvp-scope.md), [ContextStream mapping – Linking pull requests](../../guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible), [CONTRIBUTING](../../../CONTRIBUTING.md)

## Overview

### Problem Statement

We need a consistent way to link pull requests to product and technical documentation (PRDs, tech plans) so that both humans and the ContextStream knowledge graph can see **PR ↔ Tech Plan ↔ PRD**. Without labels-as-code and a canonical mapping, traceability is ad hoc and automation (e.g. ContextStream implementation events, CI checks) cannot reliably resolve doc IDs to repo paths.

### Solution

Define **labels as code** (GitHub labels defined in repo and synced to GitHub) and a **canonical traceability mapping** (doc ID → file path) so that:

1. Every PR declares Traceability (Implements: TP-XXX, PRD: PRD-XXX), Doc links, and traceability labels.
2. Automation and humans can resolve labels/IDs to doc paths for ContextStream `code_refs` and for PR body links.
3. The ContextStream knowledge graph can show PR ↔ Tech Plan ↔ PRD when implementation events are captured with those paths.

### Success Criteria

- [.github/traceability-mapping.yaml](../../../.github/traceability-mapping.yaml) is the single source of truth for doc ID → path; all PRDs and tech plans are listed.
- [.github/labels.yaml](../../../.github/labels.yaml) defines traceability labels (`prd:PRD-XXX`, `tech-plan:TP-XXX`); labels are synced to GitHub via [.github/workflows/sync-labels.yml](../../../.github/workflows/sync-labels.yml).
- Every PR uses the [PR template](../../../.github/PULL_REQUEST_TEMPLATE.md) with Traceability, Doc links, and Labels filled; optional [pr-traceability-check](../../../.github/workflows/pr-traceability-check.yml) validates this.
- ContextStream implementation events use the mapping to set `code_refs` to TP and PRD paths so the graph shows PR ↔ TP ↔ PRD.

## User Stories

### As a Developer
- I want to apply traceability labels from a single config so I don’t invent label names and the repo stays consistent.
- I want the PR template to tell me exactly which Doc links and labels to add, so I can link my PR to the right PRD and tech plan.

### As a Reviewer
- I want to see at a glance which PRD and tech plan a PR implements (labels + Traceability section), so I can verify scope and doc alignment.

### As an Agent / Cursor User
- I want the traceability mapping and labels to be machine-readable so tools can create ContextStream implementation events or validate PRs from PR body and labels.

## Requirements

### Functional Requirements

#### FR-001: Canonical Traceability Mapping
- **Priority**: P0 (Critical)
- **Description**: A single YAML file maps every PRD and tech plan doc ID to its repo-relative file path.
- **Acceptance Criteria**:
  - File exists at `.github/traceability-mapping.yaml` with `prds` and `tech_plans` keys.
  - Every PRD and tech plan referenced in the repo is listed; paths are correct and relative to repo root.
  - Documented in [ContextStream mapping §1.4](../../guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible) and PR template.

#### FR-002: Labels as Code
- **Priority**: P0 (Critical)
- **Description**: Traceability labels are defined in repo (YAML) and synced to GitHub so PRs can be tagged consistently.
- **Acceptance Criteria**:
  - File exists at `.github/labels.yaml` with one label per PRD and tech plan (e.g. `prd:PRD-001`, `tech-plan:TP-SPOC-001`).
  - A workflow (e.g. `sync-labels.yml`) syncs labels to the repository on change or on demand.
  - Label names match doc IDs so automation can resolve label → path via the traceability mapping.

#### FR-003: PR Template Traceability and Doc Links
- **Priority**: P0 (Critical)
- **Description**: Every PR must include Traceability (Implements, PRD), Doc links (markdown links to PRD/TP docs using the mapping), and Labels (from labels.yaml).
- **Acceptance Criteria**:
  - PR template includes required Traceability section with Implements (Tech Plan), PRD, Doc links, and Labels.
  - CONTRIBUTING and ContextStream mapping doc state that PRs must fill these when opened or before merge.

#### FR-004: Optional PR Traceability Check
- **Priority**: P2 (Medium)
- **Description**: An optional CI workflow checks that PR body contains Traceability patterns and at least one Doc link, and that the PR has at least one traceability label.
- **Acceptance Criteria**:
  - Workflow runs on `pull_request` (opened, edited, synchronize); on failure, comments on the PR and fails the check.
  - Documented as recommended in CONTRIBUTING; branch protection can require this check if desired.

## Technical Constraints

- Labels must use a format compatible with a “labels as code” action (e.g. EndBug/label-sync); YAML array of `name`, `color`, `description`.
- Traceability mapping must be consumable by scripts and by ContextStream (e.g. for implementation event `code_refs`).

## Risks

- **Label sync**: If sync workflow is not run after adding new PRDs/TPs, GitHub will lack new labels; mitigate by documenting “run sync after updating labels.yaml” and optionally triggering on push to `labels.yaml`.

## Related Documentation

- [ContextStream mapping – Linking pull requests](../../guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible)
- [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md)
- [.github/traceability-mapping.yaml](../../../.github/traceability-mapping.yaml), [.github/labels.yaml](../../../.github/labels.yaml)
- [CONTRIBUTING](../../../CONTRIBUTING.md)
- [TP-008: Labels and Traceability](../../tech-plans/github-traceability/001-labels-and-traceability.md)
