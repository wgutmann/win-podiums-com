# ADR-002: Discord OAuth as Sole Identity Provider

**Doc type**: ADR | **ID**: ADR-002 | **Related**: [Phase 1 scope](../../product/phase-1-mvp-scope.md), [HLD](../high-level-design.md), [ADR-001](001-cloudflare-stack.md), [ADR-003 Hybrid Auth](003-hybrid-auth-paths.md), [Discord Integration LLD](../../design/integrations/discord-integration.md), [API README](../../api/README.md)

**Status**: Accepted  
**Date**: 2026-01-31  
**Deciders**: Architecture Team

## Context

WinPodiums needs user authentication to link racing achievements to identities. Requirements:
- No password management (security burden)
- Integration with sim racing community infrastructure
- Support for both web and desktop plugin authentication
- Minimal friction for target audience (sim racers)

## Decision

We will use **Discord OAuth2** as the **sole identity provider**, with no alternative authentication methods (no email/password, no other social logins).

## Rationale

### Why Discord
1. **Community alignment**: Target audience (sim racers) already use Discord heavily for league coordination
2. **Zero password management**: Delegate authentication to Discord, eliminating credential storage risks
3. **OAuth2 standard**: Well-documented protocol with existing libraries
4. **Future integration**: Natural path to Discord bot features (role assignment, notifications) in Phase 3
5. **Desktop support**: OAuth2 works for both web and desktop applications (PKCE for desktop)

### Why Sole Provider
1. **Simplicity**: Single authentication flow to test and maintain
2. **Brand consistency**: Aligns with "exclusive community" positioning
3. **Reduced attack surface**: Fewer authentication paths = fewer vulnerabilities
4. **Cost**: No authentication service fees (Auth0, Cognito, etc.)

## Consequences

### Positive
- Zero password management burden (no storage, no reset flows, no breach risk)
- Leverages existing user accounts (no new credential creation friction)
- Natural integration with Discord community features (Phase 3)
- Simple authentication codebase (one flow vs. multiple providers)

### Negative
- **Account lock-out risk**: If user loses Discord account access, they lose WinPodiums access
- **Discord dependency**: If Discord OAuth is down, authentication is blocked
- **Privacy concerns**: Discord knows which users authenticate to WinPodiums (acceptable per their API ToS)
- **Limited market**: Users without Discord accounts must create one (barrier to entry)

### Neutral
- Users must trust Discord with their identity (already trusted by sim racing community)
- Requires compliance with Discord's API Terms of Service and rate limits

## Mitigation Strategies

1. **Account recovery**: Provide clear documentation on Discord account recovery process
2. **Discord outages**: Implement graceful degradation; show status page when Discord API is down
3. **Rate limits**: Cache user data; implement request queuing to stay within Discord limits
4. **Privacy**: Transparent disclosure in Terms of Service about Discord data sharing
5. **Market limitation**: Accept as trade-off; target audience already has Discord accounts

## Implementation Details

- **Web authentication**: Standard OAuth2 Authorization Code flow
- **Plugin authentication**: 
  - Authorization Code + PKCE (no client secret in desktop app)
  - Three methods supported: Browser launch, QR code, manual token
- **Scopes**: Minimal `identify` scope only (Discord ID + username)
- **Token storage**: 
  - Web: HTTP-only, Secure, SameSite cookies
  - Plugin: Windows DPAPI encryption

## Alternatives Considered

### Email/Password Authentication
- **Pros**: No external dependency, full control
- **Cons**: Password management burden, security risks, user friction (account creation)

### Multi-Provider (Discord + Google + GitHub)
- **Pros**: Wider market reach, fallback options
- **Cons**: Increased complexity, more attack surface, dilutes "exclusive" brand positioning

### Auth0 / Cognito
- **Pros**: Managed service, multiple providers supported
- **Cons**: Monthly fees, still requires external identity provider, adds infrastructure complexity

### Magic Links (Email-based)
- **Pros**: Passwordless, simple UX
- **Cons**: Email deliverability issues, requires email storage, slower authentication flow

## Related

- [ADR-001: Cloudflare Stack](001-cloudflare-stack.md) — Hosting stack
- [ADR-003: Hybrid Auth Paths](003-hybrid-auth-paths.md) — Web-first vs plugin-first
- [Phase 1 scope](../../product/phase-1-mvp-scope.md) — MVP deliverables
- [Discord Integration LLD](../../design/integrations/discord-integration.md) — OAuth flows and plugin methods
- [API README](../../api/README.md) — Auth endpoints

## References

- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
- [OAuth 2.0 for Native Apps (RFC 8252)](https://datatracker.ietf.org/doc/html/rfc8252)
- [PKCE (RFC 7636)](https://datatracker.ietf.org/doc/html/rfc7636)
