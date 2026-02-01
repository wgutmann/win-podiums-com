# PRD-001: SimHub Plugin POC

**Doc type**: PRD | **ID**: PRD-001 | **Related**: [Phase 1 MVP Scope](../phase-1-mvp-scope.md), [SimHub Plugin LLD](../../design/components/simhub-plugin.md), [API plugin](../../api/plugin.md), [ADR-002](../../architecture/decisions/002-discord-oauth.md), [ADR-003](../../architecture/decisions/003-hybrid-auth-paths.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Product / Engineering  
**Related**: [Phase 1 MVP Scope](../phase-1-mvp-scope.md), [SimHub Plugin LLD](../../design/components/simhub-plugin.md), [API plugin](../../api/plugin.md), [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md), [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md)

## Overview

### Problem Statement

Before investing in the full telemetry-proof system and Scrutineering Panel UI, we need to validate that a SimHub plugin can integrate with the WinPodiums API and Discord auth. Without a proof-of-concept, we risk building architecture that does not load correctly in SimHub or that cannot complete the auth and verification flow end-to-end.

### Solution

Deliver a minimal SimHub plugin (POC) that proves: (1) the plugin loads and runs inside SimHub, (2) a user can authenticate via browser-based OAuth (PKCE) and store credentials securely (DPAPI), and (3) the plugin can perform at least one verification API call (heartbeat). A **minimal SimHub UI** is in scope so a user can complete auth and heartbeat without touching code (e.g. “Link to Discord”, “Send heartbeat”, and status). POC scope is auth + one API call only; position detection is a separate follow-up. Manual token is **not** a primary auth option: it is a **debugging-only** feature, available only when a feature flag is enabled. The POC defers full Scrutineering Panel UI, QR auth in plugin (optional follow-up), race submission, and all telemetry-proof layers.

### Success Criteria

- At least one user can complete the flow **from the SimHub UI only** (no code changes): authenticate via “Link to Discord” (browser PKCE) → store credentials → trigger “Send heartbeat” → see status (success/failure).
- Plugin builds and loads in SimHub; **SimHub SDK wiring is required for POC complete**. “Loads in SimHub” means the plugin **appears in SimHub’s plugin list/settings and is usable from the SimHub UI** (not only that the DLL loads without crash).
- API base URL is configurable (e.g. `http://localhost:8787` for local dev).
- Manual token auth is only exposed when a feature flag (e.g. debug mode) is on; it is not a user-facing auth option.
- POC learnings are captured for Phase 1 and future tech plans.

## User Stories

### As a Sim Racer (early adopter)
- I want to link my plugin to Discord by signing in with Discord in a browser (launched from the plugin), so I can verify my identity without copying tokens.
- I want to see that the plugin has successfully called the API (e.g. heartbeat), so I know the connection works.

### As a Developer
- I want the plugin to use the same API contract as the Worker (auth + heartbeat), so we can validate the contract before building more features.
- I want to run the plugin against a local API (configurable base URL), so I can develop and test without production.

### As a Maintainer
- I want the POC scope to be explicitly documented, so we avoid scope creep into full UI or telemetry-proof features until the POC is validated.

## Requirements

### Functional Requirements

#### FR-001: Browser-Based Authentication (PKCE)
- **Priority**: P0 (Critical)
- **Description**: Plugin must support authenticating via browser-launched Discord OAuth (PKCE): plugin opens browser, user signs in with Discord, callback returns to plugin, plugin exchanges code for tokens and stores them with DPAPI.
- **Acceptance Criteria**:
  - Plugin can launch the system browser with the Discord OAuth URL (PKCE code challenge in URL).
  - Plugin receives the auth code via loopback redirect (or equivalent) and exchanges it with the API (`POST /api/auth/discord/exchange` or equivalent).
  - Access token and Discord ID are stored with DPAPI (user-scoped) and used for subsequent API calls (e.g. heartbeat).

#### FR-001b: Manual Token (Debug Only, Feature-Flagged)
- **Priority**: P2 (Low) — debugging only
- **Description**: Manual token auth must not be a primary or user-facing option. It may be implemented only as a debugging feature, available only when a feature flag (e.g. debug mode) is enabled.
- **Acceptance Criteria**:
  - If manual token flow exists, it is hidden from normal users and only available when a feature flag is on (e.g. build flag, config, or debug menu).
  - Documentation and UI do not present manual token as a recommended or primary auth method.

#### FR-002: One Verification API Call
- **Priority**: P0 (Critical)
- **Description**: Plugin must perform at least one verification API call (heartbeat) using the stored Bearer token.
- **Acceptance Criteria**:
  - Plugin can call the heartbeat endpoint with `Authorization: Bearer {token}`.
  - Success/failure is observable (e.g. log or minimal status) so we can confirm end-to-end flow.
  - API contract aligns with [API plugin spec](../../api/plugin.md) (POST `/api/plugin/heartbeat`).

#### FR-003: Configurable API Base URL
- **Priority**: P1 (High)
- **Description**: API base URL must be configurable so the plugin can target local (e.g. `http://localhost:8787`) or production.
- **Acceptance Criteria**:
  - Base URL can be set (e.g. via `SetApiBaseUrl` or config) without recompiling.
  - All API calls use this base URL.

#### FR-004: Minimal SimHub UI
- **Priority**: P0 (Critical)
- **Description**: A minimal UI must be available in SimHub so a user can complete auth and heartbeat without editing code or running scripts.
- **Acceptance Criteria**:
  - User can trigger **“Link to Discord”** (or equivalent) from the plugin UI; this launches the browser PKCE flow and, on success, stores credentials and shows linked status.
  - User can trigger **“Send heartbeat”** (or equivalent) from the plugin UI; this sends one heartbeat to the API and shows success or failure.
  - **Status** is visible (e.g. “Linked” / “Not linked”, “Heartbeat OK” / “Heartbeat failed” or last result) so the user can confirm the flow without consulting logs.
  - Full Scrutineering Panel and design polish are out of scope; this is minimal controls and status only.

### Non-Functional Requirements

#### NFR-001: Platform and Runtime
- **Priority**: P0 (Critical)
- **Description**: Plugin must run on .NET Framework 4.8 and load within SimHub on Windows. SimHub SDK wiring and successful load in SimHub are required for POC complete.
- **Acceptance Criteria**:
  - Plugin builds as a class library targeting .NET Framework 4.8.
  - SimHub SDK is referenced and plugin entry point implements the SimHub plugin interface (e.g. IPlugin / IDataPlugin as required by the SDK).
  - **“Loads in SimHub”** means the plugin **appears in SimHub’s plugin list/settings and is usable from the SimHub UI** (user can see and interact with the plugin in SimHub), not only that the DLL loads without crash.

#### NFR-002: No Secrets in Repository
- **Priority**: P0 (Critical)
- **Description**: No credentials, client secrets, or long-lived tokens are committed to the repository.
- **Acceptance Criteria**:
  - Tokens are stored only in DPAPI-protected local storage or provided at runtime.
  - No `.env`, `.dev.vars`, or equivalent with secrets in version control.

#### NFR-003: Testing (POC Minimum)
- **Priority**: P1 (High)
- **Description**: POC is considered done when manual E2E passes and a minimum set of automated tests gives regression coverage on the plugin–API contract.
- **Acceptance Criteria**:
  - **Manual E2E**: At least one full run from the SimHub UI only: build plugin → install in SimHub → plugin appears in SimHub UI → use “Link to Discord” (browser PKCE) → use “Send heartbeat” → see status. Documented in development guide or next-steps.
  - **Automated tests (minimum)**: Unit tests for the API client (e.g. token exchange, heartbeat) against a mock or stub so request/response contract is regression-tested. Optionally unit tests for token storage (round-trip with DPAPI or mock). Integration test against a real local Worker is optional for POC (can be Phase 1.1 or tech plan follow-up).
  - Tests run in CI or pre-push where applicable; no requirement for full SimHub-in-CI for POC.

## Technical Constraints

- **SimHub SDK**: Required for POC complete. Plugin must reference the SimHub SDK and implement the plugin interface so it loads in SimHub; POC does not implement position detection or telemetry logic (those are separate follow-ups).
- **.NET Framework 4.8**: Required for SimHub compatibility; no .NET Core–only APIs.
- **Windows**: SimHub runs on Windows; DPAPI and plugin path assumptions are Windows-specific.
- **API contract**: Must align with [docs/api/plugin.md](../../api/plugin.md) and OpenAPI spec for auth and heartbeat.

## Out of Scope

- Full Scrutineering Panel UI and design polish (deferred to post-POC). Minimal UI (Link to Discord, Send heartbeat, status) is in scope for POC.
- QR code auth in the plugin (optional follow-up; browser auth is primary for POC).
- Race result submission and HMAC-signed payloads (deferred).
- **Manual token as primary auth**: Manual token is debug-only, feature-flagged; not a user-facing option.
- Full Telemetry Proof system (heartbeat validation, continuity, challenge-response per PRDs 001–005).
- Installer, auto-updater, and distribution (manual copy to SimHub Plugins folder for POC).
- **Position detection**: Out of scope for POC (separate follow-up). POC = auth + one API call only.

## Dependencies

- **Phase 1 Worker**: Auth endpoints for plugin PKCE exchange (`POST /api/auth/discord/exchange`), optional token-exchange for debug, and heartbeat endpoint available.
- **Discord OAuth**: Discord app configured for OAuth; redirect URI for plugin loopback (e.g. `http://127.0.0.1:{port}/callback`) allowed where used.
- **SimHub Plugin LLD**: [SimHub Plugin LLD](../../design/components/simhub-plugin.md) describes target architecture; POC implements the minimal subset.

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| SimHub SDK not available or version mismatch | High | Low | Document SDK path and version; POC complete is blocked until plugin loads in SimHub |
| API contract drift between Worker and plugin | Medium | Medium | Align on OpenAPI and plugin.md; run API tests against Worker |
| POC scope creep (full UI, QR, race submission) | Medium | Medium | Keep this PRD as single source of truth; defer items to post-POC PRDs/tech plans |

## Success Metrics

- **Flow completion**: At least one user completes the flow from the SimHub UI only (Link to Discord → Send heartbeat → see status), without touching code.
- **Plugin load**: Plugin builds, references SimHub SDK, and appears in SimHub’s plugin list/settings and is usable from the SimHub UI (required for POC complete).
- **Learnings**: POC outcomes and any blockers are documented (e.g. in Phase 1 retrospective or next-steps) to inform full plugin and telemetry-proof work.

## Related Documentation

- [Phase 1 MVP Scope](../phase-1-mvp-scope.md) — POC is part of Phase 1 “Basic SimHub plugin”
- [SimHub Plugin LLD](../../design/components/simhub-plugin.md) — Plugin structure, auth flows, API client
- [API plugin](../../api/plugin.md) — Auth and heartbeat endpoints
- [ADR-002 Discord OAuth](../../architecture/decisions/002-discord-oauth.md) — Discord as identity provider
- [ADR-003 Hybrid Auth](../../architecture/decisions/003-hybrid-auth-paths.md) — Web and plugin auth paths
- [Documentation Standards](../../standards/documentation-standards.md)
