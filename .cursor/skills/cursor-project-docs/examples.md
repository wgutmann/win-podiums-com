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

## Mapping: GitHub docs → .cursor/docs/

| GitHub doc | Use in .cursor/docs/ |
|------------|----------------------|
| README | index.md summary and links; architecture.md high-level structure |
| CONTRIBUTING | index.md link; conventions.md key rules (branching, PR, style) |
| SECURITY | index.md link |
| CHANGELOG | index.md link |

Keep `.cursor/docs/` as index and summaries; point to canonical GitHub docs for full text.
