---
name: cursor-project-docs
description: Defines how the repository is documented - maintains GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG), product requirements (PRDs), high-level design (HLD), tech plans (detailed implementation specs), and populates Cursor's doc section from those. Use when the user asks to document the repo, create PRDs, create tech plans, update repo docs, refresh the doc section, or apply documentation best practices.
---

# Cursor Project Docs

## Quick Start

Use this skill when the user asks to **document the repo**, **create PRDs**, **create tech plans**, **create/refactor design docs**, **update repo docs**, **refresh the doc section**, **populate Cursor docs**, or apply **documentation best practices**.

**Flow**: (1) Start with PRDs to define product requirements. (2) Create HLD for system architecture. (3) Create Tech Plans for implementation details. (4) Populate Cursor's doc section (`.cursor/docs/`) for indexing context.

**Documentation metadata tables**: **Agents must create and maintain tables** for all key docs. When you add, rename, move, or update any PRD, ADR, tech plan, or key guide, update the corresponding table in [docs/documentation-index.md](../../../docs/documentation-index.md). That file is the single source of truth for doc IDs, paths, Implements, and Related. Keep area READMEs ([product/README](../../../docs/product/README.md), [tech-plans/README](../../../docs/tech-plans/README.md), [architecture/README](../../../docs/architecture/README.md)) in sync with those tables where they list the same docs.

**Labels as code:** Repository labels are defined in [.github/labels.yml](../../../.github/labels.yml) and synced by [.github/workflows/sync-repo-labels.yml](../../../.github/workflows/sync-repo-labels.yml). To add or change labels, edit `.github/labels.yml` in a PR and merge; the workflow creates or updates repo labels. Do not create labels manually in GitHub Settings when this file exists.

**Evaluate process when docs change:** When you create or **significantly modify** documentation (new or updated PRD, ADR, tech plan, or key guide), **use this skill** to evaluate and update as needed: (1) [docs/documentation-index.md](../../../docs/documentation-index.md) tables, (2) **labels-as-code** — if a new PRD or tech plan (or new doc IDs) are used for traceability, add corresponding entries to `.github/labels.yml` so PRs can be tagged, (3) PR template and canned PR descriptions (e.g. [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md), [.github/PR_DESCRIPTION_SIMHUB_PLUGIN.md](../../../.github/PR_DESCRIPTION_SIMHUB_PLUGIN.md)) if doc IDs or scope change.

**Consistency**: Apply the [Consistency checklist](#consistency-checklist-when-creating-or-updating-docs) for every new or updated PRD, ADR, tech plan, or key guide (Related/Implements, optional Doc type | ID, bootstrap table, diagram READMEs). Align to [documentation-standards](../../../docs/standards/documentation-standards.md).

**ContextStream (when available):** Before creating or editing docs, use ContextStream `search` to find related PRDs, ADRs, tech plans. After adding or updating a key doc (PRD, ADR, tech plan), capture a short decision in ContextStream with title and path. If it's a key decision, add it to "Suggested decisions to capture" in [docs/guides/development.md](../../../docs/guides/development.md#optional-one-time-bootstrap). See [ContextStream mapping](../../../docs/guides/contextstream-mapping.md).

## Scope

- **In scope**: How we document the repository — GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG, etc.), product requirements (PRDs), high-level design (HLD), tech plans (implementation specs), populating `.cursor/docs/` from them, and the **labels-as-code process** ([.github/labels.yml](../../../.github/labels.yml) and [sync-repo-labels](../../../.github/workflows/sync-repo-labels.yml)) when doc changes affect traceability or PR labeling.
- **Out of scope**: Change control, branch protection, secret hygiene (see github-change-control skill); Cursor Settings/Indexing UI; modifying `.cursorignore` unless the user asks.

## Best-Practices Sources

When writing or updating repo docs, consult and apply practices from:

