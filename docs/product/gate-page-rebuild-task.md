# Gate Page Rebuild — Verified Requirements & Agent Task

**Doc type**: Product task (PM-verified)  
**Date**: 2026-02-01  
**Purpose**: Gate page does not meet product requirements. This doc verifies requirements from product/brand docs and tasks the agent to delete the current implementation and rebuild the Gate to spec.

**Related**: [Phase 1 MVP scope](phase-1-mvp-scope.md), [ADR-003 Hybrid Auth](../architecture/decisions/003-hybrid-auth-paths.md), [web-presence](../brand/web-presence.md), [design-system](../brand/design-system.md), [product-manager-personality](../brand/product-manager-personality.md)

---

## 1. Verified Requirements (from product docs)

### 1.1 Scope and CTAs (Phase 1 scope, ADR-003, web-presence)

| Requirement | Source |
|-------------|--------|
| **Gate** is the landing page at `/` and `/gate` (Worker-served or static). | [Phase 1 scope](phase-1-mvp-scope.md), [web-presence](../brand/web-presence.md) |
| **Path A (web-first)**: CTA must be **"Claim Your Invitation"** — links to Discord auth. | [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md) § Implementation Details |
| **Path B (plugin-first)**: CTA must be **"Download Plugin"** — allows users to try plugin before committing to auth. | [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md) |
| Website landing page shows **both** CTAs: "Claim Your Invitation" and "Download Plugin". | [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md) |
| **Token page** remains at `/auth/token` for manual token (debug/fallback); linked from Gate when logged in. | [web-presence](../brand/web-presence.md) |

### 1.2 Brand voice and copy (design-system, PM personality)

| Requirement | Source |
|-------------|--------|
| **Voice**: Formal but not stiff; earned, not arrogant; technically precise; encouraging but selective. | [design-system](../brand/design-system.md) § Brand Voice & Messaging |
| **Headline / hero**: Use dignified, ceremonial language (e.g. "Accept Your Invitation" style). Avoid generic "Log in with Discord" as the primary CTA label for Path A; use **"Claim Your Invitation"**. | [design-system](../brand/design-system.md), [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md) |
| **Logged-in state**: Welcome message with username; link to generate plugin token. Copy should feel premium (e.g. "Link your Discord to begin" over "Please log in"). | [design-system](../brand/design-system.md) § Example Microcopy |
| **Error states**: Clear, dignified messaging (e.g. "Verification failed" style); no casual "Oops!" tone. | [design-system](../brand/design-system.md) § Example Microcopy |

### 1.3 Design tokens (Phase 1 = voice + key tokens)

Phase 1 Gate aligns with design-system **voice and key tokens** (colors, typography, accessibility). Full design-system polish is Phase 2+ per [Phase 1 scope](phase-1-mvp-scope.md) and [PM personality](../brand/product-manager-personality.md).

| Token | Requirement | Source |
|-------|-------------|--------|
| **Primary CTA / accents** | Champagne Gold `#D4AF37` (not Discord purple `#5865F2`) | [design-system](../brand/design-system.md) § Color Palette, § Buttons |
| **Background** | White Marble `#FAFAFA` for cards/surfaces | [design-system](../brand/design-system.md) |
| **Text** | Carbon Fiber `#1A1A1A` for body/headers | [design-system](../brand/design-system.md) |
| **Secondary text** | Silver `#C0C0C0` | [design-system](../brand/design-system.md) |
| **Error** | Dark Red `#8B0000` for error states | [design-system](../brand/design-system.md) § Semantic Colors |
| **Headline font** | Playfair Display (serif) for page title / hero | [design-system](../brand/design-system.md) § Typography |
| **Body font** | Inter or Montserrat (sans-serif) | [design-system](../brand/design-system.md) |
| **Spacing** | 8px base unit (e.g. md: 16px, lg: 24px) | [design-system](../brand/design-system.md) § Spacing |
| **Primary button** | Gold gradient, uppercase, letter-spacing; hover lift per design-system `.btn-primary` | [design-system](../brand/design-system.md) § Component Patterns |
| **Cards** | White marble background, subtle border, shadow per design-system `.card` | [design-system](../brand/design-system.md) § Cards |
| **Accessibility** | Contrast (WCAG AA), focus states, 44px min touch target; `prefers-reduced-motion` respected | [design-system](../brand/design-system.md) § Accessibility |

### 1.4 Functional behavior (unchanged)

| Requirement | Notes |
|-------------|--------|
| **Error display** | Show `?error=` and `?message=` from URL (missing_params, config, session_config, auth) with clear, dignified copy. |
| **Logged-in state** | If session cookie valid, show "Welcome, {username}" and link to Generate plugin token (token page). |
| **Links** | Auth: `{baseUrl}/auth/discord`. Token page: `{baseUrl}/auth/token`. API health/docs: `{baseUrl}/api/health`, `{baseUrl}/api-docs`. |
| **Escape user content** | All dynamic text (username, error message) must be HTML-escaped to prevent XSS. |

