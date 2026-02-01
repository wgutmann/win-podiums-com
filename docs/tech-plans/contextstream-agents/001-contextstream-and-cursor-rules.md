# TP-009: ContextStream and Cursor Rules

**Doc type**: Technical Plan | **ID**: TP-009 | **Implements**: [PRD-009: ContextStream and Agent/Cursor Interactions](../../product/contextstream-agents/001-contextstream-agent-cursor-interactions.md) | **Related**: [ContextStream mapping](../../guides/contextstream-mapping.md), [development guide](../../guides/development.md), [AGENTS.md](../../../AGENTS.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Development Team

## Overview

This Technical Plan describes how ContextStream MCP is used by agents and Cursor: the single rule source (contextstream.mdc), session bootstrap (init then context), search-first and index policy, decisions and lessons capture, graph usage, tagging and PR traceability, fallback when unavailable, and alignment of AGENTS.md and skills. It implements PRD-009.

## Architecture

### Components

- **.cursor/rules/contextstream.mdc** — Single source of truth for ContextStream behavior: session bootstrap, code/search, decisions, graph, lessons, tagging (including PR traceability), fallback, Router mode. Always applied; globs `**/*`.
- **AGENTS.md** — Short pointer to contextstream.mdc and repo phase/stack; does not duplicate long bootstrap or tool-usage text.
- **docs/guides/contextstream-mapping.md** — Maps repo concepts (PRD, ADR, tech plan, diagrams, lessons) to ContextStream (plans, decisions, memory, graph); §1.4 covers PR ↔ Tech Plan ↔ PRD and traceability mapping/labels.
- **docs/guides/development.md** — Optional ContextStream setup, one-time bootstrap (init + capture key decisions), graph and tagging, editor rule and Router mode.
- **Skills** (.cursor/skills/*) — product-manager, cursor-project-docs, github-change-control, and others reference contextstream.mdc and contextstream-mapping.md for ContextStream usage; they do not redefine bootstrap or tool order.

### Data Flow

1. **New conversation** — Agent’s first action: **init**(folder_path, context_hint) then **context**(user_message, format=minified, max_tokens=400). If ContextStream unavailable or errors → fall back to AGENTS.md and next-steps.md; do not retry.
2. **Subsequent messages** — Agent calls **context**(user_message, ...) at start of turn.
3. **Code/docs discovery** — Before Grep/Read: **project(action=index_status)** before first broad search; if not indexed/stale, **project(action=ingest_local)**. Then **search**(mode=hybrid or semantic); prefer paths/count; fall back to local tools if no results.
4. **Decisions / lessons** — After significant decisions: **session(action=capture, event_type=decision, ...)** with file path or code_refs. On user correction: **session(action=capture_lesson, ...)**.
5. **Refactors** — **graph(action=dependencies, ...)** and **graph(action=impact, target=...)**; repo must be indexed.
6. **PR traceability** — PR template + Doc links + labels (see PRD-008/TP-008); implementation events use traceability mapping for code_refs.

## Implementation Details

### Rule Content (contextstream.mdc)

- **Session bootstrap**: First message: init then context; every later message: context at start. Mandatory; no exceptions.
- **Code/search**: project(index_status) before first broad search; ingest_local if needed. search before Grep/Read; output_format=paths/count/full as appropriate; fall back if no results.
- **Decisions**: session(capture, event_type=decision, ...) with file path or code_refs.
- **Graph**: graph(dependencies, impact); project(ingest_local) after clone or major changes; optionally graph(ingest) for full graph.
- **New workspace / bootstrap**: One-time bootstrap (init + capture key decisions) per development guide.
- **Lessons**: session(capture_lesson, ...) on user correction.
- **Tagging**: Stable IDs, Related/Implements; PR template Traceability + Doc links + labels; implementation events use mapping for code_refs.
- **Fallback**: If ContextStream unavailable or error → AGENTS.md and next-steps.md immediately; no retry same turn.
- **Router / progressive mode**: Use tools the client lists when in Router/progressive mode.

### AGENTS.md

- Short “ContextStream (when MCP available)” line pointing to contextstream.mdc; first message init then context; every later message context; search before Grep/Read; fall back if unavailable.
- No long bootstrap or tool-usage duplication; phase, stack, pre-push, conventions remain.

### Development Guide

- Optional ContextStream setup and one-time bootstrap (init + suggested decisions to capture).
- Graph and tagging; editor rule; optional Router mode and Pro integrations.

### Skills Alignment

- **product-manager**: context at start; capture decisions with code_refs; PR review expects Traceability and Doc links; optional reminder for labels and implementation event.
- **cursor-project-docs**: Follow contextstream.mdc; search before creating/editing docs; capture decisions with code_refs; when documenting PR flow, reference template, mapping, labels.
- **github-change-control**: When creating/updating PRs, fill template (Traceability, Doc links) and apply traceability labels; resolve paths from traceability mapping.

### Tool Names

- Rule and docs use the names the MCP client exposes (often **init** and **context**); docs may mention session_init and context_smart as server-side names. No hardcoding of a single name across all clients.

## Testing Strategy

- **Manual**: In a Cursor chat with ContextStream connected, confirm first message triggers init then context and later messages start with context; confirm search is used before Grep/Read when discovering files.
- **Fallback**: With ContextStream disabled or broken, confirm agent falls back to AGENTS.md/next-steps and does not retry ContextStream in the same turn.
- **Rule/skills**: Grep for ContextStream references in AGENTS.md and skills; confirm they point to the rule or mapping and do not duplicate long bootstrap text.

## Deployment

- No runtime deployment; rule and docs are in repo. After edits to contextstream.mdc or mapping, contributors and agents pick up changes on next session or reload.

## Related Documentation

- [PRD-009: ContextStream and Agent/Cursor Interactions](../../product/contextstream-agents/001-contextstream-agent-cursor-interactions.md)
- [ContextStream mapping](../../guides/contextstream-mapping.md)
- [Development guide – AI tooling](../../guides/development.md#ai-tooling-optional)
- [.cursor/rules/contextstream.mdc](../../../.cursor/rules/contextstream.mdc)
- [AGENTS.md](../../../AGENTS.md)
