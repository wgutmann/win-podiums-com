# PR Description: feature/brand — paste into GitHub when opening the PR

Use the body below in the GitHub PR "Description" so the PR template is filled and ContextStream can link this PR to design docs and phase scope.

---

## Summary

- **What changed**: PM skill design evaluation fixes and brand doc additions. Product-manager skill now lists design-system in Canonical Docs; Quick Start fallback and checklist include Web/landing and design docs when the message/PR touches web, landing, design, or UI. Phase 1 design rule (voice + key tokens; full polish Phase 2+) and design-direction rule (reject gamified/casual/cluttered) added to skill and personality. PM checklist Web/landing bullet extended with accessibility (contrast, focus, prefers-reduced-motion). design-system typography clarified (Playfair Display primary; Cormorant Garamond optional). New `docs/brand/web-presence.md` (DC-WP) and `docs/brand/README.md`; PM examples updated (Example 6 design/landing review, Example 1 checklist).
- **Why**: Align PM behavior with design-system and web-presence so design/landing reviews use the right docs, Phase 1 scope is clear, and ContextStream can associate design concepts (DC-DS, DC-WP) with Phase 1 scope, ADR-003, and HLD.

## Traceability (ContextStream / knowledge graph)

**Required.** Link this PR to the tech plan(s) and PRD so the ContextStream knowledge graph can show PR ↔ Tech Plan ↔ PRD. Use the stable doc IDs from `docs/tech-plans/` and `docs/product/`.

- **Implements (Tech Plan):** none — doc-only (brand and PM skill).
- **PRD:** none — doc-only; design docs support Phase 1 scope and future PRDs.

**Design docs (ContextStream graph):** This PR adds/updates design document nodes and their links. Use these paths and IDs when capturing or ingesting so the graph associates the PR with design concepts:

- **DC-DS** — [docs/brand/design-system.md](docs/brand/design-system.md) — Related: [web-presence](docs/brand/web-presence.md), [phase-1-mvp-scope](docs/product/phase-1-mvp-scope.md), [ADR-003](docs/architecture/decisions/003-hybrid-auth-paths.md), [product-manager-personality](docs/brand/product-manager-personality.md), [HLD](docs/architecture/high-level-design.md), [brand README](docs/brand/README.md)
- **DC-WP** — [docs/brand/web-presence.md](docs/brand/web-presence.md) — Related: [design-system](docs/brand/design-system.md), [phase-1-mvp-scope](docs/product/phase-1-mvp-scope.md), [ADR-003](docs/architecture/decisions/003-hybrid-auth-paths.md), [product-manager-personality](docs/brand/product-manager-personality.md), [HLD](docs/architecture/high-level-design.md), [next-steps](docs/architecture/next-steps.md), [brand README](docs/brand/README.md)
- **Brand index** — [docs/brand/README.md](docs/brand/README.md) — hub for DC-DS, DC-WP, product-manager-personality; traceability to Phase 1 scope, ADR-003, HLD

**Phase 1 scope:** [docs/product/phase-1-mvp-scope.md](docs/product/phase-1-mvp-scope.md) — Static Gate, landing, auth; Luxury UI = Phase 2+.

**ADR-003:** [docs/architecture/decisions/003-hybrid-auth-paths.md](docs/architecture/decisions/003-hybrid-auth-paths.md) — Landing CTAs (Claim Your Invitation, Download Plugin).

## Risk

- [x] **low** — Documentation and skill/config only; no runtime or API change. PM and brand behavior is more consistent and traceable.

## Test plan

- [ ] Verify links: open `docs/brand/README.md`, `docs/brand/web-presence.md`, `docs/brand/design-system.md`, `docs/brand/product-manager-personality.md` and confirm all internal links resolve.
- [ ] Optional: run ContextStream `project(action="ingest_local")` (or equivalent) after merge so new design docs and brand README are indexed; confirm PR ↔ DC-DS / DC-WP / phase-1-mvp-scope / ADR-003 can be queried if your integration supports it.

## Rollback

- Revert commit `53f18f2` (or the merge commit that brings in this branch). Restores previous PM skill and brand docs; removes `docs/brand/web-presence.md` and `docs/brand/README.md`.

## Product impact

- [x] **Does this change scope, requirements, or user-facing copy?** Yes — `docs/brand/**`, `.cursor/skills/product-manager/**` (PM review checklist and behavior).
  - Product review requested. Use the [PM review checklist](docs/brand/product-manager-personality.md#review-process) (human PM or agent with [product manager personality](docs/brand/product-manager-personality.md)).
