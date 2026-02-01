# WinPodiums SimHub Plugin

**Status**: Minimal scaffold (Phase 1)  
**Technology**: C# / .NET Framework 4.8

## Overview

SimHub plugin for WinPodiums: monitors telemetry, detects podium finishes, and submits verified results to the API. Phase 1 scope: position detection, minimal auth (browser or manual token), one verification API call (or stub).

## Layout

- `WinPodiums.Plugin/` — Main class library
  - `Core/PluginMain.cs` — Entry point (implement SimHub SDK interfaces after adding reference)

## Prerequisites

- .NET Framework 4.8
- SimHub installed (for SDK reference and testing)

## Build

1. Add reference to SimHub plugin SDK/assemblies from your SimHub install directory (see [SimHub Plugin LLD](../../docs/design/components/simhub-plugin.md)).
2. From this directory: `dotnet build WinPodiums.Plugin/WinPodiums.Plugin.csproj`
3. Deploy the built DLL to SimHub Plugins folder and restart SimHub.

## Development

- Build and run on Windows host (no Docker for plugin yet).
- API base URL configurable (e.g. `http://localhost:8787` when using Docker for the API).

## Related

- [SimHub Plugin LLD](../../docs/design/components/simhub-plugin.md)
- [Discord Integration LLD](../../docs/design/integrations/discord-integration.md)
- [Phase 1 scope](../../docs/product/phase-1-mvp-scope.md)
