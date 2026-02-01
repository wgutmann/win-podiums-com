# Technical Plans (Low-Level Design)

Technical Plans define **how to build** features specified in Product Requirements Documents (PRDs). They are written for developers and implementers.

## Structure

Technical Plans follow the [WinPodiums Documentation Standards](../standards/documentation-standards.md), which incorporate WHOOP principles:
- **Automation**: Coupled with code changes
- **Discoverability**: Clear structure, index files
- **Standardization**: Uniform format
- **Collaboration**: Direct links, traceability

## Document Format

Each Technical Plan includes:
- **Overview**: Implementation approach summary
- **Architecture**: Component diagrams, data flow
- **Implementation Details**: API endpoints, data models, algorithms
- **Testing Strategy**: Unit tests, integration tests
- **Deployment**: Steps, configuration, rollback
- **Performance Considerations**: Targets, optimizations
- **Security Considerations**: Measures, threat mitigation
- **Related Documentation**: Links to PRD, ADRs, API specs

## Feature Areas

- [ContextStream and Agents](contextstream-agents/) — ContextStream rule, bootstrap, search-first, decisions/lessons (PRD-009, TP-009)
- [GitHub Traceability](github-traceability/) — Labels as code, traceability mapping, PR template (PRD-008, TP-008)
- [SimHub Plugin POC](simhub-plugin-poc/) — Plugin skeleton, auth (PKCE), API client/heartbeat, minimal UI, POC testing (PRD-001, TP-SPOC-001–005)
- [Telemetry Proof System](telemetry-proof-system/) — Multi-layered security implementation

## Traceability

Technical Plans trace from:
- **PRDs** (`docs/product/`) - What to build and why
- **ADRs** (`docs/architecture/decisions/`) - Architecture decisions
- **API Specs** (`docs/api/`) - API endpoints

### Pull requests and ContextStream knowledge graph

PRs that implement a tech plan must link to the TP and PRD so the **ContextStream knowledge graph** shows **PR ↔ Tech Plan ↔ PRD** in the UI:

1. **PR template:** Fill the **Traceability** section with **Implements (Tech Plan):** `TP-XXX` and **PRD:** `PRD-XXX` (e.g. `TP-SPOC-001`, `PRD-001`). See [.github/PULL_REQUEST_TEMPLATE.md](../../.github/PULL_REQUEST_TEMPLATE.md).
2. **Graph visibility:** To make the link visible in the ContextStream knowledge graph UI, capture an **implementation** event that references the PR URL and the tech plan + PRD doc paths. See [ContextStream mapping – Linking pull requests](../guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

## Standards

See [Documentation Standards](../standards/documentation-standards.md) for complete format and structure requirements.
