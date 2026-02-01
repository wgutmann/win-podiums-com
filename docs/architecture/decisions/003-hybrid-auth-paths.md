# ADR-003: Hybrid Authentication Paths (Web-First vs Plugin-First)

**Doc type**: ADR | **ID**: ADR-003 | **Related**: [Phase 1 scope](../../product/phase-1-mvp-scope.md), [HLD](../high-level-design.md), [ADR-002 Discord OAuth](002-discord-oauth.md), [Discord Integration LLD](../../design/integrations/discord-integration.md), [SimHub Plugin LLD](../../design/components/simhub-plugin.md), [API README](../../api/README.md)

**Status**: Accepted  
**Date**: 2026-01-31  
**Deciders**: Architecture Team, UX Lead

## Context

WinPodiums requires authentication to link Discord identity with racing telemetry. Two competing UX philosophies emerged:

1. **Web-First (Ceremonial)**: Authenticate on website → Download pre-linked plugin → Race
2. **Plugin-First (Exploratory)**: Download plugin anonymously → Race → Authenticate in plugin when ready

Each has trade-offs between brand ceremony and user friction.

## Decision

We will support **BOTH authentication paths** as a hybrid architecture, allowing users to choose their entry point.

## Rationale

### Why Hybrid (Not One Path)

**Path A: Web-First (Ceremonial Entry)**
- **Strength**: Reinforces luxury brand positioning; "Accept Your Invitation" ceremony creates emotional connection
- **Strength**: Pre-linked plugin provides seamless setup (Discord ID embedded in installer)
- **Weakness**: Higher friction; users must commit to authentication before trying the plugin
- **Weakness**: Doesn't allow "try before you buy" exploration

**Path B: Plugin-First (Try-Before-Commit)**
- **Strength**: Lower barrier to entry; users can download and explore plugin features first
- **Strength**: Flexible authentication timing; users authenticate when they're ready
- **Weakness**: Dilutes ceremonial brand experience
- **Weakness**: More complex plugin UI (must handle unauthenticated state)

**Hybrid Approach Benefits**:
1. **Best of both worlds**: Returning members get ceremony (Path A), new users get flexibility (Path B)
2. **Conversion optimization**: Can A/B test which path drives higher activation rates
3. **User choice**: Respects different user preferences and use cases
4. **Fallback**: If one path has issues (e.g., web auth down), other path still works

### Plugin Authentication Methods

To support Path B effectively, the plugin offers **three authentication methods**:

1. **Browser Launch** (Primary for desktop users)
   - Opens system browser for Discord OAuth
   - Loopback listener captures authorization code
   - Best UX for desktop-only workflows

2. **QR Code** (Modern, mobile-friendly)
   - Plugin displays QR code
   - User scans with phone, completes auth on mobile
   - Plugin polls API for token delivery
   - Premium/modern feel; supports multi-device users

3. **Manual Token** (Fallback for troubleshooting)
   - User gets one-time token from website
   - Copies token into plugin input field
   - Useful for firewall issues, corporate networks

## Consequences

### Positive
- **Maximized conversion**: Both high-ceremony and low-friction paths supported
- **User flexibility**: Users can choose entry path that fits their context
- **Resilience**: Fallback options if one path has technical issues
- **A/B testing**: Can measure which path drives better long-term engagement
- **Premium UX**: QR code method provides modern, luxury feel

### Negative
- **Increased complexity**: Must maintain two distinct authentication workflows
- **Plugin complexity**: Plugin must handle unauthenticated state gracefully
- **Testing burden**: Must test all authentication paths (web + 3 plugin methods)
- **Analytics complexity**: Must track conversion funnels for both paths separately

### Neutral
- **Brand positioning**: Hybrid approach may slightly dilute pure "invitation only" messaging (acceptable trade-off)
- **Documentation**: Requires clear guidance on when to use each path

## Implementation Details

### Path Detection
- Website landing page shows both CTAs: "Claim Your Invitation" (Path A) and "Download Plugin" (Path B)
- Plugin first-launch flow detects authentication state:
  - If pre-linked (Path A): Instant recognition, show welcome message with username
  - If anonymous (Path B): Show authentication UI with method selection

### Plugin Authentication UI
```
[Unauthenticated State]
├─ "Link to Discord" button → Method selection screen
│   ├─ [Browser Launch] → Opens system browser
│   ├─ [QR Code] → Displays QR, starts polling
│   └─ [Manual Token] → Shows token input field + link to website

[Authenticated State]
├─ Welcome message with Discord username
├─ "Scrutineering Panel" shows auth status: ✓ Linked to @DriverName
└─ Telemetry monitoring active
```

### Data Tracking
- Track `authMethod` field in User table: `web`, `plugin_browser`, `plugin_qr`, `plugin_token`
- Analytics: Measure activation rate by auth path and method

## Mitigation Strategies

1. **Complexity**: Use shared authentication primitives (PKCE generation, token storage) across all methods
2. **Testing**: Automated E2E tests for each path; manual QA checklist
3. **Brand dilution**: Ensure both paths still reinforce merit-based verification (authentication ≠ verification)
4. **Documentation**: Clear user documentation explaining both paths; video tutorials

## Success Criteria

- Both paths achieve >90% authentication success rate
- Plugin gracefully handles all three auth methods with <5% user-reported issues
- Path A users report high brand satisfaction (>8/10 "luxury" perception)
- Path B users have higher initial exploration rates (>70% plugin usage pre-auth)

## Alternatives Considered

### Web-First Only
- **Pros**: Simpler codebase, stronger brand ceremony
- **Cons**: Higher friction, no "try before auth" option, loses flexible users

### Plugin-First Only
- **Pros**: Lower friction, simpler plugin UX (always authenticated)
- **Cons**: Loses ceremonial brand experience, harder to track pre-install conversions

### Mandatory Authentication at Plugin Launch
- **Pros**: Ensures all plugin users are authenticated
- **Cons**: Blocks exploration, increases abandonment rate for curious users

## Related

- [ADR-002: Discord OAuth](002-discord-oauth.md) — Sole identity provider
- [Phase 1 scope](../../product/phase-1-mvp-scope.md) — MVP deliverables
- [Discord Integration LLD](../../design/integrations/discord-integration.md) — OAuth flows
- [SimHub Plugin LLD](../../design/components/simhub-plugin.md) — Plugin auth and API client
- [API README](../../api/README.md) — Auth endpoints

## References

- [OAuth 2.0 for Native Apps (RFC 8252)](https://datatracker.ietf.org/doc/html/rfc8252)
