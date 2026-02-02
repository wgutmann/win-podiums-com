---
name: simhub-plugin-deploy
description: Builds and deploys the WinPodiums SimHub plugin to the SimHub install root. Use when the user asks to deploy the plugin, copy plugin to SimHub, copy DLL to SimHub, run plugin deploy, or "put plugin in SimHub".
---

# SimHub Plugin Deploy

## Quick Start

Use this skill when the user asks to **build and deploy** the WinPodiums SimHub plugin.

**This repo:** Plugin lives in `apps/plugin/WinPodiums.Plugin/`. If a deploy script exists, use it; otherwise follow the manual steps below (same as [docker-dev-environment §6 Local deployment — SimHub plugin](../../docker-dev-environment/SKILL.md#6-local-deployment--simhub-plugin-host-only)).

## Deploy script (if present)

If `scripts/deploy-plugin.ps1` exists, from **repo root** (PowerShell):

```powershell
.\scripts\deploy-plugin.ps1
```

Or: `powershell -ExecutionPolicy Bypass -File scripts/deploy-plugin.ps1`

**What it typically does:** Builds the plugin (Release), copies the DLL (and Newtonsoft.Json.dll if present) to the SimHub install folder, prints "Deploy complete. Restart SimHub to load the plugin."

**Only supported deploy path:** `C:\Program Files (x86)\SimHub\` (SimHub install root). Plugin DLL(s) go there; no Plugins subfolder. This repo does not support other paths. Copying to Program Files usually requires **running PowerShell as Administrator**.

## Manual build and deploy (no script)

When the deploy script is not present, use the **docker-dev-environment** skill §6:

1. **Before building:** Close SimHub completely (locks plugin DLLs).
2. **Build:** From repo root: `dotnet build apps/plugin/WinPodiums.Plugin/WinPodiums.Plugin.csproj --configuration Release` (or Debug).
3. **Before deploying:** Ensure SimHub is stopped so the install folder is not locked.
4. **Deploy:** Copy the built DLL from `apps/plugin/WinPodiums.Plugin/bin/Release/net48/` (or `Debug/net48/`) to `C:\Program Files (x86)\SimHub\` (SimHub install root; the only deploy path this repo supports).
5. **Verify:** Start SimHub and confirm the plugin appears in the plugin list.

## Build only (no copy)

```powershell
dotnet build apps/plugin/WinPodiums.Plugin/WinPodiums.Plugin.csproj --configuration Release
```

Output: `apps/plugin/WinPodiums.Plugin/bin/Release/net48/WinPodiums.Plugin.dll`

## After deploy

- **Restart SimHub** so it loads the plugin.
- Confirm the plugin appears in SimHub's plugin list as **WinPodiums**.
- Point the plugin at the API (e.g. `http://localhost:8787` when the API runs in Docker).

## Related

- **Plugin source and docs:** [apps/plugin/README.md](../../../apps/plugin/README.md), [docs/design/components/simhub-plugin.md](../../../docs/design/components/simhub-plugin.md)
- **Manual steps and SimHub lock notes:** [docker-dev-environment §6](../../docker-dev-environment/SKILL.md#6-local-deployment--simhub-plugin-host-only)
- **General SimHub plugin dev** (scaffold, SDK, lifecycle): use the **simhub-plugin-builder** skill
