# WinPodiums SimHub Plugin

**Status**: Minimal scaffold (Phase 1)  
**Technology**: C# / .NET Framework 4.8

## Overview

SimHub plugin for WinPodiums: monitors telemetry, detects podium finishes, and submits verified results to the API. Phase 1 scope: position detection deferred; minimal auth (browser primary; manual token **debug-only, feature-flagged**), one verification API call (heartbeat).

**How to install:** Build the plugin, copy `WinPodiums.Plugin.dll` to SimHub's Plugins folder, then restart SimHub. See [Installation](#installation) below for the full steps.

## Layout

- `WinPodiums.Plugin/` — Main class library
  - `Core/PluginMain.cs` — Entry point; implements SimHub `IPlugin` and `IDataPlugin` (Init, DataUpdate, End); browser auth (PKCE) + heartbeat; manual token only when debug flag on
  - `Auth/TokenStorage.cs` — DPAPI-protected storage for access token and Discord ID
  - `Services/ApiClient.cs` — API client: PKCE exchange, token exchange (debug), heartbeat

## Prerequisites

- .NET Framework 4.8
- SimHub installed at `C:\Program Files (x86)\SimHub` (the only path this repo supports) — required for SDK reference at build and for running the plugin

## Build

1. The project references SimHub SDK from `C:\Program Files (x86)\SimHub`: `SimHub.Plugins.dll` and `GameReaderCommon.dll` (the only SimHub path this repo supports).
2. From repo root: `dotnet build apps/plugin/WinPodiums.Plugin/WinPodiums.Plugin.csproj --configuration Release`  
   Or from this directory: `dotnet build WinPodiums.Plugin/WinPodiums.Plugin.csproj --configuration Release`
3. Output: `WinPodiums.Plugin/bin/Release/net48/WinPodiums.Plugin.dll`

## Installation

To install the WinPodiums plugin in SimHub: build the plugin, copy the DLL to SimHub's Plugins folder, and restart SimHub.

1. **Copy** only `WinPodiums.Plugin.dll` from `WinPodiums.Plugin/bin/Release/net48/` to `C:\Program Files (x86)\SimHub\Plugins`. Writing to that folder usually requires elevation (e.g. run as Administrator).
2. **Restart SimHub** (or start it if not running). SimHub loads plugins from the Plugins folder and invokes `IPlugin.Init(PluginManager)`.
3. **Confirm** the plugin appears in SimHub’s plugin list/settings as **WinPodiums** (see [SimHub Plugin LLD](../../docs/design/components/simhub-plugin.md)).
4. **Troubleshooting:** If the plugin fails to load with a `FileNotFoundException` (or "Could not load file or assembly 'Newtonsoft.Json'"), copy `Newtonsoft.Json.dll` from the same build output folder (`WinPodiums.Plugin/bin/Release/net48/`) into `C:\Program Files (x86)\SimHub\Plugins` and restart SimHub. SimHub usually provides Newtonsoft.Json from its own folder, so this is only needed in some setups.

## Phase 1: browser auth (PKCE) + heartbeat

1. **Primary auth**: In plugin, use browser (PKCE) flow: plugin opens browser → user signs in with Discord → callback returns to plugin → plugin exchanges code and stores tokens with DPAPI.
2. **Heartbeat**: Call `SendHeartbeatAsync(pluginVersion)` to send one verification flow; uses stored Bearer token.

**Debug only** (feature-flagged): When manual token is enabled (e.g. debug mode), get a token from https://winpodiums.com (or http://localhost:8787) at `/auth/token`, then in plugin call `AuthenticateWithManualTokenAsync(tokenCode)`. Do not expose as a user-facing option.

When the plugin runs inside SimHub, `Init(PluginManager)`, `DataUpdate`, and `End` are invoked by SimHub. For programmatic use (e.g. tests), after obtaining a `PluginManager` from the host you would call `Init(pluginManager)`, then `SetApiBaseUrl`, then auth and heartbeat:

```csharp
// Inside SimHub, Init(pluginManager) is called by the host.
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
