## Summary

**When generating this section, ALWAYS include the PRD and tech plan links below** so the summary and Traceability stay in sync and ContextStream can map PR ↔ Tech Plan ↔ PRD. Use stable IDs and markdown links to the actual docs.

- [What changed]
- [Why it changed]
- **PRD:** [PRD-XXX](docs/product/…) — e.g. [PRD-001 SimHub Plugin POC](docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md) or "none"
- **Tech Plan(s):** [TP-XXX](docs/tech-plans/…) — e.g. [TP-SPOC-001](docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md) or "none"

### PRD and tech plan docs (link the ones this PR touches)

| Doc | Link |
|-----|------|
| **PRD-001** SimHub Plugin POC | [docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md](docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md) |
| **TP-SPOC-001** Plugin Skeleton, SDK, Config | [docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md](docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md) |
| **TP-SPOC-002** Auth (PKCE, Token Storage) | [docs/tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md](docs/tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md) |
| **TP-SPOC-003** API Client and Heartbeat | [docs/tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md](docs/tech-plans/simhub-plugin-poc/003-api-client-heartbeat.md) |
| **TP-SPOC-004** Minimal SimHub UI | [docs/tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md](docs/tech-plans/simhub-plugin-poc/004-minimal-simhub-ui.md) |
| **TP-SPOC-005** POC Testing and Completion | [docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md](docs/tech-plans/simhub-plugin-poc/005-poc-testing-completion.md) |
| **Telemetry Proof** (Phase 2+) | [docs/product/telemetry-proof-system/](docs/product/telemetry-proof-system/), [docs/tech-plans/telemetry-proof-system/](docs/tech-plans/telemetry-proof-system/) |

(Remove rows that don’t apply; add other PRDs/TPs if this PR traces to them.)

## Traceability (ContextStream / knowledge graph)

**Required.** Same IDs and doc paths as in the Summary so the ContextStream knowledge graph can show PR ↔ Tech Plan ↔ PRD. See [ContextStream mapping §1.4](docs/guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

- **Implements (Tech Plan):** e.g. `TP-SPOC-001` — [list one or more TP-XXX IDs this PR implements, or "none" if doc-only / infra]
- **PRD:** e.g. `PRD-001` — [PRD ID this work traces to, or "none"]
- **Doc paths (for implementation event):** `docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md`, `docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md` — [optional; use when capturing an implementation event so the graph UI links PR → TP → PRD]

**SimHub Plugin / Phase 1 PRs:** Copy Summary and Traceability from [.github/PR_DESCRIPTION_SIMHUB_PLUGIN.md](.github/PR_DESCRIPTION_SIMHUB_PLUGIN.md) so this PR is linked to PRD-001 and TP-SPOC-001–005 (include Doc paths for ContextStream).

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
