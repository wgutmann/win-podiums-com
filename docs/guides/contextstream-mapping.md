# ContextStream Mapping: Repo Docs and AI Memory

**Purpose**: Map this repo’s documentation and conventions to ContextStream’s features so we use both in parallel and keep ContextStream’s metadata and graph useful.

**See also**: [Development guide – AI tooling (optional)](development.md#ai-tooling-optional), [Documentation standards](../standards/documentation-standards.md), [Cursor Project Docs skill](../../.cursor/skills/cursor-project-docs/SKILL.md).

---

## 1. Parallels: Repo Concepts ↔ ContextStream

| Repo concept | ContextStream equivalent | How to use together |
|--------------|--------------------------|----------------------|
| **Diagrams** (Mermaid, `.mmd`, inline in docs) | Indexed as file/markdown content | Keep diagrams in `docs/architecture/diagrams/` or inline with a clear heading (e.g. `## System Overview Diagram`). ContextStream indexes repo files; consistent titles and cross-links from READMEs (e.g. [architecture README](../architecture/README.md#diagrams)) help search and graph relate “diagram” content. |
| **PRD** (product requirements) | **Plans** + **decisions** | PRDs define *what* and *why*. In ContextStream: capture key product decisions as `session(action="capture", event_type="decision", ...)` with title + content and a pointer to the PRD path. For a multi-step roadmap, use `session(action="capture_plan", title="...", steps=[...])` and link plan content to `docs/product/` in the content. |
| **ADR / Tech Plan / HLD** (decisions and design) | **Decisions** + **implementation** events | ADRs and tech plans are “decisions” and “implementation” in ContextStream terms. After writing or updating an ADR, capture a short decision in ContextStream: `event_type="decision"`, title e.g. “Cloudflare stack (ADR-001)”, content = one-line summary + path to `docs/architecture/decisions/001-cloudflare-stack.md`. Tech plan milestones can be `event_type="implementation"` or `"task"` when completed. |
| **Technical docs** (`docs/`, `.cursor/docs/`) | Indexed repo + **memory** | ContextStream indexes the repo (code + docs). Use **Related** / **Implements** in every doc (see [documentation-standards](../standards/documentation-standards.md)) so that when ContextStream indexes, related docs are semantically linked. Add a short “ContextStream-friendly” blurb at the top of key docs (e.g. “**Doc type**: ADR | **ID**: ADR-001 | **Related**: PRD Phase 1, TP-001”) if you want explicit labels for recall. |
| **Lessons learned** (mistakes, preventions) | **Lessons** (`capture_lesson`) | When something goes wrong (e.g. “pushed without running tests”), capture in ContextStream: `session(action="capture_lesson", title="...", trigger="...", impact="...", prevention="...", keywords=[...])`. Do *not* duplicate full runbooks in the repo; use ContextStream for session-level “don’t repeat this” and keep procedures in `docs/guides/`. |
| **To-dos / tasks** (implementation checklist, next steps) | **Tasks** + **reminders** | Repo to-dos (e.g. in [next-steps](../architecture/next-steps.md)) = human checklist. In ContextStream: use `memory(action="create_task", ...)` for concrete tasks tied to a plan, or **reminder** for “do this before deploy”. When you complete a repo checklist item, you can capture `event_type="task"` in ContextStream so the AI knows it’s done. |

### Quick reference

- **Diagrams**: Repo = source of truth (Mermaid in markdown or `.mmd`). ContextStream = indexes and searches them; label and link from READMEs.
- **PRD ≈ plans + decisions**: Capture product “what/why” as decisions and optionally a plan with steps; link to `docs/product/`.
- **Docs**: Repo = canonical. ContextStream = index + memory; use Related/Implements and stable doc IDs (PRD-XXX, ADR-XXX, TP-XXX) so metadata and search relate content.
- **Lessons**: ContextStream only (capture_lesson); repo guides stay procedural.
- **To-dos**: Repo = checklist; ContextStream = tasks/reminders for AI-aware follow-up.

---

## 2. Leveraging the ContextStream Graph

ContextStream’s **graph** builds relationships between code and decisions. Use it so the AI can answer “what depends on X?” and “what breaks if I change Y?”.

### What to do in this repo

1. **Index the project**  
   Run **project(action="ingest_local")** (or equivalent) so ContextStream has the repo (code + docs). Do this after clone or when you add major new areas (e.g. a new app or `docs/` section).

2. **Use dependency and impact tools**  
   When refactoring or designing:
   - **graph(action="dependencies", ...)** — “What does this module/file depend on?”
   - **graph(action="impact", target="...")** — “What breaks if I change this?”

3. **Full graph (Elite/Team)**  
   If you have Full Graph, **graph(action="ingest")** builds module/call/dataflow/type layers. Run when you want richer impact analysis; document in the dev guide that “full graph ingest” is optional and tier-dependent.

4. **Link decisions to code**  
   When you capture a **decision** in ContextStream, include the **file path** or **module name** (e.g. `apps/api`, `docs/architecture/decisions/001-cloudflare-stack.md`) in the content. That helps ContextStream associate “this decision” with “this part of the repo” in the graph.

### Where this is documented

- [Development guide – AI tooling](development.md#ai-tooling-optional): setup and one-time bootstrap.
- This section: graph usage (ingest_local, dependencies, impact, optional full ingest).

---

## 3. Tagging and Labeling for Better ContextStream Metadata

ContextStream indexes file content and builds metadata from structure and links. Tag and relate content so search and graph work well.

### Do in the repo

| Practice | Purpose |
|----------|---------|
| **Stable document IDs** | Use **PRD-XXX**, **ADR-XXX**, **TP-XXX** (or **HLD**, **Tech Plan**) in titles and in **Related** / **Implements** so ContextStream can associate “ADR-001” with a path and with other docs. |
| **Related / Implements in every doc** | Every PRD, ADR, tech plan, and key guide should list **Related** (and **Implements** for tech plans). Same links you use for humans help ContextStream relate nodes. |
| **Index READMEs** | Each major area (`docs/architecture/`, `docs/product/`, `docs/tech-plans/`, etc.) should have a README that lists documents and diagrams with short descriptions. ContextStream indexes these; they become “hubs” that connect sections. |
| **Diagram labels** | For Mermaid or `.mmd` files, use a clear heading or filename (e.g. `system-overview.mmd`, “## System Overview Diagram”). Reference them from the architecture README (or design README) so “diagram” content is discoverable. |
| **Cross-links between related areas** | Link PRD → HLD → Tech Plan → API docs (and back) so that when ContextStream indexes, “related” content is one hop away. |

### Optional: explicit labels in doc body

If you want even clearer “types” for recall, you can add a single line at the top of key docs (after the title), for example:

```markdown
**Doc type**: ADR | **ID**: ADR-001 | **Related**: [Phase 1 scope](../product/phase-1-mvp-scope.md), [HLD](../architecture/high-level-design.md)
```

This is optional; the main gain is from **Related** / **Implements** and consistent IDs in titles.

### What not to do

- Do not duplicate full doc text into ContextStream memory; point to paths.
- Do not use ContextStream as the only place for “what we decided”; the repo (ADRs, tech plans) remains the source of truth; ContextStream is for search and session context.

---

## 4. ContextStream tool reference

This repo relies on the following ContextStream MCP tools (consolidated domain tools, v0.4.x). If the MCP server API changes, update this reference and the ContextStream rule.

| Tool / action | Purpose |
|---------------|---------|
| **session_init** | Add session in ContextStream; pass repo folder path and short context hint. Call at start of each new session. |
| **context_smart** | Load project context (and relevant lessons) for the current message. Call after session_init. |
| **search** | Code/docs search; use `mode=hybrid` or `mode=semantic`. Prefer before Grep/Read. |
| **session** | `action=capture` (event_type=decision|implementation|task|…), `action=recall`, `action=get_lessons`, `action=capture_lesson`. |
| **project** | `action=ingest_local` — index the repo (code + docs). Run once after clone or first use; repeat after major changes. |
| **graph** | `action=dependencies`, `action=impact` (target=…), `action=ingest` (full graph, Elite/Team). Use before refactors. |
| **memory** | `action=create_task` for tasks tied to a plan; use with reminder for “do this before deploy”. |

See [ContextStream MCP docs](https://contextstream.io/docs/mcp/tools) for full tool catalog and parameters.

---

## 5. Summary

- **Diagrams** = Mermaid / `.mmd` in repo; ContextStream indexes them—use consistent labels and README links.
- **PRD** ≈ ContextStream **plans** + **decisions**; capture key product decisions and optional plans; link to `docs/product/`.
- **Technical docs** = canonical in repo; use **Related** / **Implements** and doc IDs so ContextStream can relate content.
- **Lessons** = ContextStream **capture_lesson** only; keep how-to in `docs/guides/`.
- **To-dos** = repo checklist + ContextStream **tasks** / **reminders** for AI-aware follow-up.
- **Graph**: run **project(ingest_local)** and use **graph(dependencies, impact)**; optionally **graph(ingest)** for full graph; link decisions to file/module paths.
- **Tagging**: stable IDs (PRD-XXX, ADR-XXX, TP-XXX), Related/Implements, index READMEs, diagram labels, cross-links so ContextStream can build useful metadata and relate content.
- **Tool reference**: See [section 4](#4-contextstream-tool-reference) for the tools this repo uses (session_init, context_smart, search, session, project, graph, memory); update if the MCP server API changes.
