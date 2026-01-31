# Recommended Next Steps (Pre-Deployment)

**Status**: Recommendation  
**Date**: 2026-01-31  
**Purpose**: Align next work with repo documentation and avoid deploying infrastructure before anything uses it.

---

## 1. Where Things Actually Stand

### What Exists

| Area | Status | Notes |
|------|--------|--------|
| **Architecture** | ✅ Strong | HLD (draft), ADRs 001–005 (Cloudflare, Discord, hybrid auth, cost), cost-optimization summary |
| **Design** | ✅ Good | Database schema (D1 + KV), Discord integration LLD, SimHub plugin LLD |
| **Product** | ✅ Good | Telemetry Proof System PRDs (001–005): heartbeat, validation, race submission, continuity, challenge-response |
| **Tech plans** | ✅ Good | Telemetry Proof System tech plans (001–005), traceable to PRDs |
| **API** | ⚠️ Partial | OpenAPI spec (`openapi.yaml`) exists; API README links to missing `authentication.md`, `plugin.md`, `user-profile.md` |
| **Brand** | ✅ Present | Design system doc |
| **Infrastructure (Terraform)** | ✅ Ready | D1, R2, KV, optional routes for winpodiums.com; GitHub Actions for plan/apply |
| **Repo governance** | ⚠️ Partial | AGENTS.md, .gitignore, GitHub Actions for Terraform; no CONTRIBUTING, SECURITY, CHANGELOG, LICENSE |

### What Does Not Exist Yet

| Area | Gap |
|------|-----|
| **Application code** | No Cloudflare Worker app (no `workers/` or app-level `wrangler.toml`), no SimHub plugin project |
| **Guides** | No `docs/guides/development.md`, `docs/guides/deployment.md` (referenced in HLD and design docs) |
| **API sub-docs** | No `docs/api/authentication.md`, `plugin.md`, `user-profile.md` (linked from API README) |
| **Security LLD** | No `docs/design/security-anticheat.md` (referenced in HLD) |
| **Repo docs** | No CONTRIBUTING.md, SECURITY.md, CHANGELOG.md, LICENSE |

So: **we have solid planning and infra-as-code, but no app to run on that infra.** Deploying Terraform now would create D1, R2, KV, and routes that nothing uses.

---

## 2. What the Repo Says the Next Steps Are

- **README**: “Phase: Planning & Design (pre-MVP)”, “Current focus: PRD-first workflow, then Tech Plans (LLDs)”, “Implementation pending”.
- **.cursor/docs/index.md**: “Next steps: Finalize HLD/LLD review → Set up repository structure → Begin Phase 1 implementation (Discord auth + basic plugin).”
- **HLD Phase 1 (MVP)**: Discord OAuth2 (all three plugin methods), basic SimHub plugin with position detection, simple verification API with signature validation, static “Gate” landing page, member state (pending/verified).

The documented sequence is: **finalize docs → set up repo structure → Phase 1 implementation.** Deployment of Cloudflare resources fits **after** there is at least a minimal Worker (and ideally a plugin) that can use them.

---

## 3. Recommendation: Do Not Deploy Infra Yet

**Do not run `terraform apply` (and do not rely on GitHub Actions to apply) until:**

1. You have a minimal Worker app that can bind to D1, R2, and KV and serve at least one route (e.g. health or auth stub).
2. You are ready to run D1 migrations (per database-schema doc) and attach that Worker to the Terraform-created resources.

Terraform and the workflow are **ready**: use them for **plan** and **validate** on PRs, and keep `apply` for when the above is in place.

---

## 4. Recommended Order of Work

Follow the order below so that design, scope, and code stay aligned and infra is deployed only when useful.

### Step 1: Finalize Documentation (No Code Yet)

- **Close doc gaps** (so implementation isn’t blocked by broken links or missing specs):
  - Add `docs/guides/development.md` and `docs/guides/deployment.md` (stubs are fine: “TBD – follow HLD and tech plans”).
  - Add `docs/api/authentication.md`, `plugin.md`, `user-profile.md` (can be generated from or summarize `openapi.yaml`).
  - Add `docs/design/security-anticheat.md` (or remove the reference from HLD if deferred).
- **Optional**: One-pass review of HLD + ADRs + database schema + Discord + SimHub plugin LLDs for consistency and “Phase 1 only” scope.

**Outcome**: No broken doc links; clear entry points for developers; security/anti-cheat either specified or explicitly deferred.

### Step 2: Define Phase 1 Scope Explicitly