- **Canonical standard**: [docs/standards/documentation-standards.md](../../../docs/standards/documentation-standards.md) — folder structure, metadata, Related/Implements, naming, ContextStream-friendly structure. All new or updated docs must align to this.
- **GitHub docs**: Repository best practices, about README, contributing guidelines, security policy. See [reference.md](reference.md) for curated links.
- **Technical design docs**: PRD → HLD → Tech Plan workflow, GitLab architecture workflow, Microsoft engineering playbook. See [reference.md](reference.md) for curated links.
- **Other reputable sources**: Open-source documentation guides or standards referenced in reference.md.

Do not invent documentation structure; align to the canonical standard, GitHub conventions, and the referenced best practices.

## Documentation Hierarchy

The documentation follows a clear progression from product requirements to implementation:

```
PRD (Product Requirements) → HLD (Architecture) → Tech Plans (Implementation)
```

### 1. PRD (Product Requirements Document)

**Purpose**: Define WHAT we're building and WHY before any technical design.

**Audience**: Product managers, stakeholders, designers, engineers
**Scope**: User needs, business goals, feature requirements, success criteria
**Content**:
- Problem statement and user pain points
- Target users and personas
- Feature requirements (functional and non-functional)
- User stories and acceptance criteria
- Success metrics and KPIs
- Constraints and assumptions
- Out of scope items

**Created by**: Product managers, with input from stakeholders
**When**: FIRST, before any technical design work begins

### 2. HLD (High-Level Design)

**Purpose**: Define HOW the system will be architected at a conceptual level.

**Audience**: Architects, tech leads, senior engineers, stakeholders
**Scope**: System-wide architecture, component interactions, technology choices
**Content**:
- Architecture diagrams and system overview
- Component responsibilities and interactions
- Technology stack decisions (with rationale)
- Data flow and integration patterns
- Security architecture (principles)
- Non-functional requirements (scalability, performance, availability)
- Deployment strategy (high-level)
- Risk analysis

**Created by**: Solution architects, tech leads
**When**: AFTER PRD is approved, before implementation planning

### 3. Tech Plans (Implementation Specs)

**Purpose**: Define HOW each component will be implemented in detail.

**Audience**: Developers, implementers, code reviewers
**Scope**: Component-specific implementation details
**Content**:
- Detailed class/module structures
- API endpoint specifications with schemas
- Database schemas and entity relationships
- Detailed sequence diagrams
- Algorithm specifications
- Error handling strategies
- Testing strategies
- Code-level decisions and patterns

**Created by**: Engineers, developers
**When**: AFTER HLD is approved, before coding begins

**Note**: "Tech Plans" is our preferred terminology for what is traditionally called "Low-Level Design (LLD)" or "Detailed Design Documents."

### Documentation Folder Structure

Organize documentation in `docs/` per [documentation-standards](../../../docs/standards/documentation-standards.md):

```
docs/
├── product/                      # PRDs (phase-1-mvp-scope.md, {feature-area}/)
├── architecture/                 # HLD, decisions/ (ADRs), diagrams/ (system-overview.mmd, data-flow.mmd), next-steps.md
├── tech-plans/                   # Tech plans by feature-area (e.g. telemetry-proof-system/)
├── design/                       # Component LLDs: components/, data-models/, integrations/, diagrams/ (entity-relationship.mmd)
├── api/                          # API README, openapi.yaml (all endpoints; Swagger at /api-docs), authentication.md, plugin.md, user-profile.md. Each Worker endpoint must be in openapi.yaml; smoke test ensures API documentation loads.
├── guides/                       # development.md, deployment.md, contextstream-mapping.md
├── standards/                    # documentation-standards.md (canonical)
└── brand/                        # design-system.md
```

**Key principles**:
- PRDs in `docs/product/` — ALWAYS create these FIRST
- HLD in `docs/architecture/` — system-wide architecture, created AFTER PRD approval
- Tech Plans in `docs/tech-plans/{feature-area}/` — implementation specs, created AFTER HLD approval
- Component LLDs in `docs/design/` (components/, data-models/, integrations/)
- Diagrams in `docs/architecture/diagrams/` and `docs/design/diagrams/` — list in READMEs; link from architecture README and from database-schema to entity-relationship.mmd
- Every PRD, ADR, tech plan must have **Related** (and **Implements** for tech plans); optional **Doc type | ID | Related** line at top
- Use `README.md` as index for each subdirectory

