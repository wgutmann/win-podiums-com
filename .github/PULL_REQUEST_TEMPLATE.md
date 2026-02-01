## Summary

**When generating this section, ALWAYS include the PRD and tech plan links below** so the summary and Traceability stay in sync and ContextStream can map PR ↔ Tech Plan ↔ PRD. Use stable IDs and markdown links to the actual docs.

- [What changed]
- [Why it changed]
- **PRD:** [PRD-XXX](docs/product/…) — e.g. [PRD-001 SimHub Plugin POC](docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md) or "none"
- **Tech Plan(s):** [TP-XXX](docs/tech-plans/…) — e.g. [TP-SPOC-001](docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md) or "none"

## Traceability (ContextStream / knowledge graph)

**Required.** Same IDs and doc paths as in the Summary so the ContextStream knowledge graph can show PR ↔ Tech Plan ↔ PRD. See [ContextStream mapping §1.4](docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

- **Implements (Tech Plan):** e.g. `TP-SPOC-001` — [list one or more TP-XXX IDs this PR implements, or "none" if doc-only / infra]
- **PRD:** e.g. `PRD-001` — [PRD ID this work traces to, or "none"]
- **Doc paths (for implementation event):** `docs/tech-plans/…/001-….md`, `docs/product/…/001-….md` — [optional; use when capturing an implementation event so the graph UI links PR → TP → PRD]

## Risk

- [ ] [low / medium / high] — [brief rationale]

## Test plan

- [ ] [test or verification step]

## Rollback

- [How to revert if needed]

## Product impact

- [ ] **Does this change scope, requirements, or user-facing copy?** (e.g. `docs/product/**`, `docs/brand/**`, UI strings, API descriptions, landing copy)
  - If **yes**: Product review requested. Use the [PM review checklist](docs/brand/product-manager-personality.md#review-process) (human PM or agent with [product manager personality](docs/brand/product-manager-personality.md)).
  - If **no**: Leave unchecked and skip.
