# Documentation Standards: WHOOP-Inspired

**Version**: 1.0  
**Last Updated**: 2026-01-31  
**Status**: Active

## Overview

This document defines the documentation standards for WinPodiums, inspired by WHOOP's engineering documentation practices. These standards ensure consistency, discoverability, and maintainability across all technical documentation.

## Core Principles

### 1. Automation & Coupling
- Documentation should be coupled with code changes
- API documentation generated from code annotations (OpenAPI/Swagger)
- Version-controlled documentation alongside code
- Automated validation and formatting checks

### 2. Discoverability
- Centralized documentation portal (single source of truth)
- Clear folder structure and naming conventions
- Index files (`README.md`) in each directory
- Search-friendly organization

### 3. Standardization
- Uniform format across all documentation types
- Consistent section structure
- Standardized metadata (status, version, date, owner)
- Template-driven creation

### 4. Collaboration
- Direct links to specific sections
- Clear traceability (PRD → Technical Plan → Implementation)
- Version history and change tracking
- Cross-references between related documents

## Documentation Types

### Product Requirements Documents (PRD)

**Purpose**: Define what to build and why  
**Audience**: Product managers, stakeholders, architects  
**Location**: `docs/product/{feature-area}/`

**Structure**:
```markdown
# PRD-XXX: [Feature Name]

**Status**: [Draft | Review | Approved | Deprecated]  
**Version**: [Semantic version]  
**Date**: [YYYY-MM-DD]  
**Owner**: [Team/Individual]  
**Related**: [Links to related PRDs, Technical Plans, ADRs]

## Overview
### Problem Statement
[What problem does this solve?]

### Solution
[High-level solution approach]

### Success Criteria
[Measurable success metrics]

## User Stories
[As a... I want... So that...]

## Requirements
### Functional Requirements
#### FR-001: [Requirement Name]
- **Priority**: [P0 Critical | P1 High | P2 Medium | P3 Low]
- **Description**: [What must be built]
- **Acceptance Criteria**:
  - [Measurable criteria]
  - [Measurable criteria]

### Non-Functional Requirements
#### NFR-001: [Requirement Name]
- **Priority**: [P0 Critical | P1 High | P2 Medium | P3 Low]
- **Description**: [Performance, security, reliability, etc.]
- **Acceptance Criteria**:
  - [Measurable criteria]

## Technical Constraints
[Technology limitations, platform constraints, etc.]

## Out of Scope
[What is explicitly not included]

## Dependencies
[Other PRDs, systems, or features this depends on]

## Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| [Risk] | [High/Medium/Low] | [High/Medium/Low] | [Mitigation strategy] |

## Success Metrics
[Quantifiable metrics for success]

## Related Documentation
[Links to Technical Plans, ADRs, API specs, etc.]
```

### Technical Plans (Low-Level Design)

**Purpose**: Define how to build it  
**Audience**: Developers, implementers  
**Location**: `docs/tech-plans/{feature-area}/`

**Structure**:
```markdown
# TP-XXX: [Feature Name]

**Status**: [Draft | Review | Approved | Implemented]  
**Version**: [Semantic version]  
**Date**: [YYYY-MM-DD]  
**Owner**: [Team/Individual]  
**Implements**: [PRD-XXX link]
**Related**: [Links to related Technical Plans, ADRs, API specs]

## Overview
[Brief summary of implementation approach]

## Architecture
### Component Diagram
[Mermaid diagram or link to diagram]

### Data Flow
[How data flows through the system]

## Implementation Details
### API Endpoints
[Endpoint specifications with request/response schemas]

### Data Models
[Database schemas, data structures]

### Algorithms
[Key algorithms or logic flows]

### Error Handling
[Error handling strategies]

## Testing Strategy
[Unit tests, integration tests, test scenarios]

## Deployment
[Deployment steps, configuration, rollback plan]

## Performance Considerations
[Performance targets, optimization strategies]

## Security Considerations
[Security measures, threat mitigation]

## Dependencies
[External libraries, services, internal dependencies]

## Risks & Mitigations
[Technical risks and how to address them]

## Success Criteria
[How to measure successful implementation]

## Related Documentation
[Links to PRD, ADRs, API specs, etc.]
```

### Architecture Decision Records (ADR)

**Purpose**: Document why architectural decisions were made  
**Audience**: Architects, tech leads, future developers  
**Location**: `docs/architecture/decisions/`

**Structure**: (Existing ADR format is good, maintain consistency)

## Folder Structure

```
docs/
├── product/                    # Product Requirements Documents
│   ├── README.md              # PRD index
│   └── {feature-area}/        # Feature-specific PRDs
│       ├── 001-feature-name.md
│       └── 002-feature-name.md
├── tech-plans/                # Technical Plans (LLD)
│   ├── README.md              # Technical Plans index
│   └── {feature-area}/        # Feature-specific Technical Plans
│       ├── 001-feature-name.md
│       └── 002-feature-name.md
├── architecture/              # Architecture documentation
│   ├── README.md              # Architecture index
│   ├── high-level-design.md   # System-wide HLD
│   └── decisions/             # ADRs
│       ├── 001-decision.md
│       └── 002-decision.md
├── api/                       # API documentation
│   ├── README.md              # API index
│   └── {service-name}.md     # Service-specific API docs
├── design/                    # Component-level design
│   ├── components/            # Component LLDs
│   ├── data-models/          # Database schemas
│   └── integrations/         # Integration LLDs
├── guides/                    # How-to guides
│   ├── development.md
│   ├── deployment.md
│   └── troubleshooting.md
└── standards/                # Documentation standards
    └── documentation-standards.md
```

