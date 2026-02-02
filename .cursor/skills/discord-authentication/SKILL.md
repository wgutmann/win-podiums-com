---
name: discord-authentication
description: Implements Discord authentication for SimHub plugins in C#/.NET Framework 4.8 (WPF). Use when the user mentions Discord auth, OAuth2, login, tokens, scopes, redirect URI, Discord developer portal, or "log in with Discord"; prioritize least-privilege access.
---

# Discord Authentication (SimHub / C# WPF)

## Quick Start

Default to OAuth2 Authorization Code with PKCE for desktop plugins. Use the system browser, a loopback redirect URI, and minimal scopes.

## Implementation Checklist (Least Privilege)

- [ ] Confirm required features and map to the **minimum** Discord scopes.
- [ ] Create/locate the Discord application in the developer portal.
- [ ] Configure redirect URIs for loopback (e.g., `http://127.0.0.1:{PORT}/callback`).
- [ ] Choose flow:
  - Public client (desktop): Authorization Code + PKCE (no client secret)
  - Confidential client (if applicable): Authorization Code with client secret
- [ ] Generate PKCE `code_verifier` and `code_challenge` (S256).
- [ ] Generate a cryptographically strong `state` value.
- [ ] Launch the system browser to the Discord authorize URL.
- [ ] Run a local HTTP listener to receive the redirect and extract `code` + `state`.
- [ ] Validate `state` before exchanging the code.
- [ ] Exchange `code` for tokens using `HttpClient`.
- [ ] Store tokens securely using Windows DPAPI (`ProtectedData`).
- [ ] Implement refresh token flow and token expiry checks.
- [ ] Add logout flow (revoke tokens and clear local storage).
- [ ] Log authentication failures with safe, non-sensitive messages.

## Scope Guidance

Only request what the plugin truly needs. Prefer `identify` alone unless you need more:

- `identify`: basic user identity
- `guilds`: list of user guilds
- `email`: only if email is a strict requirement
- `connections`: only if you must access linked accounts

## Security Guardrails

- Never embed a client secret in a desktop plugin.
- Prefer system browser over embedded web views.
- Use PKCE S256; do not use plain challenge method.
- Use a short-lived, random port for loopback redirect.
- Use HTTPS for non-loopback redirects.
- Protect tokens at rest with DPAPI and keep them out of logs.
- Avoid long-lived refresh tokens if they are not required.

## Troubleshooting Workflow

- If redirect never arrives, confirm the listener is running and the redirect URI matches exactly.
- If token exchange fails, verify `code_verifier`, `redirect_uri`, and client ID.
- If the user is repeatedly prompted, check refresh flow and token expiry.

## Bot Token Flow (Separate from User OAuth2)

Use **user OAuth2** when the plugin acts on behalf of a signed-in user (e.g. "Log in with Discord"). Use a **bot token** when the plugin acts as a bot (e.g. posting to a channel, managing a server). Do not mix the two: different identity, different permissions, different storage.

**When to use bot token:** User asks for "bot", "post to Discord", "send messages as a bot", or server/channel management without a user login.

**Bot token checklist:**

- [ ] Create or use an existing application in the Discord Developer Portal.
- [ ] In the application, open **Bot** and create a bot (or copy the existing token).
- [ ] Copy the bot token once; treat it as a secret (like a password).
- [ ] Store the token securely (e.g. DPAPI, user config); never embed in source or expose to the client.
- [ ] Call the Discord API with `Authorization: Bot <token>` (not Bearer).
- [ ] Request only the bot permissions the plugin needs (invite URL / OAuth2 URL with `bot` scope and minimal permissions).
- [ ] Isolate bot token storage and usage from user OAuth2 tokens; use separate config/key names.

## ContextStream (when available)

- Before adding or changing auth code, use ContextStream `search` (mode=hybrid) for "Discord OAuth", "token exchange", "PKCE", "plugin auth" to find existing flows in `apps/api/` and `apps/plugin/`. After auth-related decisions (e.g. scopes, PKCE, redirect URI), capture in ContextStream (event_type=decision) with path to Worker or plugin file.

## Additional Notes

- Always confirm current Discord OAuth2 endpoints and required parameters in the official docs.

## SimHub path (this repo)

The only SimHub path this repo supports is `C:\Program Files (x86)\SimHub\`. Use it everywhere:

- **SimHub install root**: `C:\Program Files (x86)\SimHub`
- **Plugins folder**: `C:\Program Files (x86)\SimHub\Plugins`

Do not use placeholders (e.g. `SIMHUB_INSTALL_DIR`), env overrides, or other install locations in repo docs and skills.

## Additional Resources

- Minimal C# snippets: `examples.md`
