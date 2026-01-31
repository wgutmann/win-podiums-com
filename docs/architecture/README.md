# Architecture Documentation

System architecture and high-level design decisions for WinPodiums.

## Documents

- **[High-Level Design](high-level-design.md)** — Complete system architecture overview
- **[Architecture Decisions](decisions/)** — ADRs documenting key architectural choices

## System Overview

WinPodiums is a **microservices architecture** deployed on **Cloudflare Edge Network**, with three main components:

1. **Web/API** (Cloudflare Workers) — SSR frontend + REST API
2. **SimHub Plugin** (.NET Framework 4.8) — Desktop telemetry monitor
3. **Database** (Cloudflare D1) — User data and race results

**External Dependencies**: Discord OAuth2 (identity), SimHub SDK (telemetry)

## Quick Links

- [Component Design](../design/components/) — Low-level implementation details
- [API Documentation](../api/) — Endpoint specifications
- [Brand Guidelines](../brand/) — Visual design system
- [Deployment Guide](../guides/deployment.md) — How to deploy

## Diagrams

Key architecture diagrams:

- [System Overview](diagrams/system-overview.mmd) — Component relationships
- [Data Flow](diagrams/data-flow.mmd) — Request/response patterns
- [Auth Flows](../design/integrations/discord-integration.md#sequence-diagrams) — Authentication sequences

## For Developers

New to the project? Start here:

1. Read the [High-Level Design](high-level-design.md)
2. Review [Architecture Decisions](decisions/)
3. Set up your environment with the [Development Guide](../guides/development.md)
4. Explore component-specific [Design Docs](../design/components/)
