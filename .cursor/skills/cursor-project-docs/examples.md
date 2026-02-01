# Cursor Project Docs — Examples and Templates

## GitHub Repo Docs Layout

Where GitHub recognizes these files (root, `docs/`, or `.github/`):

| File | Typical location | Purpose |
|------|------------------|---------|
| README.md | Root (or docs/) | What the project does, how to get started, where to get help |
| CONTRIBUTING.md | Root, docs/, or .github/ | How to contribute; surfaced when opening PR/issue |
| SECURITY.md | Root, docs/, or .github/ | Supported versions; how to report vulnerabilities |
| CHANGELOG.md | Root or docs/ | User-visible changes over time |
| LICENSE | Root | License terms |
| CODE_OF_CONDUCT.md | Root or .github/ | Community standards (optional) |

Use one location consistently (e.g. root for README, CONTRIBUTING, SECURITY, CHANGELOG; .github/ for CONTRIBUTING if you prefer).

## .cursor/docs/ Layout (Cursor Doc Section)

Derive from GitHub docs; do not duplicate long prose.

| File | Purpose |
|------|---------|
| index.md | Repo summary, links to README/CONTRIBUTING/SECURITY/CHANGELOG, entry points |
| architecture.md | High-level structure, main modules, key entry points (from README/codebase) |
| conventions.md | Key conventions from CONTRIBUTING (branching, PR, style) |

## Template: README.md (minimal)

```markdown
# [Project Name]

[One-paragraph: what it does and why it's useful.]

## Getting started

- **Prerequisites**: [list]
- **Install/setup**: [steps or link to docs]
- **Run**: [how to run or use]

## Where to get help

- [Issues/Discussions link]
- [Documentation link if any]

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[Link or short statement.]
```

## Template: CONTRIBUTING.md (minimal)

```markdown
# Contributing

Thanks for your interest in contributing.

## How to contribute

1. Open an issue or pick an existing one.
2. Fork the repo and create a branch (e.g. `feature/short-name` or `fix/short-name`).
3. Make your changes; follow existing style and add tests if applicable.
4. Open a pull request; reference the issue. Ensure CI passes.

## Review

Maintainers will review PRs. Please address feedback promptly.
```

## Template: SECURITY.md (minimal)

```markdown
# Security

## Supported versions

[Which versions receive security updates, e.g. "latest major" or list.]

## Reporting a vulnerability

Please do not open a public issue. [Email/private reporting instructions.]

We will acknowledge and respond as described in our [security policy](link if applicable).
```

## Template: CHANGELOG.md (minimal)

```markdown
# Changelog

User-visible changes. Format: [Keep a Changelog](https://keepachangelog.com/) or similar.

## [Unreleased]

## [1.0.0] - YYYY-MM-DD

### Added

- [Initial release or first entry.]
```

## Template: .cursor/docs/index.md

```markdown
# [Project Name] — Project context

Brief summary of the repo and how it's documented.

## Repository docs

- [README](../README.md) — Overview, getting started, help
- [CONTRIBUTING](../CONTRIBUTING.md) — How to contribute
- [SECURITY](../SECURITY.md) — Supported versions and reporting
- [CHANGELOG](../CHANGELOG.md) — User-visible changes

## Entry points / key areas

- [List main entry points, key dirs, or modules so Cursor has context]
```

## Template: .cursor/docs/architecture.md (optional)

```markdown
# Architecture (summary)

High-level structure; derived from README and codebase.

## Main modules / directories

- `[dir or module]`: [one-line purpose]
- …

## Entry points

- [Main executable, API entry, or config]
```

## Template: docs/product/[feature-name].md (PRD)

