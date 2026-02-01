# SimHub Plugin POC - Technical Plans

Technical Plans for the SimHub Plugin proof-of-concept. Each TP implements part of [PRD-001: SimHub Plugin POC](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md).

**ContextStream**: TPs use stable IDs **TP-SPOC-001**–**TP-SPOC-005** and **Implements** → PRD-001 for knowledge graph linking. PRs that implement a TP must declare **Traceability** (Implements: TP-SPOC-XXX, PRD: PRD-001) in the [PR template](../../../.github/PULL_REQUEST_TEMPLATE.md) and optionally capture an implementation event so the graph UI shows PR ↔ TP ↔ PRD. See [ContextStream mapping – Linking pull requests](../../guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

## Documents

| Document | ID | Status | Implements | Description |
|----------|-----|--------|------------|-------------|
| [Plugin Skeleton, SDK, Config](001-plugin-skeleton-sdk-config.md) | TP-SPOC-001 | Draft | [PRD-001](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md) | Project skeleton, SimHub SDK wiring, configurable API base URL |
| [Auth (PKCE, Token Storage)](002-auth-pkce-token-storage.md) | TP-SPOC-002 | Draft | [PRD-001](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md) | Browser OAuth PKCE, loopback callback, DPAPI token storage |
| [API Client and Heartbeat](003-api-client-heartbeat.md) | TP-SPOC-003 | Draft | [PRD-001](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md) | ApiClient, POST /api/plugin/heartbeat |
| [Minimal SimHub UI](004-minimal-simhub-ui.md) | TP-SPOC-004 | Draft | [PRD-001](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md) | Link to Discord, Send heartbeat, status display |
| [POC Testing and Completion](005-poc-testing-completion.md) | TP-SPOC-005 | Draft | [PRD-001](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md) | Manual E2E, unit/contract tests, POC completion criteria |

## Related Documentation

- [PRD-001: SimHub Plugin POC](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md)
- [SimHub Plugin LLD](../../design/components/simhub-plugin.md)
- [API plugin](../../api/plugin.md), [API authentication](../../api/authentication.md)
- [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md), [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md)
- [ContextStream mapping](../../guides/contextstream-mapping.md)
- [Documentation Standards](../../standards/documentation-standards.md)