---

## 2. Current Gate vs Requirements — Gap Summary

| Area | Current | Required |
|------|---------|----------|
| **Path A CTA** | "Log in with Discord" | **"Claim Your Invitation"** |
| **Path B CTA** | Generic "Plugin" section with "Generate plugin token" | **"Download Plugin"** as a clear second path (try before auth) |
| **Primary color** | Discord purple `#5865F2` | Champagne Gold `#D4AF37` |
| **Typography** | system-ui, 1.5rem H1 | Playfair Display for headline; Inter/Montserrat body; design-system scale |
| **Cards / buttons** | Generic gray border, purple btn | White marble cards, gold primary button per design-system |
| **Voice** | "Log in with Discord", "You are logged in" | Ceremonial, dignified ("Claim Your Invitation", premium welcome copy) |
| **Structure** | Single "Log in" card + plugin card | **Two clear paths**: (1) Claim Your Invitation, (2) Download Plugin |

---

## 3. Agent Task: Delete and Rebuild Gate

**Instructions for the implementing agent:**

1. **Delete** the current Gate implementation:
   - In `apps/api/src/index.ts`, remove:
     - The `GateOptions` interface and the `getGateHtml` function (including all inline HTML/CSS and the `escapeHtml` helper used only by the gate).
     - The gate route handler block that calls `getGateHtml` (the `if (path === "/" \|\| path === "/gate")` block).
   - **Do not remove**: Auth callback redirects to `/gate?error=...` (keep redirect targets; the new gate will still live at `/` and `/gate`). Do not remove `escapeHtml` if it is used elsewhere; if it is only used by the gate, remove it with the gate.

2. **Re-add** a minimal gate route in `apps/api/src/index.ts` so that `GET /` and `GET /gate` still return HTML. Implement the new Gate HTML/CSS in the same file (single `getGateHtml(baseUrl, options)`-style function, or equivalent) that:
   - Receives the same inputs as before: `baseUrl`, and options: `{ error, message, profile }` (profile: `{ discord_username: string } | null`).
   - Fetches error/message/profile in the same way as the current handler (from URL params and from `getAuth` + `getProfile`).

3. **Rebuild** the Gate page so that it meets **all** verified requirements in §1 and §2:
   - **CTAs**: Two clear paths — (1) **"Claim Your Invitation"** (links to `{baseUrl}/auth/discord`), (2) **"Download Plugin"** (link to plugin download or instructions; if no download URL exists yet, use placeholder link or "Download Plugin" button that goes to a sensible placeholder, e.g. `#download` or repo/docs link per project).
   - **Copy**: Brand voice throughout (formal but not stiff, dignified). Headline/hero in ceremonial style. Error and welcome copy per design-system examples.
   - **Design tokens**: Champagne Gold primary buttons/accents, White Marble card background, Carbon Fiber text, Silver secondary text, Dark Red for errors. Playfair Display for main headline, Inter (or Montserrat) for body. Spacing and card/button patterns per design-system. Load fonts via link to Google Fonts (Playfair Display, Inter) in the gate page `<head>`.
   - **Structure**: Hero/title; optional short subline; two cards (or two clear sections): Path A "Claim Your Invitation", Path B "Download Plugin"; when logged in, show welcome + "Generate plugin token" link; when error, show error box with escaped message.
   - **Accessibility**: Sufficient contrast, focus styles, escape all dynamic content.

4. **Preserve** existing behavior: same route paths (`/`, `/gate`), same query params for errors, same session/profile check and redirect targets. Only the rendered HTML and styling change.

5. **Do not** change `/auth/token` page in this task (out of scope). Gate rebuild only.

---

## 4. Acceptance Criteria (PM)

- [ ] Gate at `/` and `/gate` shows **two primary CTAs**: "Claim Your Invitation" (Path A) and "Download Plugin" (Path B).
- [ ] Primary CTA and accents use **Champagne Gold** `#D4AF37`; no Discord purple as primary.
- [ ] Headline uses **Playfair Display**; body uses Inter (or Montserrat).
- [ ] Cards and buttons follow design-system tokens (White Marble, gold primary button, spacing).
- [ ] Logged-in state shows welcome + username and link to generate plugin token.
- [ ] Error states show from URL params with dignified, clear copy; dynamic content escaped.
- [ ] Links for auth, token page, API health/docs are correct and use `baseUrl`.

---

## 5. Related

- [Phase 1 MVP scope](phase-1-mvp-scope.md)
- [ADR-003 Hybrid Auth](../architecture/decisions/003-hybrid-auth-paths.md)
- [Web presence](../brand/web-presence.md)
- [Design system](../brand/design-system.md)
- [Product manager personality](../brand/product-manager-personality.md)
