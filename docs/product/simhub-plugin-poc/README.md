# SimHub Plugin POC - Product Requirements

This directory contains the Product Requirements Document (PRD) for the SimHub plugin proof-of-concept. The POC validates plugin–API–auth integration and SimHub load before investing in full telemetry-proof and UI.

**ContextStream**: PRD-001 and tech plans TP-SPOC-001–005 use stable IDs and **Related** / **Implements** for knowledge graph linking. See [ContextStream mapping](../guides/contextstream-mapping.md).

## Documents

| Document | Status | Version | Technical Plan | Description |
|----------|--------|---------|----------------|-------------|
| [PRD-001: SimHub Plugin POC](001-simhub-plugin-poc.md) | Draft | 1.0 | [TP-SPOC-001](../tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md)–[005](../tech-plans/simhub-plugin-poc/005-poc-testing-completion.md) | Minimal plugin: browser auth (PKCE) primary; manual token debug-only, feature-flagged; one verification API call (heartbeat) |

## Overview

The SimHub Plugin POC proves that:

1. **Plugin loads in SimHub** — The plugin builds and runs inside SimHub (SDK wired when available).
2. **Auth works from the plugin** — A user can authenticate via browser-based OAuth (PKCE) and store credentials securely (DPAPI). Manual token is debug-only, feature-flagged.
3. **API call succeeds** — The plugin can perform at least one verification call (e.g. heartbeat or stub) to the WinPodiums API.

Out of scope for the POC: full Scrutineering Panel UI, QR/browser auth in plugin, race submission, HMAC signing, full Telemetry Proof layers, installer/updater.

## Related Documentation

- [Phase 1 MVP Scope](../phase-1-mvp-scope.md) — POC is part of Phase 1 “Basic SimHub plugin”
- [SimHub Plugin LLD](../../design/components/simhub-plugin.md) — Plugin structure and target architecture
- [API plugin](../../api/plugin.md) — Auth and heartbeat endpoints
- [Architecture README](../../architecture/README.md) — HLD, Next Steps, ADRs
- [Tech plans (SimHub POC)](../../tech-plans/simhub-plugin-poc/README.md) — TP-SPOC-001–005 with Implements → PRD-001
- [ContextStream mapping](../../guides/contextstream-mapping.md) — Doc IDs, Related/Implements, graph
- [Documentation Standards](../../standards/documentation-standards.md) — Documentation format
