# Design Documentation (Low-Level Design)

Component-level implementation details, data models, integrations, and diagrams for WinPodiums. These docs connect to the [High-Level Design](../architecture/high-level-design.md), [Phase 1 scope](../product/phase-1-mvp-scope.md), [ADRs](../architecture/decisions/), and [API](../api/README.md).

## Documents

| Area | Document | Description |
|------|----------|-------------|
| **Components** | [SimHub Plugin LLD](components/simhub-plugin.md) | Plugin structure, auth, API client, position detection |
| **Data models** | [Database Schema](data-models/database-schema.md) | D1 tables, KV usage, caching; see [entity-relationship diagram](diagrams/entity-relationship.mmd) |
| **Integrations** | [Discord Integration LLD](integrations/discord-integration.md) | OAuth2 flows, web/plugin methods, sequence diagrams |
| **Security** | [Security & Anti-Cheat LLD](security-anticheat.md) | Phase 2+ anti-cheat; Phase 1: rate limiting and OAuth security |
| **Diagrams** | [Diagrams README](diagrams/README.md) | Mermaid diagrams: [entity-relationship](diagrams/entity-relationship.mmd), [system overview](../architecture/diagrams/system-overview.mmd), [data flow](../architecture/diagrams/data-flow.mmd) |

## Related

- **Architecture**: [HLD](../architecture/high-level-design.md), [Next Steps](../architecture/next-steps.md), [ADR-001 Cloudflare](../architecture/decisions/001-cloudflare-stack.md), [ADR-002 Discord](../architecture/decisions/002-discord-oauth.md), [ADR-003 Hybrid Auth](../architecture/decisions/003-hybrid-auth-paths.md)
- **Product**: [Phase 1 scope](../product/phase-1-mvp-scope.md), [Telemetry Proof PRDs](../product/telemetry-proof-system/)
- **API**: [API README](../api/README.md), [OpenAPI spec](../api/openapi.yaml), [Authentication](../api/authentication.md), [Plugin API](../api/plugin.md)
- **Code**: Worker in `apps/api/`, plugin in `apps/plugin/`
