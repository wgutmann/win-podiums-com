# PRD-001: Long-Lived Tokens (SimHub)

**Doc type**: PRD | **ID**: PRD-001 | **Related**: [Phase 1 MVP Scope](../phase-1-mvp-scope.md), [SimHub Plugin POC](../simhub-plugin-poc/001-simhub-plugin-poc.md), [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md), [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Product / Engineering  
**Related**: [Phase 1 MVP Scope](../phase-1-mvp-scope.md), [SimHub Plugin POC](../simhub-plugin-poc/001-simhub-plugin-poc.md), [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md), [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md), [Discord Integration LLD](../../design/integrations/discord-integration.md), [API plugin](../../api/plugin.md). Technical Plan for long-lived tokens to be created after PRD approval.

## Overview

### Problem Statement

Users must re-authenticate with Discord whenever the stored access token expires or is invalid (e.g. after some time or token revocation). This forces repeated logins when opening SimHub and hurts user experience.

### Solution

Enable "long-lived" login: after one successful Discord authentication, the user remains logged in to the SimHub plugin for an extended period (e.g. 30 days or configurable) without having to complete Discord OAuth again each time they open SimHub. The exact mechanism (Discord refresh tokens, API-issued session tokens, or hybrid) is left to HLD and Tech Plan.

### Success Criteria

- A user who has logged in once can open SimHub on subsequent launches and use the plugin (e.g. heartbeat, profile) without re-authenticating, for a defined extended period (e.g. 30 days), unless they log out or revoke access.
- If the current credential becomes invalid, the system either refreshes it transparently or prompts the user to log in again (no silent failure).

## User Stories

### As a Sim Racer
- I want to stay logged in across SimHub sessions so I don't have to sign in with Discord every time I open SimHub.
- I want to be prompted to log in again only when my session has truly expired or I choose to log out.

### As a Product Owner
- I want login to remain secure (no long-lived secrets in plaintext, revocation possible).
- I want extended login to work with both browser (PKCE) and manual-token auth flows where supported.

## Requirements

### Functional Requirements

#### FR-001: Extended Authentication Period
- **Priority**: P0 (Critical)
- **Description**: After successful Discord login (browser or manual token), the plugin must remain authenticated for an extended period (e.g. 30 days) without requiring the user to complete Discord OAuth again.
- **Acceptance Criteria**:
  - User completes Discord OAuth once (browser PKCE or manual token).
  - On subsequent SimHub launches within the extended period, the plugin can call protected API endpoints (e.g. heartbeat, profile) without the user re-authenticating.
  - Extended period is defined and configurable (e.g. 30 days); exact value is determined in Tech Plan.

#### FR-002: Invalid Credential Handling
- **Priority**: P0 (Critical)
- **Description**: If the current credential becomes invalid (expired, revoked), the system must either refresh it transparently or prompt the user to log in again; silent failure is not acceptable.
- **Acceptance Criteria**:
  - When the API returns 401 for a request (e.g. heartbeat), the plugin either obtains a new valid credential via refresh (if supported) or surfaces a clear "session expired" or "log in again" state to the user.
  - User is not left in a broken state where the plugin appears linked but API calls always fail.

#### FR-003: Explicit Logout
- **Priority**: P1 (High)
- **Description**: User can explicitly log out, clearing stored credentials.
- **Acceptance Criteria**:
  - Plugin provides a logout action that clears stored credentials (e.g. DPAPI storage).
  - After logout, the plugin requires the user to log in again before calling protected API endpoints.

### Non-Functional Requirements

#### NFR-001: Security
- **Priority**: P0 (Critical)
- **Description**: Credentials at rest remain protected; no long-lived Discord or API tokens in logs.
- **Acceptance Criteria**:
  - Stored credentials (tokens or session material) use existing DPAPI-backed storage or equivalent; no plaintext long-lived secrets on disk.
  - Logs and diagnostics do not include raw access tokens, refresh tokens, or session secrets.

#### NFR-002: Reliability
- **Priority**: P1 (High)
- **Description**: Refresh or re-auth flow must be well-defined so users are not stuck in a broken state.
- **Acceptance Criteria**:
  - If refresh fails (e.g. refresh token revoked), the user is prompted to log in again rather than failing silently.
  - Network errors during refresh are handled with retry or clear user feedback.

## Technical Constraints

- Must work with existing Discord OAuth (ADR-002, ADR-003), SimHub plugin (C#/.NET Framework 4.8, DPAPI), and Worker/D1/KV.
- No change to "one codebase, one config" (ADR-007 Dev/Cloud Parity).
- Only supported SimHub path: `C:\Program Files (x86)\SimHub\`; no other install locations.

## Out of Scope

- Exact token format and refresh algorithm (HLD/Tech Plan).
- Changes to Discord application configuration beyond what is needed for refresh (if any).
- "Remember me" UX copy and A/B tests (can be a follow-up).

## Dependencies

- [Phase 1 MVP Scope](../phase-1-mvp-scope.md)
- [SimHub Plugin POC PRD](../simhub-plugin-poc/001-simhub-plugin-poc.md)
- [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md)
- [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md)
- [Discord Integration LLD](../../design/integrations/discord-integration.md)
- [API plugin spec](../../api/plugin.md)

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Storing long-lived or refresh tokens on the client | High | Medium | DPAPI protection; minimal scope stored; rate limiting and audit on refresh endpoint |
| Refresh flow abuse (token theft, replay) | High | Low | Rate limiting on server; short-lived access tokens; revocation support |
| Discord refresh token revocation | Medium | Medium | Clear "session expired" UX; prompt user to log in again |

## Success Metrics

- **Session longevity**: Percentage of users who open SimHub multiple times within the extended period without re-authenticating (target: high retention of "still logged in" state).
- **Re-auth rate**: Reduction in re-auth events per user per week after long-lived tokens are implemented.
- **Security**: No credentials in logs; revocation and logout work as specified.

## Related Documentation

- [Phase 1 MVP Scope](../phase-1-mvp-scope.md)
- [SimHub Plugin POC](../simhub-plugin-poc/001-simhub-plugin-poc.md)
- [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md)
- [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md)
- [Discord Integration LLD](../../design/integrations/discord-integration.md)
- [API plugin](../../api/plugin.md)
- Technical Plan for long-lived tokens (to be created after PRD approval)
- [Documentation Standards](../../standards/documentation-standards.md)
