# GitHub Repo Template — WinPodiums

Use this template to keep the GitHub repository on-brand: description, topics, README structure, and optional PR/issue templates.

**Reference**: [Design system](design-system.md) for colors, typography, and voice.

---

## Repository settings

### Description (short)

One-line summary shown under the repo name. Keep it under ~100 characters.

**Suggested**:

```text
Luxury, merit-based community for elite sim racers. Verified podium access via SimHub + Discord.
```

**Alternatives**:

- "Merit-based sim racing community — verified podiums, Discord auth, SimHub plugin."
- "Elite sim racing community. Access earned through verified podium finishes (SimHub + Discord)."

### Topics (labels)

Add topics so the repo is discoverable. Suggested set:

| Topic | Purpose |
|-------|---------|
| `sim-racing` | Primary domain |
| `simhub` | Plugin platform |
| `discord` | Identity provider |
| `cloudflare-workers` | Runtime |
| `cloudflare-d1` | Database |
| `terraform` | If infra is open-source |
| `openapi` | API spec presence |
| `documentation` | Doc-heavy repo |

Adjust or add (e.g. `csharp`, `typescript`) as needed; avoid redundant or off-brand terms.

### Website URL

If you have a public site or docs portal, set it in **Settings → General → Website**.

---

## README structure

Keep the root README scannable and on-brand. Suggested order:

1. **Project name and tagline**  
   One sentence: luxury, merit-based, elite sim racers, verified podium, Discord/SimHub.

2. **Status**  
   Phase (e.g. Phase 1 MVP), current focus (e.g. Discord + `.dev.vars`, local testing), and one line on Docker/Terraform if relevant.

3. **What this repo contains**  
   Bullet list: docs (PRDs, tech plans, HLD, ADRs, design system), API spec, Worker app, Docker dev environment, etc.

4. **Documentation**  
   “Start here” links: next steps, HLD, ADRs, design, API, Cursor index. Use relative links to `docs/`.

5. **Stack**  
   Short list: Workers, D1, R2, C# plugin, Discord OAuth2.

6. **Getting started**  
   Run locally (e.g. `docker compose up`), test command, link to development guide.

7. **Contributing**  
   Link to CONTRIBUTING.md.

8. **Security**  
   Link to SECURITY.md.

9. **License**  
   Link to LICENSE or “License will be added in LICENSE.”

### README voice and formatting

- **Tone**: Formal but not stiff; technical precision. No “Hey!” or “Awesome!” — e.g. “Luxury, merit-based community” not “The coolest sim racing community.”
- **Lists**: Prefer bullets for “what’s in the repo” and “getting started”; keep paragraphs short.
- **Links**: Use relative Markdown links: `[Development Guide](docs/guides/development.md)`.
- **Code**: Use fenced code blocks for exact commands; inline `` `commands` `` for short references.

---

## Optional: Pull request template

Create `.github/pull_request_template.md` so every PR uses the same structure. Example:

```markdown
## Summary

[One to three sentences: what this PR does and why.]

## Type of change

- [ ] Documentation only
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Config / infra only

## Checklist

- [ ] Docs updated if needed (and follow [documentation template](docs/brand/documentation-template.md))
- [ ] Tests added/updated (or N/A and noted)
- [ ] No secrets or credentials in diff
- [ ] Related issue or ADR linked (if any)
```

Repo-specific rules (e.g. “Run `npm test`”) can be added to the checklist.

---

## Optional: Issue templates

Under `.github/ISSUE_TEMPLATE/` you can add:

- **Bug report** — steps, expected vs actual, environment.
- **Documentation** — what doc, what’s wrong or missing, suggested change.
- **Feature / enhancement** — problem, proposed solution, link to PRD or ADR if any.

Use clear titles and short instructions; link to CONTRIBUTING.md and, for docs, to the [documentation template](documentation-template.md).

---

## Summary checklist

| Item | Where | Action |
|------|--------|--------|
| Repo description | GitHub → Settings → General | Set one-line tagline (merit-based, elite sim racers, verified podium). |
| Topics | GitHub → About → Topics | Add e.g. sim-racing, simhub, discord, cloudflare-workers, documentation. |
| README | Root `README.md` | Follow structure and voice above; link to docs and design system. |
| PR template | `.github/pull_request_template.md` | Optional; use template above. |
| Issue templates | `.github/ISSUE_TEMPLATE/` | Optional; bug, docs, feature. |

---

## Related documentation

- [Design system](design-system.md) — Visual and voice guidelines
- [Documentation template](documentation-template.md) — Styling for all Markdown docs
- [Documentation standards](../standards/documentation-standards.md) — Doc types, naming, metadata
