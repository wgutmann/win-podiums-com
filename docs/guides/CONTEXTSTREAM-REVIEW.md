# ContextStream and Documentation Review

**Date**: 2026-01-31  
**Purpose**: Record findings and fixes from a full review of ContextStream implementation and related documentation.

---

## Summary

Review covered: `.cursor/mcp.json`, `.cursor/rules/contextstream.mdc`, AGENTS.md, docs/guides (development.md, contextstream-mapping.md), .cursor/skills (cursor-project-docs, cloudflare-workers), docs/standards/documentation-standards.md, .cursor/docs/index.md, docs/architecture/README.md, docs/design/data-models/database-schema.md, and diagram/template references.

**Fixes applied**: Broken diagram links, missing diagram folders, PRD path inconsistency (prd vs product), broken template links, MCP env note for Windows.

---

## Issues Found and Fixed

### 1. Broken diagram links (fixed)

- **docs/architecture/README.md** linked to `diagrams/system-overview.mmd` and `diagrams/data-flow.mmd`, but `docs/architecture/diagrams/` did not exist.
- **docs/design/data-models/database-schema.md** linked to `../diagrams/entity-relationship.mmd`, but `docs/design/diagrams/` did not exist.

**Fix**: Created `docs/architecture/diagrams/README.md` and `docs/design/diagrams/README.md` describing the folder purpose and planned diagram filenames. Updated architecture README to link to the diagrams README instead of missing .mmd files. Updated database-schema to link to the design diagrams README.

### 2. PRD path inconsistency (fixed)

- **cursor-project-docs** skill and examples used `docs/prd/`; the repo and documentation-standards use `docs/product/`.

**Fix**: Replaced all `docs/prd/` references with `docs/product/` in `.cursor/skills/cursor-project-docs/SKILL.md` and `examples.md`. Aligned folder structure and key principles to `docs/product/`.

### 3. Broken template links (fixed)

- **docs/standards/documentation-standards.md** “Examples” section linked to non-existent files: `../product/templates/prd-template.md`, `../tech-plans/templates/technical-plan-template.md`, `../architecture/decisions/template.md`.

**Fix**: Replaced those links with pointers to existing indexes and examples (product/README.md, phase-1-mvp-scope.md, tech-plans/README.md, architecture/decisions/). Added a note that templates can be added when needed.

### 4. MCP environment (documented)

- **.cursor/mcp.json** does not set `CONTEXTSTREAM_API_KEY`; docs say to set it in the user’s environment. On Windows, Cursor started from a shortcut may not inherit shell env vars.

**Fix**: Added a sentence in docs/guides/development.md (Setup) that on Windows, if the key is not picked up, set it in Cursor’s environment or use Option B (wizard).

---

## No Issues Found

- **MCP config**: `.cursor/mcp.json` correctly defines the contextstream server with `CONTEXTSTREAM_API_URL`; API key correctly omitted.
- **Link consistency**: Relative links from .cursor/rules, .cursor/skills, AGENTS.md, and docs resolve correctly (paths checked).
- **Naming**: “ContextStream” used consistently (no “contextsteam” in repo).
- **.gitignore**: `.contextstream/` present; no secrets committed.
- **documentation-standards**: Folder structure already uses `docs/product/`; ContextStream-friendly subsection and link to contextstream-mapping are correct.

---

## Recommendations

1. **Add diagram files when ready**: Populate `docs/architecture/diagrams/` and `docs/design/diagrams/` with `system-overview.mmd`, `data-flow.mmd`, and `entity-relationship.mmd` when created; then restore or add direct links from the READMEs if desired.
2. **Optional templates**: Add PRD, Technical Plan, and ADR templates under docs/product/, docs/tech-plans/, and docs/architecture/decisions/ when standardizing new doc creation; then link them from documentation-standards Examples.
3. **ContextStream tool names**: Current docs use `project(action="ingest_local")`, `graph(action="dependencies")`, `graph(action="impact", target="...")`, `graph(action="ingest")`. If the MCP server’s consolidated tool API changes, update contextstream-mapping.md and the ContextStream rule accordingly.

---

## Comprehensive Integration Review (2026-01-31)

A full review of ContextStream integration (best practices, intended use, implementation, gaps) led to the following findings and fixes.

### Security (fixed)

- **Finding:** `.cursor/mcp.json` contained a real `CONTEXTSTREAM_API_KEY`; `.gitignore` does not exclude `.cursor/mcp.json`, so the key would be exposed if the repo was pushed.
- **Fix:** Replaced the real key with placeholder `PASTE_YOUR_CONTEXTSTREAM_API_KEY_HERE` in `.cursor/mcp.json`. Updated [development.md](development.md) so the committed file must only contain the placeholder; never commit a real key; rotate the key in the ContextStream dashboard if it was ever pushed.

### Fallback (fixed)

- **Finding:** No guidance when ContextStream MCP is unavailable or `session_init`/`context_smart` return no useful context.
- **Fix:** Added fallback in [AGENTS.md](../../AGENTS.md) and [.cursor/rules/contextstream.mdc](../../.cursor/rules/contextstream.mdc): if ContextStream MCP is unavailable or returns no useful context, fall back to reading AGENTS.md and docs/architecture/next-steps.md.

### First-time setup and ingest (fixed)

- **Finding:** `project(action="ingest_local")` was documented as "after clone or major changes" but not as a clear first-time step; new clones could use ContextStream without an index.
- **Fix:** Added "First-time setup (optional)" in [development.md](development.md): after connecting ContextStream, run project(ingest_local) once, then the one-time bootstrap. In [contextstream.mdc](../../.cursor/rules/contextstream.mdc): run project(ingest_local) once after clone or first use if the repo is not yet indexed; added bootstrap hint for new workspace or empty memory.

### Tool reference (fixed)

- **Finding:** No single reference for ContextStream tools we rely on; docs could drift when the MCP API changes.
- **Fix:** Added "ContextStream tool reference" (section 4) in [contextstream-mapping.md](contextstream-mapping.md) listing session_init, context_smart, search, session, project, graph, memory with purpose and actions; note to update if the MCP server API changes.

### Router mode and integrations (fixed)

- **Finding:** Router mode (`CONTEXTSTREAM_PROGRESSIVE_MODE=true`) and GitHub/Slack (Pro) were not documented.
- **Fix:** Added "Optional: Router mode and integrations" in [development.md](development.md): Router mode for many MCP servers or context limits; Pro users can connect GitHub/Slack for richer context_smart.

### Bootstrap in rule (fixed)

- **Finding:** One-time bootstrap was in the dev guide but not in the rule as "run once when memory is empty."
- **Fix:** In [contextstream.mdc](../../.cursor/rules/contextstream.mdc), added bullet: if new workspace or memory seems empty, run the one-time bootstrap (session_init + capture key decisions from ADRs/AGENTS.md) as in the development guide.
