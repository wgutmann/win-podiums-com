# SimHub PRD and Tech Docs Review

**Date**: 2026-02-01  
**Scope**: SimHub Plugin POC PRD (PRD-SPOC-001), tech plans (TP-SPOC-001–005), SimHub Plugin LLD, Phase 1 MVP scope, API plugin docs.  
**Purpose**: Surface inconsistencies, gaps, pitfalls, misconfigurations, and duplicate or contradictory guidance.

---

## 1. Inconsistencies

### 1.1 PRD/ID naming collision

- **SimHub POC**: Uses **PRD-SPOC-001** (SimHub Plugin POC) and **TP-SPOC-001**–**TP-SPOC-005**.
- **Telemetry Proof**: Uses **PRD-001**–**PRD-005** (Heartbeat System, Validation, Race Submission, Continuity, Challenge-Response) and **TP-001**–**TP-005**.

**Resolution**: SimHub POC PRD was renamed to **PRD-SPOC-001** for knowledge-graph consistency; Telemetry Proof keeps **PRD-001**–**PRD-005**. No collision; graph can map PRD-SPOC-001 ↔ TP-SPOC-001–005 and PRD-001–005 ↔ TP-001–005. Previously: two different **PRD-001**s existed (SimHub Plugin POC vs Telemetry Heartbeat System). Phase 1 scope and SimHub PRD refer to “PRDs 001–005” for Full Telemetry Proof (telemetry-proof-system), but “001” is ambiguous without context.

**Recommendation**: Disambiguate in prose (e.g. “Telemetry Proof PRDs 001–005” or “PRD-001 SimHub” vs “PRD-001 Telemetry”) or adopt distinct IDs (e.g. PRD-SPOC-001 for SimHub, keep PRD-001–005 for Telemetry Proof and always say “Telemetry Proof” when citing).

### 1.2 Loopback port

- **Discord Integration LLD** (plugin browser flow): “loopback listener on port **54321**”.
- **TP-SPOC-002**: “available port (e.g. random in **50000–60000** or try sequential)”.

**Issue**: LLD fixes one port; tech plan allows a range. Implementations following LLD could conflict with other apps using 54321; tech plan avoids that but differs from LLD.

**Recommendation**: Pick one source of truth. Prefer TP-SPOC-002 (dynamic port) and update the Discord LLD diagram/description to “e.g. port in 50000–60000” and reference the tech plan for the actual binding strategy.

### 1.3 Token storage format and entropy

- **LLD** (`TokenStorage`): Uses `ProtectedData.Protect(..., null, DataProtectionScope.CurrentUser)` (no entropy).
- **Code** (`TokenStorage.cs`): Uses `Entropy = Encoding.UTF8.GetBytes("WinPodiums.Plugin.v1")` and `ProtectedData.Protect(..., Entropy, ...)`.
- **TP-SPOC-002**: “Encrypt with `ProtectedData.Protect` (DataProtectionScope.CurrentUser)” (does not specify entropy).

**Issue**: LLD shows `null` entropy; code uses fixed entropy. Both are valid; docs and code disagree.

**Recommendation**: Update LLD to show entropy (or “optional entropy”) and point to `TokenStorage.cs` as canonical so future readers don’t assume `null` is required.

### 1.4 API base URL in LLD code samples

- **LLD** (BrowserAuthFlow, ManualTokenAuthFlow, VerificationService): Hardcoded `https://winpodiums.com` in request URLs.
- **PRD FR-003 / TP-SPOC-001**: API base URL must be **configurable** (e.g. `http://localhost:8787` for local dev).

**Issue**: LLD code implies a fixed production URL; PRD and tech plans require a configurable base URL. Copy-paste from LLD would break local dev.

**Recommendation**: Add a short “Configuration” note at the top of LLD code sections: “All API requests MUST use the configurable base URL (see PRD FR-003 and TP-SPOC-001). Examples below use a placeholder; do not hardcode production URL.” Optionally show `{baseUrl}` or a config variable in one sample.

---

## 2. Gaps

### 2.1 OpenAPI request/response bodies for auth and heartbeat

- **PRD / TPs**: Require contract alignment with OpenAPI and `docs/api/plugin.md`.
- **OpenAPI**: Defines paths and tags for `/auth/discord/exchange`, `/auth/token-exchange`, `/plugin/heartbeat`; **request/response bodies** for exchange and heartbeat are minimal or generic (e.g. `SuccessResponse`).

**Gap**: No single place that fully specifies request/response JSON (e.g. exchange body: `code`, `code_verifier`, `redirect_uri`; heartbeat body: optional `version`; response fields for token exchange). TP-SPOC-002 and TP-SPOC-003 describe behavior but refer to “OpenAPI spec” for contract.

**Recommendation**: Either (a) add explicit request/response schemas in OpenAPI for these endpoints and keep TPs as references, or (b) add a small “Contract” subsection in `docs/api/plugin.md` and `docs/api/authentication.md` with exact field names and types, and keep OpenAPI in sync.

