# WinPodiums SimHub Plugin

**Status**: Minimal scaffold (Phase 1)  
**Technology**: C# / .NET Framework 4.8

## Overview

SimHub plugin for WinPodiums: monitors telemetry, detects podium finishes, and submits verified results to the API. Phase 1 scope: position detection deferred; minimal auth (browser primary; manual token **debug-only, feature-flagged**), one verification API call (heartbeat).

## Layout

- `WinPodiums.Plugin/` — Main class library
  - `Core/PluginMain.cs` — Entry point; browser auth (PKCE) + heartbeat (SimHub SDK interfaces when reference added); manual token only when debug flag on
  - `Auth/TokenStorage.cs` — DPAPI-protected storage for access token and Discord ID
  - `Services/ApiClient.cs` — API client: PKCE exchange, token exchange (debug), heartbeat

## Prerequisites

- .NET Framework 4.8
- SimHub installed (for SDK reference and testing)

## Build

1. Add reference to SimHub plugin SDK/assemblies from the SimHub install directory: `C:\Program Files (x86)\SimHub` (see [SimHub Plugin LLD](../../docs/design/components/simhub-plugin.md)).
2. From this directory: `dotnet build WinPodiums.Plugin/WinPodiums.Plugin.csproj`
3. Deploy the built DLL to `C:\Program Files (x86)\SimHub\Plugins` and restart SimHub. (Official SimHub docs sometimes refer to the install root; this repo uses the Plugins subfolder unless your SimHub version requires otherwise.)

## Phase 1: browser auth (PKCE) + heartbeat

1. **Primary auth**: In plugin, use browser (PKCE) flow: plugin opens browser → user signs in with Discord → callback returns to plugin → plugin exchanges code and stores tokens with DPAPI.
2. **Heartbeat**: Call `SendHeartbeatAsync(pluginVersion)` to send one verification flow; uses stored Bearer token.

**Debug only** (feature-flagged): When manual token is enabled (e.g. debug mode), get a token from https://winpodiums.com (or http://localhost:8787) at `/auth/token`, then in plugin call `AuthenticateWithManualTokenAsync(tokenCode)`. Do not expose as a user-facing option.

```csharp
var plugin = new PluginMain();
plugin.Init();
plugin.SetApiBaseUrl("http://localhost:8787");  // or https://winpodiums.com
// Primary: browser (PKCE). Debug-only: AuthenticateWithManualTokenAsync("AB12CD34") when flag on.
bool ok = await plugin.AuthenticateWithBrowserAsync();  // or AuthenticateWithManualTokenAsync(token) if debug
if (ok) await plugin.SendHeartbeatAsync("1.0.0");
```

## Development

- Build and run on Windows host (no Docker for plugin yet).
- API base URL configurable via `SetApiBaseUrl` (e.g. `http://localhost:8787` when using Docker for the API).

## Related

- [SimHub Plugin LLD](../../docs/design/components/simhub-plugin.md)
- [Discord Integration LLD](../../docs/design/integrations/discord-integration.md)
- [Phase 1 scope](../../docs/product/phase-1-mvp-scope.md)
