# ContextStream and Agents - Product Requirements

This directory contains the PRD for **ContextStream and agent/Cursor interactions**: session bootstrap (init/context), search-first, decisions and lessons, graph and tagging, single rule source, fallback when unavailable. Ensures consistent behavior across agents and Cursor when using ContextStream MCP.

**ContextStream**: PRD-009/TP-009 and PRD-010/TP-010 use stable IDs and **Related** / **Implements** for knowledge graph linking. See [ContextStream mapping](../../guides/contextstream-mapping.md).

## Documents

| Document | Status | Version | Technical Plan | Description |
|----------|--------|---------|----------------|-------------|
| [PRD-009: ContextStream and Agent/Cursor Interactions](001-contextstream-agent-cursor-interactions.md) | Draft | 1.0 | [TP-009](../../tech-plans/contextstream-agents/001-contextstream-and-cursor-rules.md) | Init/context, search-first, decisions/lessons, rule and skills alignment, fallback |
| [PRD-010: ContextStream Knowledge Ingest (GitHub API)](002-contextstream-knowledge-ingest.md) | Draft | 1.0 | [TP-010](../../tech-plans/contextstream-agents/002-contextstream-knowledge-ingest-implementation.md) | Automated GitHub API ingestion workflow for knowledge graph |

## Related Documentation

- [ContextStream mapping](../../guides/contextstream-mapping.md)
- [Development guide – AI tooling](../../guides/development.md#ai-tooling-optional)
- [.cursor/rules/contextstream.mdc](../../../.cursor/rules/contextstream.mdc)
- [AGENTS.md](../../../AGENTS.md)
