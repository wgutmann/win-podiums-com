---
name: cursor-project-docs
description: Defines how the repository is documented - maintains GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG), product requirements (PRD with brand strategy), technical plans (Tech Plans/LLDs, API specs), and populates Cursor's doc section from those. Use when the user asks to document the repo, create PRDs, create/refactor Tech Plans, update repo docs, refresh the doc section, or apply documentation best practices.
---

# Cursor Project Docs

## Quick Start

Use this skill when the user asks to **document the repo**, **create PRDs**, **create/refactor Tech Plans**, **update repo docs**, **refresh the doc section**, **populate Cursor docs**, or apply **documentation best practices**.

**Flow**: (1) Create PRD (Product Requirements Document) as the single principal document covering brand, brand strategy, and product requirements. (2) Create Tech Plans (implementation plans) based on PRD. (3) Maintain GitHub repo docs using best practices. (4) Use those docs to populate Cursor's doc section (`.cursor/docs/`) so Cursor's Indexing and Docs has the same context.

## Scope

- **In scope**: How we document the repository — GitHub repo docs (README, CONTRIBUTING, SECURITY, CHANGELOG, etc.), product requirements (PRD with brand strategy), technical plans (Tech Plans/LLDs, API specs), and populating `.cursor/docs/` from them.
- **Out of scope**: Change control, branch protection, secret hygiene (see github-change-control skill); Cursor Settings/Indexing UI; modifying `.cursorignore` unless the user asks.

## Best-Practices Sources

When writing or updating repo docs, consult and apply practices from:

- **GitHub docs**: Repository best practices, about README, contributing guidelines, security policy. See [reference.md](reference.md) for curated links.
- **Product requirements**: PRD best practices, brand strategy documentation. See [reference.md](reference.md) for curated links.
- **Technical plans**: Implementation planning, GitLab architecture workflow, Microsoft engineering playbook. See [reference.md](reference.md) for curated links.
- **Other reputable sources**: Open-source documentation guides or standards referenced in reference.md.

Do not invent documentation structure; align to GitHub conventions, industry product/technical doc practices, and the referenced best practices.

## Documentation Hierarchy

**Order of Creation**:
1. **PRD (Product Requirements Document)** — Single principal document covering brand, brand strategy, product requirements, and what we're building
2. **Tech Plans (Low-Level Design/LLD)** — Detailed implementation plans based on PRD (component specs, APIs, algorithms, technology choices)

**Terminology**:
- **PRD**: Product Requirements Document — The single principal document that includes:
  - Brand identity and positioning
  - Brand strategy and philosophy
  - Product vision and goals
  - User needs and personas
  - Feature requirements
  - Success metrics
- **Tech Plans**: Low-Level Design documents (implementation/developer perspective) — **Note**: "Tech Plans" is the preferred term, but these are equivalent to LLDs

## Product Requirements Documentation

### PRD (Product Requirements Document)

**Purpose**: The single principal document that defines brand, brand strategy, product vision, and what we're building.

**Audience**: Product managers, stakeholders, business leaders, designers, developers, engineers
**Scope**: Brand identity, brand strategy, product vision, user needs, business requirements, success metrics
**Content**: 
- **Brand Identity & Positioning**: Brand philosophy, visual identity, tone of voice, brand values
- **Brand Strategy**: How brand manifests in product, user experience principles, brand-aligned design decisions
- **Problem Statement**: What problem are we solving? Why does this matter?
- **Product Vision**: What we're building and why
- **User Needs & Personas**: Who are the users? What do they need?
- **Use Cases**: How users will interact with the product
- **Feature Requirements**: What features are needed with acceptance criteria
- **Success Metrics**: Business KPIs, user metrics, brand perception metrics
- **Constraints & Assumptions**: Technical, business, and brand constraints
- **Timeline & Milestones**: When features will be delivered

**Created by**: Product managers, product owners, brand strategists
**Created**: **FIRST** — before any technical planning or implementation work

**Key Principle**: The PRD is the single source of truth for brand and product. All Tech Plans must align with and implement the brand strategy and product requirements defined in the PRD.

## Technical Planning Documentation

### Tech Plans (Low-Level Design / LLD)

**Purpose**: Define detailed implementation plans for each component, based on the PRD.

