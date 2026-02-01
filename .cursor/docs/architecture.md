# Architecture Summary

Quick reference for system architecture. See [full HLD](../../docs/architecture/high-level-design.md) for complete details.

## System Overview

**Pattern**: Microservices with event-driven communication  
**Deployment**: Cloudflare Edge Network (Workers, D1, R2)

```
User Device → Web/API (Cloudflare Workers) → D1 Database
         ↓
    SimHub Plugin (.NET 4.8) → Discord OAuth2
```

## Core Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Web Frontend | Cloudflare Workers (SSR) | Luxury UI, onboarding, dashboard |
| API Layer | Cloudflare Workers (REST) | Auth orchestration, telemetry validation |
| SimHub Plugin | C#/.NET Framework 4.8 WPF | Desktop telemetry monitoring |
| Database | Cloudflare D1 (SQLite) | User profiles, race results |
| Storage | Cloudflare R2 (S3-compatible) | Plugin downloads, static assets |
| Identity | Discord OAuth2 | Authentication (sole provider) |

## Key Flows

### Authentication (Hybrid)
- **Path A** (Web-First): Website → Discord Auth → Download Pre-Linked Plugin
- **Path B** (Plugin-First): Download Plugin → Install → Auth in Plugin (primary: browser, QR; manual token debug-only, feature-flagged)

### Telemetry Verification
1. SimHub fires `SessionEnd` event
2. Plugin detects podium finish (Position ≤ 3)
3. Plugin builds HMAC-signed payload
4. Plugin POSTs to `/api/plugin/verify`
5. API validates signature, runs anti-cheat checks
6. API updates user verification state in D1

## Data Model

**Key Entities**:
- `User` — Discord-linked identity, verification state
- `RaceResult` — Verified podium finishes
- `AuthToken` — OAuth2 tokens (encrypted)
- `PluginInstallation` — Plugin health status

See [Database Schema](../../docs/design/data-models/database-schema.md) for full schema.

## Security

- **Auth**: OAuth2 + PKCE (no client secrets in plugin)
- **Telemetry**: HMAC-SHA256 signatures, anti-replay (nonce + timestamp)
- **Storage**: DPAPI (plugin), Workers Secrets + AES-256 (API)
- **Rate Limiting**: 10 podium submissions/day per user

## Tech Stack

**Frontend**: React/Solid.js (TBD) on Cloudflare Workers  
**Backend**: TypeScript on Cloudflare Workers (<50ms CPU limit)  
**Desktop**: C#/.NET Framework 4.8 (SimHub SDK requirement)  
**Database**: Cloudflare D1 (SQLite, edge-replicated)  
**Identity**: Discord OAuth2 (Authorization Code + PKCE)

## Non-Functional Requirements

- **Performance**: <200ms API latency (p95)
- **Availability**: 99.9% uptime
- **Scalability**: Initial target 10K members (D1 supports up to 100K before Postgres migration needed)
- **Security**: Zero exposed secrets, encrypted tokens, GDPR-compliant

## Architecture Decisions (ADRs)

- [ADR-001: Cloudflare Stack](../../docs/architecture/decisions/001-cloudflare-stack.md)
- [ADR-002: Discord OAuth](../../docs/architecture/decisions/002-discord-oauth.md)
- [ADR-003: Hybrid Auth Paths](../../docs/architecture/decisions/003-hybrid-auth-paths.md)

## Related Documentation

- [Full HLD](../../docs/architecture/high-level-design.md) — Complete system architecture
- [Component LLDs](../../docs/design/components/) — Detailed implementation specs
- [API Docs](../../docs/api/) — Endpoint specifications
- [Brand Guidelines](../../docs/brand/design-system.md) — Visual design system