## Naming Conventions

### Files
- **PRDs**: `{number}-{kebab-case-name}.md` (e.g., `001-heartbeat-system.md`)
- **Technical Plans**: `{number}-{kebab-case-name}.md` (e.g., `001-heartbeat-system.md`)
- **ADRs**: `{number}-{kebab-case-name}.md` (e.g., `001-cloudflare-stack.md`)
- **API Docs**: `{service-name}.md` (e.g., `plugin.md`, `authentication.md`)

### Document IDs
- **PRDs**: `PRD-{number}` (e.g., `PRD-001`)
- **Technical Plans**: `TP-{number}` (e.g., `TP-001`)
- **ADRs**: `ADR-{number}` (e.g., `ADR-001`)

## Metadata Standards

All documents must include:
- **Status**: Draft | Review | Approved | Implemented | Deprecated
- **Version**: Semantic version (e.g., `1.0`, `1.1`, `2.0`)
- **Date**: ISO 8601 format (`YYYY-MM-DD`)
- **Owner**: Team or individual responsible
- **Related**: Links to related documents

## Cross-Referencing

### PRD → Technical Plan
- PRD includes: `**Related**: [Technical Plan](../tech-plans/...)`
- Technical Plan includes: `**Implements**: [PRD-XXX](../product/...)`

### Technical Plan → ADR
- Technical Plan includes: `**Related**: [ADR-XXX](../architecture/decisions/...)`
- ADR includes: `**Related Decisions**: [Technical Plan](../tech-plans/...)`

### All → API Specs
- Documents reference API specs: `[API Specification](../../api/...)`

### ContextStream-friendly structure

Consistent IDs and cross-links help AI tools (e.g. [ContextStream](https://contextstream.io)) index and relate content. Use:

- **Stable document IDs** in titles and in Related/Implements: `PRD-XXX`, `ADR-XXX`, `TP-XXX`. Tech plan document titles should use the form **TP-XXX: [Feature Name]** (e.g. `# TP-001: Telemetry Heartbeat System`) so tools can associate the ID with the path.
- **Related / Implements** in every PRD, ADR, and Technical Plan so related docs are one hop away.
- **Optional one-line blurb** at the top of key docs (after the title) for clearer graph labeling. Example for a tech plan: `**Doc type**: Tech Plan | **ID**: TP-001 | **Implements**: [PRD-001](../product/.../001-feature.md) | **Related**: [TP-002](002-other.md), [API spec](../../api/plugin.md)`.
- **Index READMEs** in each major area that list documents and diagrams with short descriptions.
- **Diagram labels**: clear filenames or headings (e.g. `system-overview.mmd`, `## System Overview Diagram`) and links from the architecture or design README.

See [ContextStream mapping](../guides/contextstream-mapping.md) for full parallels (PRD↔plans, docs↔memory, lessons, to-dos), graph usage, and tagging.

## Index Files

Each directory must have a `README.md` that:
- Lists all documents in that directory
- Provides brief descriptions
- Links to related directories
- Includes a table of contents for easy navigation

**Documentation metadata tables (agents):** A single source of truth for all key docs is [documentation-index.md](../documentation-index.md). It contains **tables** for PRDs, Tech Plans, ADRs, key guides, and design docs (ID, Title, Path, Implements, Related). **Agents must create and maintain these tables** when adding or updating any PRD, ADR, tech plan, or key guide. Area READMEs (product, tech-plans, architecture) should stay in sync with those tables where they list the same docs.

## Version Control

- All documentation is version-controlled in Git
- Changes tracked through commit history
- Major version changes require explicit approval
- Deprecated documents marked but retained for history

## Review Process

1. **Draft**: Initial creation, work in progress
2. **Review**: Ready for team review, seeking feedback
3. **Approved**: Approved for implementation
4. **Implemented**: Feature implemented, document reflects reality
5. **Deprecated**: No longer relevant, kept for historical reference

## Automation

**Recommended (Doc check)**: We **recommend** adding a `doc-check` workflow under `.github/workflows/` to run on push/PR when `docs/`, key READMEs, or the workflow change:

- **Markdown lint**: Syntax and formatting for `docs/**/*.md`, root READMEs, plugin and Terraform READMEs (config: [.markdownlint.jsonc](../../.markdownlint.jsonc)).
- **Link check**: e.g. [lychee](https://github.com/lycheeverse/lychee-action) to validate links in those files; fail on broken links.
- **Mermaid diagrams**: Validate `.mmd` files in `docs/architecture/diagrams/` and `docs/design/diagrams/` so diagrams render.
- **OpenAPI**: Validate `docs/api/openapi.yaml` (Spectral, fail on error).

### Future Enhancements
- Automated PRD → Technical Plan → Implementation tracking
- API documentation generation from OpenAPI specs

## Examples

See:
- [Product (PRD) index](../product/README.md) and [Phase 1 scope](../product/phase-1-mvp-scope.md) for PRD structure
- [Tech plans index](../tech-plans/README.md) for Technical Plan structure
- [Architecture decisions](../architecture/decisions/) for ADR format (e.g. 001-cloudflare-stack.md)

Templates (prd-template, technical-plan-template, ADR template) can be added under `docs/product/`, `docs/tech-plans/`, and `docs/architecture/decisions/` when needed.

## Related Documentation

- [Cursor Project Docs Skill](../../.cursor/skills/cursor-project-docs/SKILL.md)
- [Documentation Examples](../../.cursor/skills/cursor-project-docs/examples.md)
- [WHOOP Engineering Blog](https://engineering.prod.whoop.com/tech-docs/)
