---
name: cursor-project-docs
description: Defines how the repository is documented - maintains GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG), technical design docs (HLD, LLD, API specs), and populates Cursor's doc section from those. Use when the user asks to document the repo, create/refactor design docs, separate HLD from LLD, update repo docs, refresh the doc section, or apply documentation best practices.
---

# Cursor Project Docs

## Quick Start

Use this skill when the user asks to **document the repo**, **create/refactor design docs**, **separate HLD from LLD**, **update repo docs**, **refresh the doc section**, **populate Cursor docs**, or apply **documentation best practices**.

**Flow**: (1) Maintain GitHub repo docs and technical design docs using best practices. (2) Organize technical design documentation by audience and abstraction level. (3) Use those docs to populate Cursor's doc section (`.cursor/docs/`) so Cursor's Indexing and Docs has the same context.

## Scope

- **In scope**: How we document the repository — GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG, etc.), technical design documentation (HLD, LLD, API specs), and populating `.cursor/docs/` from them.
- **Out of scope**: Change control, branch protection, secret hygiene (see github-change-control skill); Cursor Settings/Indexing UI; modifying `.cursorignore` unless the user asks.

## Best-Practices Sources

When writing or updating repo docs, consult and apply practices from:

- **WinPodiums Documentation Standards**: Primary standard for all documentation. See [docs/standards/documentation-standards.md](../../docs/standards/documentation-standards.md) for complete standards.
- **WHOOP Engineering Standards**: Inspiration for automation, discoverability, standardization, and collaboration. See [reference.md](reference.md) for WHOOP resources.
- **GitHub docs**: Repository best practices, about README, contributing guidelines, security policy. See [reference.md](reference.md) for curated links.
- **Technical design docs**: HLD vs LLD separation, GitLab architecture workflow, Microsoft engineering playbook. See [reference.md](reference.md) for curated links.

**Primary Standard**: Follow [WinPodiums Documentation Standards](../../docs/standards/documentation-standards.md) for all new documentation. This standard incorporates WHOOP principles of automation, discoverability, standardization, and collaboration.

## Technical Design Documentation

### HLD vs LLD Separation

**High-Level Design (HLD)**:
- **Audience**: Stakeholders, architects, product managers, senior engineers
- **Scope**: System-wide architecture, component interactions, technology choices
- **Content**: Architecture diagrams, data flow, integration patterns, design principles, non-functional requirements (scalability, security, performance)
- **Abstraction**: High-level, conceptual
- **Created by**: Solution architects, tech leads

**Low-Level Design (LLD)**:
- **Audience**: Developers, implementers
- **Scope**: Component-specific implementation details
- **Content**: Class diagrams, API specs, data models, algorithms, database schemas, detailed sequence diagrams, code-level decisions
- **Abstraction**: Detailed, implementation-focused
- **Created by**: Developers, engineers

### Technical Docs Folder Structure

Organize technical design documentation in `docs/` following WHOOP-inspired standards:

```
docs/
├── product/                      # Product Requirements Documents (PRDs)
│   ├── README.md                 # PRD index
│   └── {feature-area}/          # Feature-specific PRDs
│       ├── 001-feature-name.md
│       └── 002-feature-name.md
├── tech-plans/                  # Technical Plans (LLD/Implementation)
│   ├── README.md                 # Technical Plans index
│   └── {feature-area}/          # Feature-specific Technical Plans
│       ├── 001-feature-name.md
│       └── 002-feature-name.md
├── architecture/                 # Architecture documentation
│   ├── README.md                 # Architecture overview and index
│   ├── high-level-design.md      # System-wide HLD
│   ├── decisions/                # Architecture Decision Records (ADRs)
│   │   ├── 001-cloudflare-stack.md
│   │   └── 002-discord-oauth.md
│   └── diagrams/                 # Mermaid or image files
│       └── system-overview.mmd
├── design/                       # Component-level design (Legacy - migrating to tech-plans)
│   ├── README.md                 # Design docs index
│   ├── components/               # Component-specific LLD
│   ├── data-models/              # Database schemas, entities
│   └── integrations/             # Integration-specific LLD
├── api/                          # API documentation
│   ├── README.md                 # API overview
│   ├── authentication.md         # Auth endpoints
│   ├── plugin.md                 # Plugin endpoints
│   └── user-profile.md           # Profile endpoints
├── guides/                       # How-to guides
│   ├── development.md            # Developer setup
│   ├── deployment.md             # Deployment guide
│   └── troubleshooting.md        # Common issues
├── brand/                        # Brand guidelines
│   ├── design-system.md          # Visual design guidelines
│   └── ux-patterns.md            # UX interaction patterns
└── standards/                    # Documentation standards
    └── documentation-standards.md # WHOOP-inspired standards
```

**Key principles** (WHOOP-inspired):
- **PRDs** in `docs/product/` (what to build, why)
- **Technical Plans** in `docs/tech-plans/` (how to build it - LLD)
- **ADRs** in `docs/architecture/decisions/` (why decisions were made)
- **API specs** in `docs/api/` (interface contracts)
- **Guides** in `docs/guides/` (how-to, procedural)
- **Standards** in `docs/standards/` (documentation standards)
- Each directory has `README.md` as index
- Clear traceability: PRD → Technical Plan → Implementation
- Consistent naming: `{number}-{kebab-case-name}.md`

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

## Refactoring HLD to Separate LLD

When an HLD document contains too much implementation detail:

1. **Identify** content by abstraction level:
   - **Keep in HLD**: System overview, architecture diagrams, component responsibilities, high-level data flow, design principles, technology choices (with rationale), security architecture (principles), deployment strategy (high-level)
   - **Move to LLD**: API endpoint specs with schemas, detailed sequence diagrams, class structures, database table definitions, detailed auth flows, specific algorithms, implementation code snippets

2. **Create** LLD files in `docs/design/` organized by component or subject

3. **Update** HLD to reference LLD documents instead of including full detail

4. **Maintain** traceability: Each LLD should reference which HLD section it implements

## Anti-Patterns

- Do not invent documentation structure without aligning to GitHub conventions and referenced best practices.
- Do not populate `.cursor/docs/` with content that contradicts or bypasses the canonical GitHub docs or technical docs.
- Do not skip consulting best-practices sources when creating or updating GitHub repo docs.
- Do not mix HLD and LLD in a single document; separate by audience and abstraction level.
- Do not duplicate content; use links and references to maintain single source of truth.

## Documentation Standards

**Primary Standard**: [WinPodiums Documentation Standards](../../docs/standards/documentation-standards.md)

This standard incorporates WHOOP principles:
1. **Automation**: Documentation coupled with code changes
2. **Discoverability**: Centralized portal, clear structure, index files
3. **Standardization**: Uniform format, consistent sections, templates
4. **Collaboration**: Direct links, traceability, version control

### Document Types

- **PRD** (Product Requirements Document): What to build and why
- **Technical Plan** (Low-Level Design): How to build it
- **ADR** (Architecture Decision Record): Why decisions were made

### Required Metadata

All documents must include:
- **Status**: Draft | Review | Approved | Implemented | Deprecated
- **Version**: Semantic version (e.g., `1.0`)
- **Date**: ISO 8601 format (`YYYY-MM-DD`)
- **Owner**: Team or individual responsible
- **Related**: Links to related documents

## Additional Resources

- **Documentation Standards**: [docs/standards/documentation-standards.md](../../docs/standards/documentation-standards.md)
- Templates and layouts: [examples.md](examples.md)
- Curated links to GitHub docs and other reputable sources: [reference.md](reference.md)
