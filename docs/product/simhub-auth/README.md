# SimHub Auth - Product Requirements

This directory contains Product Requirements Documents (PRDs) for SimHub authentication and session lifecycle: extended login and long-lived tokens so users stay logged in across SimHub sessions without re-authenticating every time.

**ContextStream**: PRDs in this folder use stable IDs and **Related** for knowledge graph linking. See [ContextStream mapping](../../guides/contextstream-mapping.md).

## Documents

| Document | Status | Version | Description |
|----------|--------|---------|--------------|
| [PRD-001: Long-Lived Tokens (SimHub)](001-long-lived-tokens.md) | Draft | 1.0 | Extended login: users remain authenticated for an extended period (e.g. 30 days) without completing Discord OAuth again each time they open SimHub. Technical Plan to be created after PRD approval. |

## Overview

SimHub Auth covers:

1. **Long-lived sessions** — After one Discord login, the plugin remains usable across SimHub launches for a defined extended period.
2. **Invalid credential handling** — When credentials expire or are revoked, the system refreshes transparently or prompts the user to log in again (no silent failure).
3. **Security** — Credentials at rest remain protected (e.g. DPAPI); revocation and logout are supported.

Out of scope for this feature area: exact token format and refresh algorithm (HLD/Tech Plan), Discord app config beyond refresh needs, "remember me" UX copy.

## Related Documentation

- [Phase 1 MVP Scope](../phase-1-mvp-scope.md) — Phase 1 "Basic SimHub plugin" and auth flows
- [SimHub Plugin POC](../simhub-plugin-poc/001-simhub-plugin-poc.md) — POC auth (browser PKCE, manual token debug)
- [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md) — Sole identity provider
- [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md) — Web + plugin auth paths
- [Discord Integration LLD](../../design/integrations/discord-integration.md) — OAuth flows and plugin methods
- [API plugin](../../api/plugin.md) — Auth and plugin endpoints
- [ContextStream mapping](../../guides/contextstream-mapping.md) — Doc IDs, Related/Implements
- [Documentation Standards](../../standards/documentation-standards.md) — Documentation format
