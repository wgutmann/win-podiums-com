---
name: cursor-project-docs
description: Defines how the repository is documented - maintains GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG), product requirements (PRDs), high-level design (HLD), tech plans (detailed implementation specs), and populates Cursor's doc section from those. Use when the user asks to document the repo, create PRDs, create tech plans, update repo docs, refresh the doc section, or apply documentation best practices.
---

# Cursor Project Docs

## Quick Start

Use this skill when the user asks to **document the repo**, **create PRDs**, **create tech plans**, **create/refactor design docs**, **update repo docs**, **refresh the doc section**, **populate Cursor docs**, or apply **documentation best practices**.

**Flow**: (1) Start with PRDs to define product requirements. (2) Create HLD for system architecture. (3) Create Tech Plans for implementation details. (4) Populate Cursor's doc section (`.cursor/docs/`) for indexing context.

**ContextStream (when available):** Before creating or editing docs, use ContextStream `search` to find related PRDs, ADRs, tech plans. After adding or updating a key doc (PRD, ADR, tech plan), capture a short decision in ContextStream with title and path (e.g. "Added ADR-001" → `docs/architecture/decisions/001-cloudflare-stack.md`). See [ContextStream mapping](../../../docs/guides/contextstream-mapping.md).

## Scope

- **In scope**: How we document the repository — GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG, etc.), product requirements (PRDs), high-level design (HLD), tech plans (implementation specs), and populating `.cursor/docs/` from them.
- **Out of scope**: Change control, branch protection, secret hygiene (see github-change-control skill); Cursor Settings/Indexing UI; modifying `.cursorignore` unless the user asks.

## Best-Practices Sources

When writing or updating repo docs, consult and apply practices from:

- **GitHub docs**: Repository best practices, about README, contributing guidelines, security policy. See [reference.md](reference.md) for curated links.
- **Technical design docs**: PRD → HLD → Tech Plan workflow, GitLab architecture workflow, Microsoft engineering playbook. See [reference.md](reference.md) for curated links.
- **Other reputable sources**: Open-source documentation guides or standards referenced in reference.md.

Do not invent documentation structure; align to GitHub conventions, industry design doc practices, and the referenced best practices.

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

Organize documentation in `docs/` with clear separation by document type:

```
docs/
├── product/                      # Product Requirements Documents (PRDs)
│   ├── README.md                 # PRD index and overview
│   ├── phase-1-mvp-scope.md      # Phase / feature scope
│   └── {feature-area}/           # Feature-specific PRDs (e.g. telemetry-proof-system/)
├── architecture/                 # High-Level Design (HLD)
│   ├── README.md                 # Architecture overview and index
│   ├── high-level-design.md      # System-wide HLD
│   ├── decisions/                # Architecture Decision Records (ADRs)
│   │   ├── 001-cloudflare-stack.md
│   │   └── 002-discord-oauth.md
│   └── diagrams/                 # Mermaid or image files
│       └── system-overview.mmd
├── tech-plans/                   # Tech Plans (Implementation Specs)
│   ├── README.md                 # Tech plans index
│   ├── components/               # Component-specific tech plans
│   │   ├── simhub-plugin.md
│   │   ├── web-frontend.md
│   │   └── api-workers.md
│   ├── data-models/              # Database schemas, entities
│   │   └── database-schema.md
│   └── integrations/             # Integration-specific tech plans
│       ├── discord-integration.md
│       └── simhub-telemetry.md
├── api/
│   ├── README.md                 # API overview
│   ├── authentication.md         # Auth endpoints
│   ├── plugin.md                 # Plugin endpoints
│   └── user-profile.md           # Profile endpoints
├── guides/
│   ├── development.md            # Developer setup
│   ├── deployment.md             # Deployment guide
│   └── troubleshooting.md        # Common issues
└── brand/
    ├── design-system.md          # Visual design guidelines
    └── ux-patterns.md            # UX interaction patterns
```

**Key principles**:
- PRDs in `docs/product/` — ALWAYS create these FIRST
- HLD in `docs/architecture/` — system-wide architecture, created AFTER PRD approval
- Tech Plans in `docs/tech-plans/` — implementation details, created AFTER HLD approval
- API specs in `docs/api/` — interface contracts (can be part of tech plans)
- Guides in `docs/guides/` — how-to, procedural
- Keep each file focused on one subject
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

## ContextStream parallels (optional)

When ContextStream MCP is enabled, repo docs map to ContextStream memory for better AI context:

| Repo | ContextStream | Usage |
|------|---------------|--------|
| **PRD** | Plans + decisions | Capture key product decisions as `event_type="decision"`; optional `capture_plan` with steps; link content to `docs/product/`. |
| **ADR / Tech Plan** | Decisions + implementation | After writing/updating an ADR or tech plan, capture a short decision (title + path to doc). |
| **Technical docs** | Indexed repo + memory | Use **Related** / **Implements** and stable IDs (PRD-XXX, ADR-XXX, TP-XXX) in every doc so ContextStream can relate content. |
| **Diagrams** (Mermaid, .mmd) | Indexed as file content | Use consistent headings/filenames and link from READMEs (e.g. architecture README) so diagram content is discoverable. |
| **Lessons** (mistakes) | ContextStream only | Use `capture_lesson` for "don't repeat this"; keep procedures in `docs/guides/`. |
| **To-dos / tasks** | Tasks + reminders | Repo checklist = human source; ContextStream tasks/reminders for AI-aware follow-up. |

See [ContextStream mapping](../../../docs/guides/contextstream-mapping.md) for full parallels, graph usage (ingest_local, dependencies, impact), and tagging guidance.

## Anti-Patterns

- **Do not skip PRDs**: Always define WHAT before HOW. Technical design without product requirements leads to building the wrong thing.
- **Do not mix abstraction levels**: Keep PRDs, HLDs, and Tech Plans separate. Each has a different audience and purpose.
- **Do not start coding before Tech Plans**: Implementation details should be documented before coding begins.
- **Do not invent documentation structure**: Align to the PRD → HLD → Tech Plan workflow.
- **Do not duplicate content**: Use links and references to maintain single source of truth.
- **Do not populate `.cursor/docs/` with content that contradicts canonical docs**.

## Additional Resources

- Templates and layouts: [examples.md](examples.md)
- Curated links to GitHub docs and other reputable sources: [reference.md](reference.md)