**Terminology Note**: "Tech Plans" is the preferred term for these documents. They are equivalent to Low-Level Design (LLD) documents but emphasize their role as implementation plans.

**Audience**: Developers, implementers, engineers
**Scope**: Component-specific implementation details, technology choices, architecture decisions
**Content**: 
- **Component Overview**: Purpose, scope, responsibilities (aligned with PRD)
- **Technology Choices**: Framework, language, infrastructure decisions (with rationale)
- **Architecture**: System architecture, component interactions, data flow
- **Class/Module Structures**: Code structure, interfaces, APIs
- **API Specifications**: Endpoint contracts with schemas
- **Database Schemas**: Data models, entities, relationships
- **Sequence Diagrams**: Detailed interaction flows
- **Algorithms**: Logic flows, business rules
- **Error Handling**: Edge cases, failure modes
- **Testing Strategies**: Unit, integration, E2E approaches
- **Deployment**: How component is deployed and operated

**Abstraction**: Detailed, implementation-focused, tactical
**Created by**: Developers, engineers, tech leads
**Created**: **SECOND** — after PRD is approved, before implementation begins

**Key Principle**: Tech Plans must reference and implement the brand strategy and product requirements from the PRD. Every technical decision should align with brand principles.

### Documentation Folder Structure

Organize documentation in `docs/` following the hierarchy: PRD → Tech Plans

```
docs/
├── product/
│   ├── README.md                 # Product docs index
│   ├── product-requirements.md  # PRD (single principal document: brand + brand strategy + product)
│   ├── user-personas.md          # User research and personas (optional, can be in PRD)
│   └── feature-specs/            # Individual feature specifications (optional, can be in PRD)
│       └── feature-name.md
├── tech-plans/                   # Tech Plans (LLDs) - Implementation plans
│   ├── README.md                 # Tech Plans index
│   ├── components/               # Component-specific Tech Plans
│   │   ├── simhub-plugin.md
│   │   ├── web-frontend.md
│   │   └── api-workers.md
│   ├── data-models/              # Database schemas, entities
│   │   └── database-schema.md
│   ├── integrations/             # Integration-specific Tech Plans
│   │   ├── discord-integration.md
│   │   └── simhub-telemetry.md
│   └── decisions/                # Technical decision records (optional)
│       ├── 001-cloudflare-stack.md
│       └── 002-discord-oauth.md
├── api/
│   ├── README.md                 # API overview
│   ├── authentication.md         # Auth endpoints
│   ├── plugin.md                 # Plugin endpoints
│   └── user-profile.md           # Profile endpoints
├── guides/
│   ├── development.md            # Developer setup
│   ├── deployment.md             # Deployment guide
│   └── troubleshooting.md        # Common issues
└── brand/                        # Optional: Can be merged into PRD
    ├── design-system.md          # Visual design guidelines (if separate from PRD)
    └── ux-patterns.md            # UX interaction patterns (if separate from PRD)
```

**Key principles**:
- **PRD** in `docs/product/product-requirements.md` — Single principal document covering brand, brand strategy, and product requirements
- **Tech Plans** in `docs/tech-plans/` — Detailed implementation plans based on PRD (component-specific, tactical)
- **API specs** in `docs/api/` — Interface contracts (can be part of Tech Plans or separate)
- **Guides** in `docs/guides/` — How-to, procedural documentation
- **Brand docs** in `docs/brand/` — Optional; brand strategy should be in PRD, but visual design system can be separate
- Keep each file focused on one subject
- Use `README.md` as index for each subdirectory
- **Order**: Create PRD first, then Tech Plans
- **Traceability**: Every Tech Plan must reference which PRD sections it implements

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
   - `index.md`: Short repo summary, links to README, CONTRIBUTING, SECURITY, CHANGELOG, PRD, and key Tech Plans; high-level entry points.
   - `product.md` (optional): Brand and product summary from PRD; key requirements and brand principles.
   - `conventions.md` (optional): Key conventions from CONTRIBUTING (branching, PR, style).
   - `stack.md` (optional): Technology stack summary from Tech Plans (framework, language, infrastructure choices).
3. **Keep** `.cursor/docs/` concise so Cursor indexing gets useful context without redundancy. Prefer pointers to canonical docs over long copy-paste.

