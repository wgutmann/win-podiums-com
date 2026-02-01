# PRD-009: ContextStream and Agent/Cursor Interactions

**Doc type**: PRD | **ID**: PRD-009 | **Related**: [Phase 1 MVP Scope](../phase-1-mvp-scope.md), [ContextStream mapping](../../guides/contextstream-mapping.md), [AGENTS.md](../../../AGENTS.md) | **Technical Plans**: [TP-009](../../tech-plans/contextstream-agents/001-contextstream-and-cursor-rules.md)

**Status**: Draft  
**Version**: 1.0  
**Date**: 2026-02-01  
**Owner**: Product / Engineering  
**Related**: [Phase 1 MVP Scope](../phase-1-mvp-scope.md), [ContextStream mapping](../../guides/contextstream-mapping.md), [development guide – AI tooling](../../guides/development.md#ai-tooling-optional), [AGENTS.md](../../../AGENTS.md)

## Overview

### Problem Statement

We use ContextStream MCP for project context, code search, and knowledge graph (PR ↔ Tech Plan ↔ PRD). Without clear product requirements and a tech plan for how agents and Cursor interact with ContextStream, behavior can drift: inconsistent tool names (init vs session_init), when to call context vs search, how skills and rules reference ContextStream, and how to fall back when MCP is unavailable.

### Solution

Define **what** we expect from ContextStream integration and **how** agents and Cursor should behave: mandatory session bootstrap (init then context), search-first before Grep/Read, when to capture decisions/lessons, how rules and skills stay aligned, and how PR traceability (template + labels + mapping) ties into the knowledge graph. Document this in a PRD and a tech plan so the implementation (rules, skills, guides) stays traceable and auditable.

### Success Criteria

- One PRD (this document) and one tech plan (TP-009) describe ContextStream integration and agent/Cursor interaction requirements.
- [.cursor/rules/contextstream.mdc](../../../.cursor/rules/contextstream.mdc) is the single rule source; [AGENTS.md](../../../AGENTS.md) and skills point to it and do not duplicate long bootstrap text.
- All ContextStream-related behavior (init, context, search, session capture, graph, tagging) is specified in the tech plan and reflected in the rule and [ContextStream mapping](../../guides/contextstream-mapping.md).
- When ContextStream is unavailable, agents fall back immediately to AGENTS.md and docs/architecture/next-steps.md without retrying in the same turn.

## User Stories

### As an Agent (Cursor / AI)
- I want a single rule that tells me exactly when to call init, context, search, and when to capture decisions, so I behave consistently across sessions.
- I want to know when to use ContextStream (search, graph) vs local tools (Grep, Read) and when to fall back so I don’t hang or repeat failed calls.

### As a Contributor
- I want the development guide to explain optional ContextStream setup and one-time bootstrap so I can enable it once and get context in new sessions.
- I want skills (e.g. product-manager, cursor-project-docs, github-change-control) to reference the same ContextStream behavior so I get consistent guidance.

### As a Maintainer
- I want PRs, PRDs, and tech plans to be traceable in the ContextStream graph (PR ↔ TP ↔ PRD) via the traceability mapping and labels so we can see what work ties to which docs.

## Requirements

### Functional Requirements

#### FR-001: Session Bootstrap (Mandatory When ContextStream Available)
- **Priority**: P0 (Critical)
- **Description**: On the first message of every new conversation, the agent’s very first action must be (1) **init**(folder_path, context_hint) then (2) **context**(user_message, format=minified, max_tokens=400). On every subsequent message, call **context**(user_message, ...) at the start of the turn.
- **Acceptance Criteria**:
  - Documented in the ContextStream rule and in ContextStream mapping; no exceptions in the rule.
  - If ContextStream is unavailable or returns an error, fall back immediately to AGENTS.md and docs/architecture/next-steps.md; do not retry in the same turn.

#### FR-002: Search-First and Index Policy
- **Priority**: P0 (Critical)
- **Description**: Before Grep/Read for code or docs, use ContextStream **search** (mode=hybrid or semantic). Call **project(action=index_status)** before the first broad code search in a session (or after clone/major changes); if not indexed or stale, run **project(action=ingest_local)** then proceed.
- **Acceptance Criteria**:
  - Rule specifies search-first; prefer output_format=paths for file discovery, output_format=count for existence; use full only when content is needed.
  - Fall back to local tools only if ContextStream returns no results.

#### FR-003: Decisions and Lessons
- **Priority**: P1 (High)
- **Description**: After significant decisions, capture with **session(action=capture, event_type=decision, ...)** and include **file path** or **code_refs** so the knowledge graph links the decision to the doc/module. When the user corrects a mistake or says “don’t do X again”, use **session(action=capture_lesson, ...)** with trigger, impact, prevention, keywords.
- **Acceptance Criteria**:
  - Rule and development guide state this; skills (e.g. product-manager, cursor-project-docs) reference the same capture behavior with code_refs.

#### FR-004: Graph and Tagging
- **Priority**: P1 (High)
- **Description**: Before refactors, use **graph(action=dependencies, ...)** and **graph(action=impact, target=...)**. Repo docs use stable IDs (PRD-XXX, ADR-XXX, TP-XXX) and Related/Implements. Every PR must use the PR template with Traceability, Doc links, and traceability labels; when capturing an implementation event, use the traceability mapping for code_refs.
- **Acceptance Criteria**:
  - Rule includes graph and tagging bullets; PR traceability is covered in PRD-008/TP-008 and referenced in the ContextStream rule.

#### FR-005: Single Rule Source, No Duplication
- **Priority**: P1 (High)
- **Description**: The ContextStream rule (`.cursor/rules/contextstream.mdc`) is the single source of truth for ContextStream behavior. AGENTS.md and skills should point to it and not duplicate long bootstrap or tool-usage paragraphs.
- **Acceptance Criteria**:
  - AGENTS.md contains a short pointer to the rule; skills reference the rule and mapping for ContextStream usage; contextstream.mdc contains the full bootstrap, search, decisions, graph, lessons, tagging text.

#### FR-006: Fallback and Router Mode
- **Priority**: P2 (Medium)
- **Description**: If ContextStream is configured with Router or progressive mode, fewer tools may be exposed; agents use the tools the client lists. When ContextStream is unavailable, agents must not retry in the same turn.
- **Acceptance Criteria**:
  - Rule states fallback and Router/progressive mode; development guide optionally documents CONTEXTSTREAM_PROGRESSIVE_MODE and Pro integrations (GitHub, Slack).

## Technical Constraints

- Tool names may differ by MCP client (e.g. init vs session_init, context vs context_smart); rule and docs use the names the server exposes and note alternate names.
- ContextStream is optional for contributors; CI and build do not depend on it.

## Risks

- **Rule drift**: If skills or AGENTS.md are updated without updating the rule, behavior can diverge; mitigate by referencing the rule from all of them and keeping one canonical rule file.

## Related Documentation

- [ContextStream mapping](../../guides/contextstream-mapping.md)
- [Development guide – AI tooling](../../guides/development.md#ai-tooling-optional)
- [.cursor/rules/contextstream.mdc](../../../.cursor/rules/contextstream.mdc)
- [AGENTS.md](../../../AGENTS.md)
- [TP-009: ContextStream and Cursor Rules](../../tech-plans/contextstream-agents/001-contextstream-and-cursor-rules.md)
