# [Document Title]

**Status**: Draft | Review | Approved | Implemented | Deprecated  
**Version**: 1.0  
**Date**: YYYY-MM-DD  
**Owner**: [Team or individual]  
**Related**: [Links to related PRDs, ADRs, tech plans, or API docs]

---

## Overview

[Brief summary: what this document covers and why it matters. Use WinPodiums voice: formal but not stiff, earned, precise.]

---

## [First major section]

[Content. Use headings H2 for major sections, H3 for subsections; keep hierarchy consistent.]

### Callouts and emphasis

Use blockquotes for callouts. Style them so readers can scan:

> **Note**  
> Informational callout. Use for help text, context, or neutral notices.

> **Success / Verified**  
> Use for confirmation, verified state, or positive outcome. Aligns with Champagne Gold in the design system.

> **Warning**  
> Use for pending verification, attention needed, or caution. Aligns with Amber in the design system.

> **Error / Critical**  
> Use for validation failures, critical errors, or security-sensitive notes. Aligns with Dark Red in the design system.

### Code and technical content

- **Inline code**: Use backticks for `endpoint`, `variable`, and `literal` values.
- **Code blocks**: Specify language for syntax highlighting. Prefer meaningful snippets over full files.

```text
# Example: shell or plain output
```

```json
{ "example": "structured data" }
```

- **API / tokens**: Use monospace (e.g. JetBrains Mono in the design system). Never commit real secrets; use placeholders like `YOUR_CLIENT_ID`.

### Lists and tables

- Use bullet lists for optional or unordered items.
- Use numbered lists for steps or ordered requirements.
- Use tables for comparisons, options, or metadata.

| Column A | Column B |
|----------|----------|
| Value    | Value    |

### Status badges (optional)

In READMEs or index files you can use badges. Prefer text or small tables for status inside long docs:

- **Status**: Approved
- **Phase**: Phase 1 MVP

### Links and cross-references

- Prefer relative links within the repo: `[Design system](design-system.md)`, `[ADR-001](../architecture/decisions/001-cloudflare-stack.md)`.
- Use stable document IDs in **Related** / **Implements**: e.g. PRD-001, ADR-001, TP-001 (see [Documentation standards](../standards/documentation-standards.md)).

---

## [Second major section]

[Repeat structure as needed. Keep sections scannable: short paragraphs, clear headings.]

---

## Related documentation

- [Design system](design-system.md) — Colors, typography, voice
- [Documentation standards](../standards/documentation-standards.md) — Naming, metadata, doc types
- [GitHub repo template](github-repo-template.md) — Repo and README styling
