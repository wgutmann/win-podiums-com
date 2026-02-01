---
name: simhub-plugin-builder
description: Build SimHub plugins with C#/.NET: scaffold projects, set up build/debug, package and deploy. Use when the user mentions SimHub, plugins, telemetry, or C#/.NET plugin development.
---

# SimHub Plugin Builder

## Quick Start

Use this skill when the user asks to build or maintain SimHub plugins. Follow the checklists and confirm any SimHub SDK requirements directly from the installed SDK or official docs.

**This repo:** The plugin lives in `apps/plugin/` and is documented in [docs/design/components/simhub-plugin.md](docs/design/components/simhub-plugin.md).

**ContextStream (when available):** Before scaffolding or changing the plugin, use ContextStream `search` for "SimHub", "plugin", "PluginMain", "DataUpdate", "GameData", "ApiClient", "heartbeat" to find existing structure in `apps/plugin/`. After SDK wiring or plugin structure decisions, capture in ContextStream (event_type=decision) with path to `apps/plugin/` or [simhub-plugin.md](docs/design/components/simhub-plugin.md).

## New Plugin Workflow

Checklist:
- [ ] Identify plugin type (data source/telemetry, tools/utility).
- [ ] Locate the SimHub SDK at `C:\Program Files (x86)\SimHub\PluginSdk` and read the demo project for interfaces and target framework.
- [ ] Create a C# class library targeting **.NET Framework 4.8** (required by SimHub SDK).
- [ ] Add references to the SimHub SDK assemblies (SimHub.Plugins, GameReaderCommon from the SimHub install or PluginSdk folder).
- [ ] Implement **IPlugin** and **IDataPlugin**; optionally **IWPFSettingsV2** for settings UI.
- [ ] Implement lifecycle: **Init(PluginManager pluginManager)**, **DataUpdate(PluginManager pluginManager, ref GameData data)**, **End(PluginManager pluginManager)**. There is no Start() in the SDK.
- [ ] Build and deploy the DLL to the SimHub plugins folder (see Deployment path below).
- [ ] Restart SimHub and verify plugin load via logs.

Notes:
- **Target framework:** .NET Framework 4.8 is required by the SimHub SDK (demos and SimHub.Plugins dependency).
- **SimHub path (this repo):** Use the canonical path `C:\Program Files (x86)\SimHub` (plugins folder: `C:\Program Files (x86)\SimHub\Plugins`) when referencing the SimHub install or plugins folder in docs and code.
- **Deployment path:** This repo uses `C:\Program Files (x86)\SimHub\Plugins` for the plugin DLL. Official SimHub docs sometimes state the plugin DLL goes in the **SimHub install root** (`C:\Program Files (x86)\SimHub\`). If the plugin is not loaded, try (1) DLL in `Plugins` first, (2) then copy to install root, (3) check SimHub version and official docs/Discord for current convention.

## Build/Debug Workflow

Checklist:
- [ ] Build in Debug configuration.
- [ ] Deploy the DLL and any dependencies to `C:\Program Files (x86)\SimHub\Plugins` (or install root if required by your SimHub version).
- [ ] Restart SimHub or use its reload capability if available.
- [ ] Attach a debugger to the SimHub process and set breakpoints.
- [ ] Validate logs for load errors or missing dependencies.

## Packaging/Release Workflow

Checklist:
- [ ] Bump plugin version in assembly or metadata.
- [ ] Build Release artifacts.
- [ ] Verify only required DLLs are bundled.
- [ ] Create a zip package with README and basic usage notes.
- [ ] Add release notes and changelog.

## Templates and Examples

Use the templates in `examples.md` for:
- Project structure (generic minimal plugin and this repo's WinPodiums layout)
- **SDK-aligned** minimal plugin class skeleton (IPlugin, IDataPlugin, Init/DataUpdate/End) and optional WPF (Control.xaml, IWPFSettingsV2)
- Build and deploy helper commands

See also **reference.md** for a short SimHub SDK reference (interfaces, lifecycle, GameData, namespaces, attributes).

## Guardrails

- Confirm interface names and lifecycle from the SDK before coding: **IPlugin**, **IDataPlugin**, **Init(PluginManager)**, **DataUpdate(PluginManager, ref GameData)**, **End(PluginManager)**. No Start().
- For this repo, use the canonical SimHub path `C:\Program Files (x86)\SimHub` (plugins: `C:\Program Files (x86)\SimHub\Plugins`); see discord-authentication skill for consistency. If the plugin is not loaded, try deploy to install root and check SimHub docs.
- Prefer step-by-step guidance with checklists.
- **Discord OAuth in the plugin:** Use the discord-authentication skill; canonical SimHub paths match.