```markdown
# PRD: [Feature Name]

**Status**: Draft | In Review | Approved | Implemented
**Author**: [Name]
**Last Updated**: YYYY-MM-DD
**PRD ID**: PRD-XXX

## 1. Problem Statement

### Background
[Context and why this feature is needed]

### User Pain Points
- [Pain point 1]
- [Pain point 2]

### Business Impact
[Why this matters to the business]

## 2. Target Users

### Primary Persona
- **Who**: [Description]
- **Goals**: [What they want to achieve]
- **Current Behavior**: [How they solve this today]

### Secondary Personas
[Other affected users]

## 3. Requirements

### Functional Requirements
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | [Requirement] | Must Have | |
| FR-002 | [Requirement] | Should Have | |

### Non-Functional Requirements
| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| NFR-001 | Performance | [Metric] | |
| NFR-002 | Security | [Standard] | |

## 4. User Stories

### Epic: [Epic Name]

**US-001**: As a [user type], I want to [action] so that [benefit].
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]

**US-002**: As a [user type], I want to [action] so that [benefit].
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]

## 5. Success Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| [Metric] | [Value] | [Value] | [How measured] |

## 6. Constraints & Assumptions

### Constraints
- [Technical, business, or resource constraints]

### Assumptions
- [Assumptions that must hold true]

## 7. Out of Scope

- [What this PRD explicitly does NOT cover]

## 8. Open Questions

- [ ] [Question needing resolution]

## 9. References

- [Link to related PRDs]
- [Link to user research]
- [Link to competitive analysis]
```

## Template: docs/product/README.md (PRD Index)

```markdown
# Product Requirements Documents

Index of all PRDs for the project.

## Document Workflow

PRDs follow this lifecycle:
1. **Draft** — Initial creation, gathering requirements
2. **In Review** — Stakeholder review and feedback
3. **Approved** — Ready for technical design (HLD)
4. **Implemented** — Feature has been built and released

## Active PRDs

| PRD ID | Title | Status | Owner | Last Updated |
|--------|-------|--------|-------|--------------|
| PRD-001 | [Feature Name] | Approved | [Name] | YYYY-MM-DD |

## Completed PRDs

| PRD ID | Title | Implemented | Release |
|--------|-------|-------------|---------|
| PRD-000 | [Feature Name] | YYYY-MM-DD | v1.0.0 |

## Creating a New PRD

1. Copy the template from `templates/prd-template.md`
2. Assign the next PRD ID (PRD-XXX)
3. Fill in all sections
4. Submit for review
5. Get stakeholder approval before proceeding to HLD
```

## Template: docs/architecture/README.md (Technical Docs Index)

```markdown
# Architecture Documentation

Overview of system architecture and design decisions.

## Documents

- [High-Level Design](high-level-design.md) — System-wide architecture, components, technology choices
- [Architecture Decisions](decisions/) — ADRs documenting key architectural choices

## Diagrams

- [System Overview](diagrams/system-overview.mmd) — Component diagram showing major services and integrations

## Related

- [Component-level design](../design/) — Low-level implementation details for each component
- [API Documentation](../api/) — API endpoint specifications
```

## Template: docs/architecture/high-level-design.md

```markdown
# High-Level Design: [Project Name]

## 1. Executive Summary

[Business context, value proposition, scope]

## 2. System Overview

### Architecture Pattern
[Microservices, monolith, serverless, etc.]

### Core Components
- Component A: [Purpose and responsibility]
- Component B: [Purpose and responsibility]

### System Diagram
[Mermaid diagram or link to diagram file]

## 3. Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | [Technology] | [Why] |
| Backend | [Technology] | [Why] |
| Database | [Technology] | [Why] |

## 4. Non-Functional Requirements

- **Performance**: [Target metrics]
- **Scalability**: [Strategy]
- **Security**: [Principles]
- **Availability**: [Target uptime]

## 5. Integration Architecture

[How components interact; data flow between systems]

## 6. Deployment Strategy

[High-level deployment approach; environments; CI/CD]

## 7. Design Principles

[Guiding principles for implementation decisions]
```

## Template: docs/tech-plans/components/[component-name].md (Tech Plan)