### 2.2 SimHub SDK interface and “loads in SimHub”

- **NFR-001 / TP-SPOC-001**: Plugin must implement “the SimHub plugin interface (e.g. IPlugin / IDataPlugin as required by the SDK)” and “appear in SimHub’s plugin list/settings”.
- **Gap**: No doc states the **exact** interface names or assembly (e.g. `SimHubPlugin.dll`, `IDataPlugin`) or a minimal checklist (which methods to implement, where the DLL lives, how SimHub discovers it).

**Recommendation**: Add a “SimHub SDK (POC)” subsection in TP-SPOC-001 or the SimHub Plugin LLD: required interface(s), DLL name/path, and a short “Loads in SimHub” checklist (build → copy to Plugins folder → restart SimHub → plugin appears in list/settings). Link to official SimHub plugin docs if available.

### 2.3 Redirect URI and Discord app configuration

- **TP-SPOC-002**: “Redirect URI must be allowed in Discord app configuration” and “Use 127.0.0.1 (not localhost)”.
- **Gap**: No doc states how to register a **dynamic** redirect (e.g. `http://127.0.0.1:{port}/callback`) in the Discord Developer Portal, or whether Discord allows wildcard ports. If only fixed URIs are allowed, the “random port” approach may fail.

**Recommendation**: Add one paragraph in TP-SPOC-002 or the Discord integration LLD: how to configure redirect URIs for plugin (fixed port vs range), and that 127.0.0.1 is required. If Discord supports only fixed URIs, consider documenting “use a fixed port in the range” and reserving it.

### 2.4 Token storage path and GetConfigPath()

- **TP-SPOC-002**: “e.g. `%LocalAppData%\WinPodiums\config.dat`” and “Use TokenStorage.GetConfigPath() for consistency”.
- **Code**: `GetConfigPath()` returns `Path.Combine(localAppData, "WinPodiums", "config.dat")` and creates the directory.
- **LLD**: Shows `config.dat` under `LocalApplicationData\WinPodiums`.

**Gap**: Minor. Path is consistent; only the “optional” refresh token is not clearly called out in TP-SPOC-002 (“Do not store refresh token in POC unless required by API contract”). If the API returns a refresh token, doc could explicitly say “store only access_token and discord_id for POC”.

**Recommendation**: In TP-SPOC-002 token storage bullet, add: “POC persists only access_token and discord_id; do not persist refresh_token unless the API contract requires it.”

---

## 3. Pitfalls

### 3.1 Phase 1 “Full Telemetry Proof” vs “one verification API call (heartbeat)”

- **Phase 1 scope**: “Full Telemetry Proof” is **out** of scope: “Heartbeat, validation, continuity, challenge-response (PRDs/tech plans 001–005)” deferred to Phase 2+.
- **Phase 1 scope**: “Basic SimHub plugin” includes “one call to verification API (heartbeat)”.

**Pitfall**: Readers may think “heartbeat” is deferred. In fact, **one** heartbeat call is in scope for Phase 1/POC; the **full** Telemetry Proof system (validation, continuity, challenge-response, etc.) is Phase 2+.

**Recommendation**: In Phase 1 scope, add one sentence: “Phase 1 includes a single plugin heartbeat call to the API; full Telemetry Proof (validation, continuity, challenge-response) is Phase 2+.”

### 3.2 Product README: “QR/browser auth in plugin” out of scope

- **docs/product/simhub-plugin-poc/README.md**: “Out of scope for the POC: … **QR/browser auth in plugin**, …”

**Pitfall**: Browser auth **is** in scope (Link to Discord = browser PKCE). The phrase “QR/browser auth in plugin” can be read as “both QR and browser are out of scope,” which is wrong.

**Recommendation**: Change to: “Out of scope for the POC: … **QR code auth** in plugin (browser PKCE is in scope), …” or “**QR auth** in plugin; browser PKCE is the primary in-scope method.”

### 3.3 LLD describes full target state; POC is a subset

- **LLD**: Describes full architecture: QR auth, manual token, HMAC verify, race submission, Scrutineering Panel, TelemetryMonitor, VerificationService payload signing, etc.
- **PRD / TPs**: POC = browser PKCE, one heartbeat, minimal UI; position detection, race submission, QR, full UI deferred.

**Pitfall**: Implementers following the LLD alone may build QR, verify endpoint, and full UI before completing the POC. The LLD does not clearly label “POC scope” vs “post-POC.”

**Recommendation**: Add a short “POC vs full design” note at the top of the LLD: “This LLD describes the target architecture. For Phase 1 POC scope (browser auth, one heartbeat, minimal UI only), see PRD-001 and TP-SPOC-001–005. Position detection, QR auth, race submission, and full Scrutineering Panel are post-POC.” Optionally add a table: POC in scope / deferred.

### 3.4 TP-SPOC-005 contract tests: primary endpoint for auth

