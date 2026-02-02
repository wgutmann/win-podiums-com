# SimHub Auth - Technical Plans

Technical Plans for long-lived tokens and extended login in the SimHub plugin. Each TP implements part of [PRD-001: Long-Lived Tokens (SimHub)](../../product/simhub-auth/001-long-lived-tokens.md).

**ContextStream**: TPs use stable IDs **TP-001**–**TP-004** and **Implements** → PRD-001 (SimHub Auth) for knowledge graph linking. PRs that implement a TP must declare **Traceability** (Implements: TP-001/002/003/004, PRD: PRD-001 SimHub Auth) in the [PR template](../../../.github/PULL_REQUEST_TEMPLATE.md). See [ContextStream mapping – Linking pull requests](../../guides/contextstream-mapping.md#14-linking-pull-requests-to-tech-plans-and-prds-graph-visible).

## Documents

| Document | ID | Status | Implements | Description |
|----------|-----|--------|------------|-------------|
| [Token Strategy and Mechanism](001-token-strategy-mechanism.md) | TP-001 | Draft | [PRD-001](../../product/simhub-auth/001-long-lived-tokens.md) | Mechanism choice (Worker refresh), token format, extended period, what plugin and Worker store |
| [API Refresh / Session Endpoint](002-api-refresh-session.md) | TP-002 | Draft | [PRD-001](../../product/simhub-auth/001-long-lived-tokens.md) | POST /api/auth/refresh, Discord refresh, D1 usage, rate limiting |
| [Plugin Token Storage and Refresh Flow](003-plugin-storage-refresh.md) | TP-003 | Draft | [PRD-001](../../product/simhub-auth/001-long-lived-tokens.md) | TokenStorage extension, RefreshAsync, 401 handling, session expired UX, logout |
| [Long-Lived Tokens Testing and Completion](004-testing-completion.md) | TP-004 | Draft | [PRD-001](../../product/simhub-auth/001-long-lived-tokens.md) | Manual E2E, automated tests, security checks, completion criteria |

## Related Documentation

- [PRD-001: Long-Lived Tokens (SimHub)](../../product/simhub-auth/001-long-lived-tokens.md)
- [SimHub Auth product README](../../product/simhub-auth/README.md)
- [SimHub Plugin LLD](../../design/components/simhub-plugin.md)
- [API plugin](../../api/plugin.md)
- [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md), [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md)
- [ContextStream mapping](../../guides/contextstream-mapping.md)
- [Documentation Standards](../../standards/documentation-standards.md)
