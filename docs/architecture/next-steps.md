# Recommended Next Steps (Pre-Deployment)

**Status**: Recommendation  
**Date**: 2026-01-31  
**Purpose**: Align next work with repo documentation.

**Terraform**: Not part of the default workflow. Ignore `infra/terraform/` until explicitly introduced as a feature. See [AGENTS.md](../../AGENTS.md).

---

## Where we are — pick up here

**Step 4 (Implement Phase 1) is done.** Worker and Docker are 1:1 (same app, same config). You can pick up with any of the following.

| Next action | Where | Notes |
|-------------|--------|------|
| **Create D1 tables** | `apps/api` | Run the initial schema (empty tables): `npx wrangler d1 migrations apply winpodiums-dev-db --local` (or `--remote` when deploying). SQL in `apps/api/migrations/0001_initial_schema.sql`. |
| **Configure Discord + secrets** | `apps/api` | Copy `.dev.vars.example` to `.dev.vars`; set `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `SESSION_SECRET`. In Discord Developer Portal, add redirect URIs: **`http://localhost:8787/auth/callback`** (web login); for plugin "Login with Discord" also add **`http://127.0.0.1:54321/callback`** (per [TP-SPOC-002](../tech-plans/simhub-plugin-poc/002-auth-pkce-token-storage.md)). Add production URL when you deploy. |
| **Test Worker locally** | Repo root + `apps/api` | Run API: `docker compose up`. Run tests against Docker: `docker compose up -d && cd apps/api && npm test`. Hit `/`, `/auth/discord`, `/auth/token`, `/api/health`, `/api/profile/me` (after login). |
| **Test plugin** | `apps/plugin` | Build plugin; deploy DLL to `C:\Program Files (x86)\SimHub\` (install root). Primary auth: browser (PKCE). For debug only (feature-flagged): generate token at `/auth/token`, then in plugin call `AuthenticateWithManualTokenAsync(token)` and `SendHeartbeatAsync()`. Manual E2E steps: see [Development guide — Manual E2E (SimHub Plugin POC)](../guides/development.md#manual-e2e--simhub-plugin-poc). |
| **Deploy** | When ready | Create D1/KV/R2 in Cloudflare if needed; set bindings in `wrangler.toml`; apply D1 schema `--remote`; then `wrangler deploy`. See [Deployment Guide](../guides/deployment.md). |

**Implemented in Phase 1 (Step 4):**

- **Worker**: Real Discord OAuth (web: `/auth/discord`, callback; plugin: `POST /api/auth/discord/exchange`, `POST /api/auth/token-exchange`, `GET /api/auth/qr-status/:id` stub). `GET /api/profile/me` and `POST /api/plugin/heartbeat` use D1/KV. Static Gate at `/` and `/gate`; token page at `/auth/token`. Secrets: see `apps/api/.dev.vars.example`.
- **D1**: Initial-schema SQL `0001_initial_schema.sql` (CREATE TABLE for users, auth_tokens, qr_auth_sessions, manual_tokens, race_results, plugin_installations, rate_limit_logs). No data—just empty tables. Run the command above when you want the Worker to have a DB to write to.
- **Plugin**: Browser auth (PKCE) primary; manual token **debug-only, feature-flagged** (`AuthenticateWithManualTokenAsync` when flag on). One verification call (`SendHeartbeatAsync`). DPAPI storage; API client in `Services/ApiClient.cs`. SimHub SDK not yet referenced (position detection / IPlugin wiring deferred).

---

## 1. Where Things Actually Stand

### What Exists

| Area | Status | Notes |
|------|--------|--------|
| **Architecture** | ✅ Strong | HLD (draft), ADRs 001–005 (Cloudflare, Discord, hybrid auth, cost), cost-optimization summary |
| **Design** | ✅ Good | Database schema (D1 + KV), Discord integration LLD, SimHub plugin LLD, security-anticheat LLD |
| **Product** | ✅ Good | Phase 1 scope doc; Telemetry Proof System PRDs (001–005): heartbeat, validation, race submission, continuity, challenge-response |
| **Tech plans** | ✅ Good | Telemetry Proof System tech plans (001–005), traceable to PRDs |
| **API** | ✅ Good | OpenAPI spec (`openapi.yaml`), API README, `authentication.md`, `plugin.md`, `user-profile.md` |
| **Guides** | ✅ Present | `docs/guides/development.md`, `docs/guides/deployment.md` |
| **Brand** | ✅ Present | Design system doc |
| **Repo governance** | ✅ Present | AGENTS.md, .gitignore, CONTRIBUTING.md, SECURITY.md, CHANGELOG.md (stubs) |
| **Repo structure** | ✅ Done | Worker in `apps/api/` (wrangler.toml for D1/R2/KV), SimHub plugin in `apps/plugin/` |
| **Worker (Phase 1)** | ✅ Done | Real Discord OAuth (web + plugin exchange/token-exchange), D1 initial-schema SQL (create tables), profile/me with D1/KV, heartbeat, Gate + `/auth/token` |
| **Plugin (Phase 1)** | ✅ Done | Browser auth (PKCE) primary; manual token debug-only, feature-flagged; heartbeat API call, DPAPI storage, API client; SimHub SDK/position detection not yet wired |

### What Is Not Done Yet

| Area | Gap |
|------|-----|
| **D1 tables not created yet** | Initial-schema SQL exists in `apps/api/migrations/` (CREATE TABLE only, no data) but has not been run; run `wrangler d1 migrations apply` when you want empty tables for the Worker to use. |
| **Discord + secrets** | `.dev.vars` not committed; create it from `.dev.vars.example` and configure Discord app redirect URI. |
| **Deployment** | Worker not yet deployed to Cloudflare; no live routes. |
| **Plugin SimHub SDK** | SimHub SDK reference and IPlugin/position detection not yet added (Phase 1 used browser PKCE + heartbeat; manual token debug-only). |
| **Repo docs** | No LICENSE; CONTRIBUTING/SECURITY/CHANGELOG are stubs (full content as implementation progresses). |

So: **Phase 1 implementation is complete.** Next: create D1 tables (run initial schema—empty tables only), configure Discord and `.dev.vars`, test locally; when ready, deploy Worker (see [Deployment Guide](../guides/deployment.md)).

---

## 2. What the Repo Says the Next Steps Are

- **README**: “Phase: Planning & Design (pre-MVP)”, “Current focus: PRD-first workflow, then Tech Plans (LLDs)”, “Implementation pending”.
- **.cursor/docs/index.md**: “Next steps: Finalize HLD/LLD review → Set up repository structure → Begin Phase 1 implementation (Discord auth + basic plugin).”
- **HLD Phase 1 (MVP)**: Discord OAuth2 (all three plugin methods), basic SimHub plugin with position detection, simple verification API with signature validation, static “Gate” landing page, member state (pending/verified).

The documented sequence is: **finalize docs → set up repo structure → Phase 1 implementation → test locally → deploy** (Wrangler; Terraform is not in scope).

---

## 4. Recommended Order of Work

Follow the order below so that design, scope, and code stay aligned and infra is deployed only when useful.

### Step 1: Finalize Documentation — ✅ Done

- **Close doc gaps** (so implementation isn’t blocked by broken links or missing specs):
  - Add `docs/guides/development.md` and `docs/guides/deployment.md` (stubs are fine: “TBD – follow HLD and tech plans”).
  - Add `docs/api/authentication.md`, `plugin.md`, `user-profile.md` (can be generated from or summarize `openapi.yaml`).
  - Add `docs/design/security-anticheat.md` (or remove the reference from HLD if deferred).
- **Optional**: One-pass review of HLD + ADRs + database schema + Discord + SimHub plugin LLDs for consistency and “Phase 1 only” scope.

**Outcome**: No broken doc links; clear entry points for developers; security/anti-cheat either specified or explicitly deferred.

### Step 2: Define Phase 1 Scope — ✅ Done

- **Write a short Phase 1 scope doc** (e.g. `docs/product/phase-1-mvp-scope.md` or a section in the HLD):
  - In scope: Discord OAuth2 (web + plugin browser/QR/manual), minimal Worker (auth + one or two API stubs), basic SimHub plugin (position detection, one verified flow), static landing, member state (pending/verified).
  - Out of scope for Phase 1: full Telemetry Proof (heartbeat/validation/continuity/challenge-response), luxury UI, Discord roles, leaderboards.
- **Trace Phase 1 to existing docs**: list which PRDs/tech plans/ADRs/LLDs apply to Phase 1 and which are “Phase 2+”.

**Outcome**: Clear “minimum shippable” set and no confusion about Phase 1 scope.

### Step 3: Set Up Repository Structure — ✅ Done

- Worker: `apps/api/` with `wrangler.toml` for D1, R2, KV bindings.
- SimHub plugin: `apps/plugin/WinPodiums.Plugin/` (C#/.NET Framework 4.8).
- Minimal Worker serves health, Gate, auth stubs, profile stub; bindings ready for D1/R2/KV.

### Step 4: Implement Phase 1 — ✅ Done

- **Worker**: Auth endpoints (web: `/auth/discord`, callback; plugin: `/api/auth/discord/exchange`, `/api/auth/token-exchange`, `/api/auth/qr-status/:id` stub). Profile `GET /api/profile/me` and `POST /api/plugin/heartbeat` using D1/KV. D1 initial-schema SQL in `apps/api/migrations/0001_initial_schema.sql` (CREATE TABLE only; run it when you want empty tables). Gate at `/`, `/gate`; token page at `/auth/token`.
- **Plugin**: Browser auth (PKCE) primary; manual token **debug-only, feature-flagged**. One verification call (`SendHeartbeatAsync`). DPAPI storage; API client. SimHub SDK and position detection not yet wired.
- **Landing**: Static “Gate” page (can be Worker-served or static in R2) that links to Discord auth and plugin download.

**Outcome**: One end-to-end path: user visits site → auth; plugin uses browser (PKCE) to link (manual token only when debug flag on) → minimal API + DB/KV → plugin can send heartbeat. **Pick up**: create D1 tables (initial schema only, no data), set `.dev.vars`, test; then deploy when ready (see [Deployment Guide](../guides/deployment.md)).

---

## 5. Summary

| Priority | Action | Why |
|----------|--------|-----|
| 1 | **Fill doc gaps** (guides, API sub-docs, security LLD or HLD fix) | Unblocks implementation and keeps links valid. |
| 2 | **Define Phase 1 scope** on paper | Keeps first implementation aligned with “MVP” in the HLD. |
| 3 | **Add repo structure** (Worker + plugin projects, wrangler.toml) | Gives a clear place to implement. |
| 4 | **Implement Phase 1** (auth, minimal API, minimal plugin, static gate) | Delivers the MVP path the HLD describes. |
| 5 | **Test locally** (Worker + plugin) | Validates end-to-end before deploy. |
| 6 | **Deploy** (Wrangler; D1/KV/R2 in Cloudflare as needed) | Live Worker and plugin. See [Deployment Guide](../guides/deployment.md). |

Worker and Docker are 1:1. The right next step is **test locally**, then **deploy** when ready.

---

## Related

- [High-Level Design](high-level-design.md) — Phase 1 checklist and system overview
- [Phase 1 scope](../product/phase-1-mvp-scope.md) — MVP deliverables and trace to docs
- [Development Guide](../guides/development.md) — Local run and test (Docker, plugin)
- [Deployment Guide](../guides/deployment.md) — How to deploy the Worker
- [API README](../api/README.md) — Endpoint surface and OpenAPI spec
- [ADR-001 Cloudflare Stack](decisions/001-cloudflare-stack.md), [ADR-002 Discord OAuth](decisions/002-discord-oauth.md) — Core stack and auth
- [README](../../README.md) — Repo status and stack
- [.cursor/docs/index.md](../../.cursor/docs/index.md) — Cursor-facing next steps
