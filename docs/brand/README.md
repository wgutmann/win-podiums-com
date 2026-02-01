# Brand and Design

Brand and design documentation for WinPodiums: visual design system, web presence (domain, framework, inspiration), and product manager personality. Design docs link to Phase 1 scope, ADRs, HLD, and guides so the ContextStream knowledge graph associates design concepts with many PRDs, ADRs, and tech docs.

## Documents

| Document | ID | Related | Description |
|----------|-----|---------|-------------|
| [Visual Design System & Brand Guidelines](design-system.md) | DC-DS | [web-presence](web-presence.md), [phase-1-mvp-scope](../product/phase-1-mvp-scope.md), [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md), [product-manager-personality](product-manager-personality.md), [HLD](../architecture/high-level-design.md), this README | Colors, typography, spacing, components, animations, accessibility, brand voice |
| [Web Presence](web-presence.md) | DC-WP | [design-system](design-system.md), [phase-1-mvp-scope](../product/phase-1-mvp-scope.md), [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md), [product-manager-personality](product-manager-personality.md), [HLD](../architecture/high-level-design.md), [next-steps](../architecture/next-steps.md), this README | Canonical domain, Phase 1 web scope, Cloudflare frameworks (Astro recommended), 25+ design inspirations |
| [Product Manager Personality](product-manager-personality.md) | — | [design-system](design-system.md), [web-presence](web-presence.md), [phase-1-mvp-scope](../product/phase-1-mvp-scope.md), [CONTRIBUTING](../../CONTRIBUTING.md), [PR template](../../.github/PULL_REQUEST_TEMPLATE.md) | PM subagent: role, brand alignment, behaviors, review checklist |

## Traceability

**PRD-010** ([Brand and Design](../product/brand/001-brand-and-design.md)) — design-system, web-presence, and PM personality implement PRD-010.

Brand and design docs trace to:

- **Phase 1 scope** ([phase-1-mvp-scope.md](../product/phase-1-mvp-scope.md)) — static Gate, landing, auth
- **ADR-003** ([003-hybrid-auth-paths.md](../architecture/decisions/003-hybrid-auth-paths.md)) — landing CTAs, web-first vs plugin-first
- **HLD** ([high-level-design.md](../architecture/high-level-design.md)) — brand-aligned UX, luxury UI
- **Architecture** ([architecture/README.md](../architecture/README.md)) — system overview, decisions

## Standards

See [Documentation Standards](../standards/documentation-standards.md) and [ContextStream mapping](../guides/contextstream-mapping.md) (Design concepts and brand, §1.5) for stable IDs (DC-DS, DC-WP), Related links, and capturing design decisions.
