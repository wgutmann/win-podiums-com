---
name: cursor-project-docs
description: Defines how the repository is documented: maintains GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG) using best practices from reputable sources, then populates Cursor's doc section from those GitHub docs. Use when the user asks to document the repo, update repo docs, refresh the doc section, populate Cursor docs from GitHub docs, or apply documentation best practices.
---

# Cursor Project Docs

## Quick Start

Use this skill when the user asks to **document the repo**, **update repo docs**, **refresh the doc section**, **populate Cursor docs from GitHub docs**, or apply **documentation best practices**.

**Flow**: (1) Maintain GitHub repo docs using best practices from reputable sources. (2) Use those GitHub docs to populate Cursor's doc section (`.cursor/docs/`) so Cursor's Indexing and Docs has the same context.

## Scope

- **In scope**: How we document the repository — GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG, etc.) and populating `.cursor/docs/` from them.
- **Out of scope**: Change control, branch protection, secret hygiene (see github-change-control skill); Cursor Settings/Indexing UI; modifying `.cursorignore` unless the user asks.

## Best-Practices Sources

When writing or updating repo docs, consult and apply practices from:

- **GitHub docs**: Repository best practices, about README, contributing guidelines, security policy. See [reference.md](reference.md) for curated links.
- **Other reputable sources**: Open-source documentation guides or standards referenced in reference.md.

Do not invent documentation structure; align to GitHub conventions and the referenced best practices.

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

After (or alongside) GitHub docs are in place, use their content to populate **`.cursor/docs/`** (Cursor's doc section for Indexing and Docs):

1. **Derive** from GitHub docs: summaries, index, key excerpts — not full duplicate prose unless necessary.
2. **Suggested files** in `.cursor/docs/`:
   - `index.md`: Short repo summary, links to README, CONTRIBUTING, SECURITY, CHANGELOG; high-level entry points.
   - `architecture.md` (optional): High-level structure or excerpts from README; main modules and entry points.
   - `conventions.md` (optional): Key conventions from CONTRIBUTING (branching, PR, style).
3. **Keep** `.cursor/docs/` concise so Cursor indexing gets useful context without redundancy. Prefer pointers to canonical GitHub docs over long copy-paste.

**Checklist** for doc section:
- [ ] `.cursor/docs/index.md` exists and summarizes the repo and links to GitHub docs.
- [ ] Content in `.cursor/docs/` does not contradict GitHub docs; it extends or summarizes them.

## Anti-Patterns

- Do not invent documentation structure without aligning to GitHub conventions and referenced best practices.
- Do not populate `.cursor/docs/` with content that contradicts or bypasses the canonical GitHub docs.
- Do not skip consulting best-practices sources when creating or updating GitHub repo docs.

## Additional Resources

- Templates and layouts: [examples.md](examples.md)
- Curated links to GitHub docs and other reputable sources: [reference.md](reference.md)