- **TP-SPOC-005**: “Mock or stub `POST /api/auth/token-exchange` (and optionally `POST /api/auth/discord/exchange`).”

**Pitfall**: For POC, the **primary** auth path is PKCE via `POST /api/auth/discord/exchange`. Manual token (`/api/auth/token-exchange`) is debug-only. Listing token-exchange first may over-emphasize the debug path.

**Recommendation**: Swap order: “Mock or stub `POST /api/auth/discord/exchange` (primary; PKCE). Optionally `POST /api/auth/token-exchange` (debug-only) for contract coverage.”

---

## 4. Misconfigurations

### 4.1 OpenAPI server base and client base URL

- **OpenAPI**: `servers[0].url: https://winpodiums.com/api` (base includes `/api`).
- **TP-SPOC-001/003**: “Base URL” and “`{baseUrl}/api/plugin/heartbeat`” — so `baseUrl` is expected **without** trailing `/api` (e.g. `https://winpodiums.com`), and clients append `/api/...`.

**Status**: Consistent if `baseUrl` is defined as “origin only” (no `/api`). No misconfiguration, but one sentence in TP-SPOC-001 would help: “baseUrl is the API origin (e.g. `https://winpodiums.com` or `http://localhost:8787`); paths like `/api/plugin/heartbeat` are appended by the client.”

### 4.2 Default base URL

- **TP-SPOC-001**: “Default: e.g. `https://winpodiums.com`; local dev e.g. `http://localhost:8787`.”

**Status**: Reasonable. Ensure Worker local dev is actually on 8787 (e.g. Wrangler/Docker) and that the development guide states this so plugin and API match.

---

## 5. Duplicate or contradictory guidance

### 5.1 Duplication (acceptable)

- “Manual token is debug-only, feature-flagged” appears in PRD, LLD, Phase 1 scope, TP-SPOC-002, and API auth docs. **Verdict**: Intentional repetition for clarity; keep it, ensure wording is aligned (e.g. “debug-only”, “feature flag”, “not a user-facing option”).
- “Link to Discord”, “Send heartbeat”, “status” minimal UI is described in PRD FR-004, TP-SPOC-004, and LLD. **Verdict**: PRD/TP as source of truth; LLD can reference “see PRD-001 / TP-SPOC-004 for POC minimal UI.”

### 5.2 Contradictions resolved above

- Loopback port (LLD 54321 vs TP 50000–60000): resolve by aligning LLD to tech plan.
- Browser auth “out of scope” in product README: fix wording so browser auth is clearly in scope.
- LLD hardcoded URL vs configurable base URL: add LLD note and/or placeholder.

### 5.3 SimHub plugin interface: IPlugin vs IDataPlugin

- **PRD NFR-001**: “e.g. IPlugin / IDataPlugin as required by the SDK.”
- **TP-SPOC-001**: “e.g. `IPlugin`, `IDataPlugin` as per SimHub documentation.”
- **LLD**: “PluginMain : IPlugin, IDataPlugin.”

**Status**: Aligned. Only gap is that the actual SDK type names are not verified in repo docs; see §2.2.

---

## 6. Summary of recommended changes

| Priority | Item | Action |
|----------|------|--------|
| High | Product README “QR/browser auth” | Clarify: browser auth in scope; only QR out of scope. |
| High | Phase 1 scope heartbeat vs Full Telemetry Proof | One sentence: one heartbeat in Phase 1; full system Phase 2+. |
| High | LLD vs POC scope | Add “POC vs full design” note and/or table at top of LLD. |
| Medium | LLD hardcoded API URL | Note that base URL is configurable; no hardcoding in samples. |
| Medium | Loopback port | Unify: LLD use “e.g. 50000–60000” and reference TP-SPOC-002. |
| Medium | TP-SPOC-005 contract tests | Prioritize `POST /api/auth/discord/exchange` over token-exchange. |
| Medium | PRD/ID collision (PRD-001) | Disambiguate in prose or adopt distinct IDs where needed. |
| Low | Token storage entropy | LLD align with code (entropy) or reference TokenStorage.cs. |
| Low | OpenAPI/contract detail | Add or reference explicit request/response for exchange/heartbeat. |
| Low | SimHub SDK checklist | Add in TP-SPOC-001 or LLD: interface, path, “loads in SimHub” steps. |
| Low | Discord redirect URI | One paragraph on fixed vs dynamic redirect in Discord app config. |

---

## 7. Related docs

- [Phase 1 MVP Scope](../product/phase-1-mvp-scope.md)
- [PRD-SPOC-001: SimHub Plugin POC](../product/simhub-plugin-poc/001-simhub-plugin-poc.md)
- [SimHub Plugin LLD](../design/components/simhub-plugin.md)
- [Tech plans (SimHub POC)](../tech-plans/simhub-plugin-poc/README.md)
- [API plugin](../api/plugin.md), [API authentication](../api/authentication.md)
- [Discord Integration LLD](../design/integrations/discord-integration.md)
