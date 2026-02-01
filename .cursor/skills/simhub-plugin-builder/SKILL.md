---
name: simhub-plugin-builder
description: Build SimHub plugins with C#/.NET: scaffold projects, set up build/debug, package and deploy. Use when the user mentions SimHub, plugins, telemetry, or C#/.NET plugin development.
---

# SimHub Plugin Builder

## Quick Start

Use this skill when the user asks to build or maintain SimHub plugins. Follow the checklists and confirm any SimHub SDK requirements directly from the installed SDK or official docs.

## New Plugin Workflow

Checklist:
- [ ] Identify plugin type (data source/telemetry, tools/utility).
- [ ] Locate the SimHub SDK and read the required target framework and interfaces.
- [ ] Create a C# class library using the required framework.
- [ ] Add references to the SimHub SDK assemblies.
- [ ] Implement required plugin interfaces and lifecycle hooks.
- [ ] Build and deploy the DLL to the SimHub plugins folder: `C:\Program Files (x86)\SimHub\Plugins`.
- [ ] Restart SimHub and verify plugin load via logs.

Notes:
- Do not assume the target framework. Read it from the SDK or docs.
- **SimHub path (this repo)**: Use the canonical path `C:\Program Files (x86)\SimHub` (plugins: `C:\Program Files (x86)\SimHub\Plugins`) when referencing the SimHub install or plugins folder in docs and code.

## Build/Debug Workflow

Checklist:
- [ ] Build in Debug configuration.
- [ ] Deploy the DLL and any dependencies to `C:\Program Files (x86)\SimHub\Plugins`.
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
- Project structure
- Minimal plugin class skeleton
- Build and deploy helper commands

## Guardrails

- Confirm interface names and required hooks from the SDK before coding.
- For this repo, use the canonical SimHub path `C:\Program Files (x86)\SimHub` (plugins: `C:\Program Files (x86)\SimHub\Plugins`); see discord-authentication skill for consistency.
- Prefer step-by-step guidance with checklists.