- **Write a short Phase 1 scope doc** (e.g. `docs/product/phase-1-mvp-scope.md` or a section in the HLD):
  - In scope: Discord OAuth2 (web + plugin browser/QR/manual), minimal Worker (auth + one or two API stubs), basic SimHub plugin (position detection, one verified flow), static landing, member state (pending/verified).
  - Out of scope for Phase 1: full Telemetry Proof (heartbeat/validation/continuity/challenge-response), luxury UI, Discord roles, leaderboards.
- **Trace Phase 1 to existing docs**: list which PRDs/tech plans/ADRs/LLDs apply to Phase 1 and which are “Phase 2+”.

**Outcome**: Clear “minimum shippable” set and no confusion about whether Terraform + D1/R2/KV are for Phase 1 or later.

### Step 3: Set Up Repository Structure

- **Worker app**: Add a minimal Cloudflare Workers project (e.g. `workers/` or `apps/api/`) with its own `wrangler.toml` that references **names/IDs from Terraform outputs** (D1 database name, R2 bucket name, KV namespace id). No need to deploy yet; just structure and config.
- **SimHub plugin**: Add a minimal C#/.NET Framework 4.8 SimHub plugin project (e.g. `plugin/` or `src/WinPodiumsPlugin/`) per simhub-plugin LLD and Discord integration LLD.
- **Monorepo layout**: Decide and document where Workers, plugin, and Terraform live (e.g. `infra/terraform/`, `apps/worker/`, `apps/plugin/` or similar) and update README and `.cursor/docs/index.md`.

**Outcome**: A place for Worker and plugin code that matches the docs and is ready to bind to Terraform-managed resources.

### Step 4: Implement Phase 1 (Minimal Path)

- **Worker**: Implement auth endpoints (per OpenAPI + Discord LLD) and at least one non-auth endpoint (e.g. health or `GET /api/profile/me` stub) using D1/KV. Apply D1 migrations (Wrangler) against the Terraform-created D1 database (local or a single dev environment).
- **Plugin**: Implement minimal auth (e.g. browser or manual token first), position detection, and one call to the verification API (or a stub) per tech plans and SimHub LLD.
- **Landing**: Static “Gate” page (can be Worker-served or static in R2) that links to Discord auth and plugin download.

**Outcome**: One end-to-end path: user visits site → auth (or plugin auth) → minimal API + DB/KV → plugin can submit (or stub) a result.

### Step 5: Deploy Infrastructure and Then the App

- **Apply Terraform** (locally or via GitHub Actions) once the Worker is ready to bind to the created resources. Use a single environment (e.g. `dev`) first; add `staging`/`prod` later.
- **Configure Worker**: Point `wrangler.toml` at Terraform outputs (D1 name, R2 bucket, KV id, and zone_id if using winpodiums.com routes).
- **Deploy Worker**: `wrangler deploy` (manually or via CI); ensure routes (e.g. winpodiums.com) are attached per infrastructure doc.
- **Plugin distribution**: Use R2 (and optionally GitHub Releases) per deployment guide once you have a build.

**Outcome**: Live infra and a live Worker (and later plugin) using it, with no “orphan” resources.

---

## 5. Summary

| Priority | Action | Why |
|----------|--------|-----|
| 1 | **Do not run Terraform apply yet** | Nothing would use D1/R2/KV/routes today. |
| 2 | **Fill doc gaps** (guides, API sub-docs, security LLD or HLD fix) | Unblocks implementation and keeps links valid. |
| 3 | **Define Phase 1 scope** on paper | Keeps first implementation and infra aligned with “MVP” in the HLD. |
| 4 | **Add repo structure** (Worker + plugin projects, wrangler.toml wired to Terraform outputs) | Gives a clear place to implement and a clear moment when Terraform becomes useful. |
| 5 | **Implement Phase 1** (auth, minimal API, minimal plugin, static gate) | Delivers the MVP path the HLD describes. |
| 6 | **Then** run Terraform apply and deploy Worker (and plugin) | Infra and code stay in sync; no wasted or unused resources. |

The Terraform and GitHub Actions you have are the right long-term setup. The right next step is **documentation and Phase 1 scope + structure**, then **implementation**, then **deploy**.

---

## Related

- [High-Level Design](high-level-design.md) — Phase 1 checklist and system overview
- [Infrastructure (Terraform)](infrastructure.md) — When and how to apply
- [README](../../README.md) — Repo status and stack
- [.cursor/docs/index.md](../../.cursor/docs/index.md) — Cursor-facing next steps