```markdown
# Tech Plan: [Component Name]

**Status**: Draft | In Review | Approved | Implemented
**Author**: [Name]
**Last Updated**: YYYY-MM-DD
**Tech Plan ID**: TP-XXX
**Implements**: HLD Section [X], PRD-XXX

## 1. Overview

### Purpose
[Component purpose and scope]

### References
- PRD: [Link to PRD this implements]
- HLD: [Link to HLD section this details]

## 2. Architecture

### Module Structure
[Class diagram or module breakdown]

### Key Interfaces
```typescript
// Main interfaces and types
interface Example {
  // ...
}
```

### Dependencies
- [External library]: [Version] — [Purpose]
- [Internal module]: [Purpose]

## 3. Data Models

### Entities
[Tables, classes, or data structures with field definitions]

### Relationships
[Foreign keys, references, entity relationships]

## 4. API Specification

### Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /resource | [Description] | Required |
| POST | /resource | [Description] | Required |

[Link to detailed API docs in docs/api/]

## 5. Implementation Details

### Core Logic
[Key algorithms, business logic, data transformations]

### Sequence Diagrams
[Detailed sequence diagrams for key flows]

### Error Handling
[Error types, handling strategies, user messages]

### Edge Cases
[Known edge cases and how they're handled]

## 6. Security Considerations

[Authentication, authorization, data protection specific to this component]

## 7. Testing Strategy

### Unit Tests
[Key unit test scenarios]

### Integration Tests
[Integration test scenarios]

### Test Data
[Test data requirements]

## 8. Deployment Notes

[Component-specific deployment considerations]

## 9. Open Questions

- [ ] [Technical question needing resolution]
```

## Template: docs/tech-plans/README.md (Tech Plans Index)

```markdown
# Tech Plans

Implementation specifications for each component. Tech Plans are created AFTER HLD approval.

## Document Workflow

Tech Plans follow this lifecycle:
1. **Draft** — Initial technical design
2. **In Review** — Engineering review
3. **Approved** — Ready for implementation
4. **Implemented** — Code complete

## Relationship to Other Docs

```
PRD (What/Why) → HLD (System How) → Tech Plan (Component How) → Code
```

Each Tech Plan should:
- Reference the PRD requirements it implements
- Reference the HLD section it details
- Be specific enough to guide implementation

## Active Tech Plans

| TP ID | Component | Status | Owner | HLD Section | PRD |
|-------|-----------|--------|-------|-------------|-----|
| TP-001 | [Component] | Draft | [Name] | 4.1 | PRD-001 |

## By Component

### Components
- [simhub-plugin.md](components/simhub-plugin.md) — SimHub plugin implementation
- [web-frontend.md](components/web-frontend.md) — Web application frontend
- [api-workers.md](components/api-workers.md) — Cloudflare Workers API

### Data Models
- [database-schema.md](data-models/database-schema.md) — D1 database schema

### Integrations
- [discord-integration.md](integrations/discord-integration.md) — Discord OAuth2 integration
- [simhub-telemetry.md](integrations/simhub-telemetry.md) — SimHub telemetry processing
```

## Template: docs/api/[service-name].md

```markdown
# API Documentation: [Service Name]

## Overview

[API purpose and authentication requirements]

## Endpoints

### GET /endpoint

**Description**: [What it does]

**Request**:
```json
{
  "param": "value"
}
```

**Response (200 OK)**:
```json
{
  "result": "value"
}
```

**Error Responses**:
- `400 Bad Request`: [When this occurs]
- `401 Unauthorized`: [When this occurs]
```

## Mapping: All docs → .cursor/docs/

| Source doc | Use in .cursor/docs/ |
|------------|----------------------|
| README | index.md summary and links |
| CONTRIBUTING | index.md link; conventions.md key rules |
| SECURITY | index.md link |
| CHANGELOG | index.md link |
| docs/product/* | index.md link to PRD index |
| docs/architecture/high-level-design.md | architecture.md summary; link to full HLD |
| docs/tech-plans/* | architecture.md component list; links to tech plans |
| docs/api/* | index.md link to API docs location |

Keep `.cursor/docs/` as index and summaries; point to canonical docs for full text.

## Document Hierarchy Summary

```
docs/
├── prd/                    # FIRST: What are we building and why?
│   └── [feature].md        # Product requirements, user stories, acceptance criteria
│
├── architecture/           # SECOND: How does the system work?
│   └── high-level-design.md # System architecture, components, technology choices
│
├── tech-plans/             # THIRD: How do we implement each component?
│   ├── components/         # Component-specific implementation specs
│   ├── data-models/        # Database schemas
│   └── integrations/       # Integration specs
│
├── api/                    # Interface contracts (can be part of tech-plans)
├── guides/                 # How-to documentation
└── brand/                  # Design system and UX patterns
```

**Remember**: PRDs → HLD → Tech Plans → Code. Never skip steps.