**Checklist** for doc section:
- [ ] `.cursor/docs/index.md` exists and summarizes the repo and links to GitHub docs, PRD, and Tech Plans.
- [ ] Content in `.cursor/docs/` does not contradict GitHub docs, PRD, or Tech Plans; it extends or summarizes them.
- [ ] Product summary in `.cursor/docs/product.md` (if exists) points to full PRD for brand strategy and requirements.

## Documentation Creation Workflow

### Step 1: Create PRD (Product Requirements Document)

**When**: Before any technical planning or implementation work begins
**Where**: `docs/product/product-requirements.md`

**Content** (Single Principal Document):
- **Brand Identity & Positioning**: Brand philosophy, values, visual identity, tone of voice
- **Brand Strategy**: How brand manifests in product, user experience principles, brand-aligned decisions
- **Problem Statement**: What problem are we solving? Why does this matter?
- **Product Vision**: What we're building and why
- **User Needs & Personas**: Who are the users? What do they need?
- **Use Cases**: How users will interact with the product
- **Feature Requirements**: What features are needed with acceptance criteria
- **Success Metrics**: Business KPIs, user metrics, brand perception metrics
- **Constraints & Assumptions**: Technical, business, and brand constraints
- **Timeline & Milestones**: When features will be delivered

**Output**: Single source of truth for brand, brand strategy, and product requirements

### Step 2: Create Tech Plans (Implementation Plans)

**When**: After PRD is approved, before coding begins
**Where**: `docs/tech-plans/` organized by component

**Content**:
- **Component Overview**: Purpose, scope, responsibilities (aligned with PRD)
- **Technology Choices**: Framework, language, infrastructure (with rationale)
- **Architecture**: System architecture, component interactions, data flow
- **API Specifications**: Endpoint contracts with schemas
- **Database Schemas**: Data models, entities, relationships
- **Sequence Diagrams**: Detailed interaction flows
- **Algorithms**: Logic flows, business rules
- **Error Handling**: Edge cases, failure modes
- **Testing Strategies**: Unit, integration, E2E approaches
- **Deployment**: How component is deployed and operated

**Output**: Detailed implementation plans that developers can follow

**Traceability**: Each Tech Plan must:
- Reference which PRD sections it implements
- Align with brand strategy from PRD
- Ensure technical decisions support brand principles

### Refactoring: Moving Content from PRD to Tech Plans

When a PRD contains too much technical implementation detail:

1. **Identify** content by abstraction level:
   - **Keep in PRD**: Brand strategy, product vision, user needs, feature requirements, success metrics, business constraints
   - **Move to Tech Plans**: Technology stack decisions, architecture diagrams, API specs, database schemas, detailed sequence diagrams, algorithms, code-level decisions

2. **Create** Tech Plan files in `docs/tech-plans/` organized by component or subject

3. **Update** PRD to reference Tech Plan documents instead of including technical detail

4. **Maintain** traceability: Each Tech Plan must reference which PRD sections it implements and ensure brand alignment

## Anti-Patterns

- **Do not skip PRD**: Never start with Tech Plans without a PRD first. PRD is the single principal document that defines brand, brand strategy, and product requirements.
- **Do not separate brand from PRD**: Brand strategy and brand identity must be in the PRD, not in separate documents. The PRD is the single source of truth.
- **Do not create Tech Plans before PRD**: Tech Plans must be based on an approved PRD. All technical decisions must align with brand strategy from PRD.
- **Do not invent documentation structure**: Align to GitHub conventions and referenced best practices.
- **Do not populate `.cursor/docs/`** with content that contradicts or bypasses the canonical GitHub docs or technical docs.
- **Do not skip consulting best-practices sources** when creating or updating GitHub repo docs.
- **Do not mix abstraction levels**: Keep PRD (brand + product) and Tech Plans (implementation) separate. Do not create an intermediate HLD layer.
- **Do not duplicate content**: Use links and references to maintain single source of truth.
- **Terminology consistency**: Always use "Tech Plans" when referring to implementation plans (LLDs). Use "LLD" only when clarifying equivalence.
- **Brand alignment**: Every Tech Plan must demonstrate how it implements and aligns with brand strategy from PRD.

## Additional Resources

- Templates and layouts: [examples.md](examples.md)
- Curated links to GitHub docs and other reputable sources: [reference.md](reference.md)
