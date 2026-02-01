---
name: simhub-plugin-deploy
description: Build and deploy the WinPodiums SimHub plugin to the SimHub Plugins folder. Use when the user asks to build and deploy the plugin, deploy the plugin to SimHub, or run the plugin deploy script.
---

# SimHub Plugin Deploy

## Quick Start

Use this skill when the user asks to **build and deploy** the WinPodiums SimHub plugin. The canonical way is to run the deploy script from the repo root.

**This repo:** Plugin lives in `apps/plugin/WinPodiums.Plugin/`. Deploy script: `scripts/deploy-plugin.ps1`.

## Build and Deploy (recommended)

From **repo root** (PowerShell):

```powershell
.\scripts\deploy-plugin.ps1
```

Or:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-plugin.ps1
```

**What it does:**

1. Builds the plugin: `dotnet build apps/plugin/WinPodiums.Plugin/WinPodiums.Plugin.csproj --configuration Release --no-incremental`
2. Copies `WinPodiums.Plugin.dll` (and `Newtonsoft.Json.dll` if present) to the SimHub install folder
3. Prints "Deploy complete. Restart SimHub to load the plugin."

**Default deploy path:** `C:\Program Files (x86)\SimHub` (SimHub install root). Override with `$env:SIMHUB_PLUGINS` (e.g. `...\SimHub\Plugins` if your SimHub version loads from a Plugins subfolder).

**Requirements:**

- .NET SDK (targets .NET Framework 4.8)
- SimHub installed at `C:\Program Files (x86)\SimHub` (or set `$env:SIMHUB_PLUGINS` to your install path or Plugins folder)
- Copying to Program Files usually requires **running PowerShell as Administrator**

## Override deploy path

If SimHub is installed elsewhere or you want to deploy to the Plugins subfolder:

```powershell
$env:SIMHUB_PLUGINS = "C:\path\to\SimHub"
# or: "C:\path\to\SimHub\Plugins"
.\scripts\deploy-plugin.ps1
```

## Build only (no copy)

To build without deploying:

```powershell
dotnet build apps/plugin/WinPodiums.Plugin/WinPodiums.Plugin.csproj --configuration Release
```

Output: `apps/plugin/WinPodiums.Plugin/bin/Release/net48/WinPodiums.Plugin.dll`

## After deploy

- **Restart SimHub** so it loads the plugin
- Confirm the plugin appears in SimHub's plugin list as **WinPodiums**
- Point the plugin at the API (e.g. `http://localhost:8787` when the API runs in Docker)

## Related

- **Plugin source and docs:** [apps/plugin/README.md](../../../apps/plugin/README.md), [docs/design/components/simhub-plugin.md](../../../docs/design/components/simhub-plugin.md)
- **General SimHub plugin dev** (scaffold, SDK, lifecycle): use the **simhub-plugin-builder** skill
