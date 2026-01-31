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

## Template: docs/design/components/[component-name].md (LLD)

```markdown
# Low-Level Design: [Component Name]

## Overview

[Component purpose, scope, and responsibilities]

## Architecture

### Class/Module Structure
[Class diagram or module breakdown]

### Key Interfaces
```
[Code/pseudocode showing main interfaces]
```

## Data Models

### Entities
[Tables, classes, or data structures]

### Relationships
[Foreign keys, references, dependencies]

## API Specification

### Endpoints (if applicable)
- `GET /resource` — [Description]
- `POST /resource` — [Description]

[Link to detailed API docs in docs/api/]

## Implementation Details

### Algorithms
[Key algorithms or logic flows]

### Error Handling
[How errors are handled and logged]

### Dependencies
[External libraries, services, or modules]

## Testing Strategy

[Unit test approach, integration test scenarios]
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

## Mapping: GitHub docs + Technical docs → .cursor/docs/

| Source doc | Use in .cursor/docs/ |
|------------|----------------------|
| README | index.md summary and links |
| CONTRIBUTING | index.md link; conventions.md key rules |
| SECURITY | index.md link |
| CHANGELOG | index.md link |
| docs/architecture/high-level-design.md | architecture.md summary; link to full HLD |
| docs/design/* | architecture.md component list; links to detailed LLD |
| docs/api/* | index.md link to API docs location |

Keep `.cursor/docs/` as index and summaries; point to canonical docs for full text.
