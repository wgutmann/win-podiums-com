---
name: simhub-plugin-builder
description: Build SimHub plugins with C#/.NET: scaffold projects, set up build/debug, package and deploy. Use when the user mentions SimHub, plugins, telemetry, or C#/.NET plugin development.
---

# SimHub Plugin Builder

## Quick Start

Use this skill when the user asks to build or maintain SimHub plugins. Follow the checklists and confirm any SimHub SDK requirements directly from the installed SDK or official docs.

**This repo:** The plugin lives in `apps/plugin/` and is documented in [docs/design/components/simhub-plugin.md](docs/design/components/simhub-plugin.md).

**ContextStream and doc layout:** SimHub POC docs use stable IDs and **Related** / **Implements** for knowledge graphing. Key IDs: **PRD-001** (SimHub Plugin POC), **TP-SPOC-001**–**TP-SPOC-005** (tech plans). See [ContextStream mapping](docs/guides/contextstream-mapping.md).

- **PRD**: [docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md](docs/product/simhub-plugin-poc/001-simhub-plugin-poc.md) — PRD-001
- **Tech plans**: [docs/tech-plans/simhub-plugin-poc/](docs/tech-plans/simhub-plugin-poc/) — TP-SPOC-001 (skeleton/SDK/config), TP-SPOC-002 (auth/PKCE), TP-SPOC-003 (API client/heartbeat), TP-SPOC-004 (minimal UI), TP-SPOC-005 (testing)
- **LLD**: [docs/design/components/simhub-plugin.md](docs/design/components/simhub-plugin.md) — lists Related to PRD-001 and TP-SPOC-001–005

**ContextStream (when available):** Before scaffolding or changing the plugin, use ContextStream `search` for "SimHub", "plugin", "PluginMain", "DataUpdate", "GameData", "ApiClient", "heartbeat", "PRD-001", "TP-SPOC" to find existing structure in `apps/plugin/` and related docs. After SDK wiring or plugin structure decisions, capture in ContextStream (event_type=decision) with path to `apps/plugin/`, [simhub-plugin.md](docs/design/components/simhub-plugin.md), or the relevant tech plan (e.g. `docs/tech-plans/simhub-plugin-poc/001-plugin-skeleton-sdk-config.md`) so the graph links decisions to docs and code.

## New Plugin Workflow

Checklist:
- [ ] Identify plugin type (data source/telemetry, tools/utility).
- [ ] Locate the SimHub SDK at `C:\Program Files (x86)\SimHub\PluginSdk` and read the demo project for interfaces and target framework.
- [ ] Create a C# class library targeting **.NET Framework 4.8** (required by SimHub SDK).
- [ ] Add references to the SimHub SDK assemblies (SimHub.Plugins, GameReaderCommon from the SimHub install or PluginSdk folder).
- [ ] Implement **IPlugin** and **IDataPlugin**; optionally **IWPFSettingsV2** for settings UI.
- [ ] Implement lifecycle: **Init(PluginManager pluginManager)**, **DataUpdate(PluginManager pluginManager, ref GameData data)**, **End(PluginManager pluginManager)**. There is no Start() in the SDK.
- [ ] Build and deploy the DLL to the SimHub install root (see Deployment path below).
- [ ] Restart SimHub and verify plugin load via logs.

Notes:
- **Target framework:** .NET Framework 4.8 is required by the SimHub SDK (demos and SimHub.Plugins dependency).
- **SimHub path (this repo):** The only path we support is `C:\Program Files (x86)\SimHub\` (SimHub install root). Use this path in all docs and code; no other install locations are supported.
- **Deployment path:** Deploy the plugin DLL to `C:\Program Files (x86)\SimHub\` (install root) only; no Plugins subfolder.

## Build/Debug Workflow

Checklist:
- [ ] Build in Debug configuration.
- [ ] Deploy the DLL and any dependencies to `C:\Program Files (x86)\SimHub\` (install root; the only deploy path this repo supports).
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
- For this repo, use the only supported SimHub path `C:\Program Files (x86)\SimHub\` (install root only); see discord-authentication skill for consistency.
- Prefer step-by-step guidance with checklists.
- **Discord OAuth in the plugin:** Use the discord-authentication skill; SimHub path is `C:\Program Files (x86)\SimHub\` only.
- **Doc changes:** When adding or editing SimHub PRD/tech plan/LLD content, keep **Related** and **Implements** links and stable IDs (PRD-001, TP-SPOC-001–005) so ContextStream’s knowledge graph stays correct. See [ContextStream mapping](docs/guides/contextstream-mapping.md) and [documentation standards](docs/standards/documentation-standards.md).