### Document Creation Workflow

```
1. PRD Phase
   └── Create PRD in docs/product/
   └── Get stakeholder approval
   └── PRD defines WHAT and WHY

2. HLD Phase
   └── Create HLD in docs/architecture/
   └── Reference PRD requirements
   └── Get architecture approval
   └── HLD defines HOW at system level

3. Tech Plan Phase
   └── Create Tech Plans in docs/tech-plans/
   └── Reference HLD components
   └── Get engineering approval
   └── Tech Plans define HOW at code level

4. Implementation
   └── Code follows Tech Plans
   └── PRD acceptance criteria guide testing
```

## GitHub Docs Workflow

1. **Identify** which GitHub repo docs are needed:
   - README (what the project does, why it's useful, how to get started, where to get help, who maintains).
   - CONTRIBUTING (how to contribute; GitHub surfaces this on PR/issue creation).
   - SECURITY (how to report vulnerabilities; supported versions; GitHub links this from the Security tab).
   - CHANGELOG (user-visible changes over time).
   - Optional: LICENSE, CODE_OF_CONDUCT, SUPPORT; docs in `docs/` or `.github/` per GitHub conventions.

2. **Place** files per GitHub: root, `docs/`, or `.github/` as appropriate (see GitHub docs for each file type).

3. **Write or update** using the structure and audience guidance from the best-practices sources. Keep language and structure consistent across GitHub docs.

4. **Checklist** before finishing:
   - [ ] README reflects current usage, setup, and pointers.
   - [ ] CONTRIBUTING describes branching, PR, review, and testing expectations.
   - [ ] SECURITY includes supported versions and vulnerability reporting.
   - [ ] CHANGELOG captures user-visible changes when applicable.

## Populate Cursor Doc Section

After (or alongside) GitHub docs and technical docs are in place, use their content to populate **`.cursor/docs/`** (Cursor's doc section for Indexing and Docs):

1. **Derive** from GitHub docs and `docs/`: summaries, index, key excerpts — not full duplicate prose unless necessary.
2. **Suggested files** in `.cursor/docs/`:
   - `index.md`: Short repo summary, links to README, CONTRIBUTING, SECURITY, CHANGELOG, and key technical docs; high-level entry points.
   - `architecture.md` (optional): High-level structure summary from `docs/architecture/`; main modules and entry points.
   - `conventions.md` (optional): Key conventions from CONTRIBUTING (branching, PR, style).
   - `stack.md` (optional): Technology stack summary (framework, language, infrastructure choices).
3. **Keep** `.cursor/docs/` concise so Cursor indexing gets useful context without redundancy. Prefer pointers to canonical docs over long copy-paste.

**Checklist** for doc section:
- [ ] `.cursor/docs/index.md` exists and summarizes the repo and links to GitHub docs and technical docs.
- [ ] Content in `.cursor/docs/` does not contradict GitHub docs or technical docs; it extends or summarizes them.
- [ ] Architecture summary in `.cursor/docs/architecture.md` points to detailed `docs/architecture/` for full context.

## Refactoring Existing Docs to PRD → HLD → Tech Plan

When existing documentation doesn't follow the PRD → HLD → Tech Plan hierarchy:

### If starting with an HLD that's too detailed:

1. **Extract PRD content**: User stories, acceptance criteria, feature requirements → `docs/product/`
2. **Keep HLD content**: Architecture diagrams, component responsibilities, technology choices → `docs/architecture/`
3. **Move to Tech Plans**: API specs, database schemas, detailed sequences, code patterns → `docs/tech-plans/`

### Content classification guide:

| Content Type | Belongs In |
|-------------|-----------|
| User stories, acceptance criteria | PRD |
| Business requirements, success metrics | PRD |
| Feature descriptions (user-facing) | PRD |
| System architecture diagrams | HLD |
| Component responsibilities | HLD |
| Technology stack decisions | HLD |
| Non-functional requirements | HLD |
| API endpoint specifications | Tech Plan |
| Database schemas | Tech Plan |
| Detailed sequence diagrams | Tech Plan |
| Class/module structures | Tech Plan |
| Algorithm specifications | Tech Plan |

### Maintain traceability:

- Each HLD section should reference which PRD requirements it addresses
- Each Tech Plan should reference which HLD component it implements
- Use consistent naming: `PRD-001`, `HLD-001`, `TP-001` for cross-references

## Documentation consistency (canonical)

To keep documentation consistent across the repo and with ContextStream:

1. **Canonical standard**: [docs/standards/documentation-standards.md](../../../docs/standards/documentation-standards.md) defines folder structure, metadata (Status, Version, Date, Owner), **Related** / **Implements**, naming (PRD-XXX, ADR-XXX, TP-XXX), and ContextStream-friendly structure. All new or updated docs must align.

2. **Every PRD, ADR, tech plan**: Include **Related** in the metadata (and **Implements** for tech plans). Optionally add a single line after the title: `**Doc type**: ADR | **ID**: ADR-001 | **Related**: [links]`. See existing ADRs and [contextstream-mapping](../../../docs/guides/contextstream-mapping.md#3-tagging-and-labeling-for-better-contextstream-metadata).

3. **New key decisions**: When adding a new ADR or product decision that should be recalled by AI, add it to the "Suggested decisions to capture" table in [docs/guides/development.md](../../../docs/guides/development.md#optional-one-time-bootstrap) so ContextStream bootstrap stays in sync.

4. **Diagrams**: Place Mermaid `.mmd` files in `docs/architecture/diagrams/` or `docs/design/diagrams/`. List them in the diagram folder README; add direct links from [docs/architecture/README.md](../../../docs/architecture/README.md#diagrams). For the D1 schema, link from [database-schema.md](../../../docs/design/data-models/database-schema.md) to `entity-relationship.mmd`.

5. **Plans and roadmaps**: For next-steps or implementation roadmaps, use ContextStream `session(action="capture_plan", ...)` so the plan appears in ContextStream; reference the repo doc path in the plan description.

## ContextStream parallels (optional)

When ContextStream MCP is enabled, repo docs map to ContextStream memory for better AI context:

| Repo | ContextStream | Usage |
|------|---------------|--------|
| **PRD** | Plans + decisions | Capture key product decisions as `event_type="decision"`; optional `capture_plan` with steps; link content to `docs/product/`. |
| **ADR / Tech Plan** | Decisions + implementation | After writing/updating an ADR or tech plan, capture a short decision (title + path to doc). If it's a key decision, add to development.md "Suggested decisions to capture" table. |
| **Technical docs** | Indexed repo + memory | Use **Related** / **Implements** and stable IDs (PRD-XXX, ADR-XXX, TP-XXX) in every doc so ContextStream can relate content. |
| **Diagrams** (Mermaid, .mmd) | Indexed + decision | Place in architecture/diagrams/ or design/diagrams/; list in READMEs. Optionally capture a decision that references diagram paths so they surface in context_smart. |
| **Lessons** (mistakes) | ContextStream only | Use `capture_lesson` for "don't repeat this"; keep procedures in `docs/guides/`. |
| **To-dos / tasks** | Tasks + reminders | Repo checklist = human source; ContextStream tasks/reminders or `capture_plan` for roadmaps. |

See [ContextStream mapping](../../../docs/guides/contextstream-mapping.md) for full parallels, graph usage (ingest_local, dependencies, impact), and tagging guidance.

## Documentation metadata tables (agents: create and maintain)

**Single source of truth**: [docs/documentation-index.md](../../../docs/documentation-index.md) contains canonical **tables** for PRDs, Tech Plans, ADRs, key guides, and design docs (ID, Title, Path, Implements, Related).

**When you create or update docs:**
- **New PRD, ADR, tech plan, or key guide** → Add or update the corresponding row in the appropriate table in `docs/documentation-index.md`.
- **Rename, move, or deprecate a doc** → Update the table row (path, title, Related/Implements).
- **Change Related/Implements in a doc** → Update the table row to match.
- **Area READMEs** (product, tech-plans, architecture) that list the same docs should stay in sync with these tables.

This keeps traceability and ContextStream mapping consistent and gives agents one place to look for all documentation metadata.

## Labels as code (GitHub)

Repository labels are **defined as code** so they can be created or updated by pull request:

- **Source of truth:** [.github/labels.yml](../../../.github/labels.yml) — each entry: `name`, `color` (hex without `#`), optional `description`. Bootstrapped 1:1 from [docs/documentation-index.md](../../../docs/documentation-index.md) (one label per PRD, tech plan, ADR with a stable ID).
- **Sync:** [.github/workflows/sync-repo-labels.yml](../../../.github/workflows/sync-repo-labels.yml) runs on push to the default branch when `.github/labels.yml` (or the workflow) changes and creates/updates repo labels via the GitHub API.
- **To add or change labels:** Edit `.github/labels.yml` in a PR and merge; the workflow will create or update the labels. Do not rely on manually creating labels in GitHub Settings when this file exists.
- **When you add or significantly change a PRD or tech plan** that is used for PR traceability, evaluate whether new label entries are needed in `.github/labels.yml` (e.g. `prd-PRD-XXX`, `tech-plan-TP-XXX`, `adr-ADR-XXX`) and add them so the [pr-labels](../../../.github/workflows/pr-labels.yml) workflow can apply them to PRs.

## Consistency checklist (when creating or updating docs)

Before finishing any new or updated PRD, ADR, tech plan, or key guide:

- [ ] **Documentation index tables**: Add or update the row in [docs/documentation-index.md](../../../docs/documentation-index.md) for this doc (PRD, Tech Plan, ADR, or key guide table).
- [ ] **Evaluate process:** When documentation is created or modified in a significant way, evaluate and update as needed: documentation-index tables (above); [.github/labels.yml](../../../.github/labels.yml) for new PRDs/tech plans used for traceability; [PR template](../../../.github/PULL_REQUEST_TEMPLATE.md) and canned PR descriptions if doc IDs or scope change.
- [ ] **Labels as code:** If the change introduces or renames a PRD or tech plan ID used for traceability, add or update the corresponding label entry in [.github/labels.yml](../../../.github/labels.yml).
- [ ] **Related** (and **Implements** for tech plans) in metadata; stable IDs (PRD-XXX, ADR-XXX, TP-XXX) in title.
- [ ] Optional **Doc type | ID | Related** line at top of key docs (see [contextstream-mapping](../../../docs/guides/contextstream-mapping.md#3-tagging-and-labeling-for-better-contextstream-metadata)).
- [ ] If adding a new key decision (ADR or product decision): add a row to "Suggested decisions to capture" in [docs/guides/development.md](../../../docs/guides/development.md#optional-one-time-bootstrap).
- [ ] If adding a diagram: place in `docs/architecture/diagrams/` or `docs/design/diagrams/`; add to folder README; add link from architecture README (or from database-schema to entity-relationship.mmd).
- [ ] Folder and file names align to [documentation-standards](../../../docs/standards/documentation-standards.md).

## Anti-Patterns

- **Do not skip PRDs**: Always define WHAT before HOW. Technical design without product requirements leads to building the wrong thing.
- **Do not mix abstraction levels**: Keep PRDs, HLDs, and Tech Plans separate. Each has a different audience and purpose.
- **Do not start coding before Tech Plans**: Implementation details should be documented before coding begins.
- **Do not invent documentation structure**: Align to the canonical standard and PRD → HLD → Tech Plan workflow.
- **Do not duplicate content**: Use links and references to maintain single source of truth.
- **Do not omit Related/Implements**: Every PRD, ADR, and tech plan must list Related (and Implements for tech plans).
- **Do not populate `.cursor/docs/` with content that contradicts canonical docs**.

## Additional Resources

- Templates and layouts: [examples.md](examples.md)
- Curated links to GitHub docs and other reputable sources: [reference.md](reference.md)
