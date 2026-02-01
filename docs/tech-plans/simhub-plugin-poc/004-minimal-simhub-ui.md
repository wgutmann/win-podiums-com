# TP-SPOC-004: Minimal SimHub UI

**Doc type**: Technical Plan | **ID**: TP-SPOC-004 | **Implements**: [PRD-001: SimHub Plugin POC](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md) | **Related**: [SimHub Plugin LLD](../../design/components/simhub-plugin.md), [API plugin](../../api/plugin.md), [001: Plugin Skeleton](001-plugin-skeleton-sdk-config.md), [002: Auth (PKCE, Token Storage)](002-auth-pkce-token-storage.md), [003: API Client and Heartbeat](003-api-client-heartbeat.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Development Team

## Overview

This Technical Plan implements the minimal SimHub UI required for the POC (FR-004): user can trigger “Link to Discord” and “Send heartbeat” from the plugin UI and see status (Linked/Not linked, Heartbeat OK/failed or last result). Full Scrutineering Panel and design polish are out of scope.

## Architecture

### Component Diagram

```mermaid
flowchart LR
    User[User] --> SimHubUI[SimHub Plugin UI]
    SimHubUI --> LinkBtn["Link to Discord"]
    SimHubUI --> HeartbeatBtn["Send heartbeat"]
    SimHubUI --> Status[Status display]
    LinkBtn -->|Triggers| PKCE[Browser PKCE flow]
    HeartbeatBtn -->|Calls| ApiClient[ApiClient heartbeat]
    Status -->|Shows| AuthStatus[Linked / Not linked]
    Status -->|Shows| HeartbeatStatus[Heartbeat OK / failed or last result]
```

### Data Flow

1. **Link to Discord**: User clicks “Link to Discord” (or equivalent). Plugin starts browser PKCE flow per [002: Auth (PKCE, Token Storage)](002-auth-pkce-token-storage.md). On success, UI shows “Linked” (and optionally Discord ID or username). On failure, show error or “Not linked”.
2. **Send heartbeat**: User clicks “Send heartbeat” (or equivalent). Plugin calls API client heartbeat per [003: API Client and Heartbeat](003-api-client-heartbeat.md). UI shows “Heartbeat OK” on success or “Heartbeat failed” / last error on failure.
3. **Status**: UI always shows auth status (Linked / Not linked) and last heartbeat result (Heartbeat OK / Heartbeat failed or last result) so the user can confirm the flow without consulting logs.

## Implementation Details

### UI Elements (Minimal)

- **Link to Discord**: Button or action that starts the browser PKCE flow. Visible when not authenticated; after success, replace with “Linked” (and optionally “Unlink” or “Logout”).
- **Send heartbeat**: Button or action that sends one heartbeat to the API. Enabled when authenticated (optional: disable when not linked). On click, call heartbeat; update status on success/failure.
- **Status**:
  - Auth: “Linked” or “Not linked” (and optionally Discord ID).
  - Heartbeat: “Heartbeat OK”, “Heartbeat failed”, or last result message (e.g. “Last heartbeat: OK” / “Last heartbeat: Unauthorized”).

### SimHub UI Integration

- **Surfaces**: Plugin must appear in SimHub’s plugin list/settings and be usable from the SimHub UI (per NFR-001). Use SimHub SDK UI hooks (e.g. properties, actions, or settings panel) as required by the SDK so the plugin is discoverable and the above controls are accessible.
- **Technology**: WPF or SimHub-supported UI mechanism per [SimHub Plugin LLD](../../design/components/simhub-plugin.md). POC: minimal controls and status only; no full Scrutineering Panel layout or polish.

### Out of Scope

- Full Scrutineering Panel UI, design polish, telemetry monitoring display, race submission UI, position detection UI, installer/updater UI.

### Error Handling

- PKCE failure: Show “Link failed” or error message; keep “Link to Discord” available.
- Heartbeat failure: Show “Heartbeat failed” and optionally last error; keep “Send heartbeat” available for retry.
- No modal blocking the whole plugin; status updates in place.

## Testing Strategy

- **Manual**: From SimHub UI only: open plugin → see “Link to Discord” and status “Not linked” → click Link → complete browser auth → see “Linked” → click “Send heartbeat” → see “Heartbeat OK” (or failure if API down). Document in development guide or next-steps.
- **Unit** (optional): View model or presenter logic for button states and status text given auth/heartbeat results.

## Deployment

- No extra deployment; UI is part of plugin DLL. Ensure SimHub SDK UI wiring is documented for “appears in SimHub UI”.

## Performance Considerations

- UI must remain responsive; auth and heartbeat run async and update status when complete. No long blocking on main thread.

## Security Considerations

- Do not display access token or sensitive data in UI. Show only “Linked”, Discord ID if desired, and heartbeat success/failure.

## Dependencies

- **Internal**: [001: Plugin Skeleton](001-plugin-skeleton-sdk-config.md) (plugin load, config), [002: Auth (PKCE, Token Storage)](002-auth-pkce-token-storage.md) (Link to Discord), [003: API Client and Heartbeat](003-api-client-heartbeat.md) (Send heartbeat).
- **SimHub SDK**: UI integration (properties/actions/settings) so plugin is visible and usable in SimHub.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| SimHub UI API differs or is undocumented | Use SimHub SDK docs and existing plugin examples; POC scope is minimal controls only. |

## Success Criteria

- User can trigger “Link to Discord” from the plugin UI; browser PKCE flow runs; on success, linked status is shown.
- User can trigger “Send heartbeat” from the plugin UI; heartbeat is sent; success or failure is shown.
- Status is visible (Linked/Not linked, Heartbeat OK/failed or last result) so the user can confirm the flow without consulting logs.
- Plugin appears in SimHub’s plugin list/settings and is usable from the SimHub UI.

## Related Documentation

- [PRD-001: SimHub Plugin POC](../../product/simhub-plugin-poc/001-simhub-plugin-poc.md)
- [SimHub Plugin LLD](../../design/components/simhub-plugin.md)
- [001: Plugin Skeleton](001-plugin-skeleton-sdk-config.md)
- [002: Auth (PKCE, Token Storage)](002-auth-pkce-token-storage.md)
- [003: API Client and Heartbeat](003-api-client-heartbeat.md)
- [Documentation Standards](../../standards/documentation-standards.md)
