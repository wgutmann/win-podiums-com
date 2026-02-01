# Web Presence

**Project**: WinPodiums  
**Status**: Draft  
**Date**: 2026-02-01  
**Related**: [design-system](design-system.md), [phase-1-mvp-scope](../product/phase-1-mvp-scope.md), [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md), [product-manager-personality](product-manager-personality.md), [HLD](../architecture/high-level-design.md), [next-steps](../architecture/next-steps.md), [brand README](README.md)

**Doc type**: Design | **ID**: DC-WP

---

## 1. Purpose

Single reference for canonical domain, Phase 1 web scope, web framework choice (Cloudflare-associated), and design inspiration. Use this doc with [design-system.md](design-system.md) when evaluating web presence, landing, or design decisions.

---

## 2. Canonical domain

- **Production**: winpodiums.com
- **Phase 1**: No other domains in scope. All Gate, auth, and plugin download flows use this domain (or localhost for development).

---

## 3. Phase 1 web scope

- **Gate**: Landing page at `/` or `/gate` (Worker-served or static assets). Links to Discord auth and plugin download.
- **CTAs** (per [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md)): "Claim Your Invitation" (Path A: web-first) and "Download Plugin" (Path B: plugin-first).
- **Token page**: `/auth/token` for manual token (debug/fallback).
- **Worker vs static**: Gate can be Worker-served HTML or static files (e.g. Astro build output) from Worker static assets or Cloudflare Pages.

---

## 4. Web framework (Cloudflare-associated)

Cloudflare Pages and Workers support many frameworks. For Phase 1 static Gate, the following are relevant:

| Category | Frameworks |
|----------|------------|
| **Static / content-focused** | Astro, Eleventy, Gatsby, Hugo, Jekyll, Docusaurus, VitePress, MkDocs, Pelican, Sphinx, Zola, Hexo, Gridsome |
| **Full-stack / SSR** | Next.js (Edge/OpenNext), SvelteKit, Remix, Qwik, Nuxt, Vue, React, Angular, Ember, Preact |
| **Emerging** | Analog, Blazor, Brunch, Elder.js, Hono, SolidStart |

**Recommendation: Astro** for Phase 1 static Gate.

- **Zero JavaScript by default** — ideal for content-led static landing; strong performance and small payloads.
- **First-class Cloudflare** — `@astrojs/cloudflare` adapter; deploy via [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) or Workers; SSR available if needed later.
- **Design-system friendly** — component islands; use design tokens and typography from [design-system.md](design-system.md) without locking to a single UI framework.
- **Fits stack** — Gate is "Worker-served or static" per [phase-1-mvp-scope](../product/phase-1-mvp-scope.md); Astro build output can be served from Worker static assets or Pages.

**When to consider alternatives**: Next.js if you need React and flexibility between SSG and SSR; SvelteKit/Remix/Qwik if Gate later needs more dynamic server behavior. For a static, design-led Gate, Astro is the recommended default.

---

## 5. Design inspiration

Categorized list of 25+ website design references for sim racing, luxury, exclusive community, and strong design appeal. Use with [design-system.md](design-system.md) for tone and structure.

### Sim racing and motorsport

| # | Name | URL | Why relevant |
|---|------|-----|--------------|
| 1 | iRacing | <https://www.iracing.com/> | Sim racing platform; clear nav, membership, series; accessibility and engagement focus. |
| 2 | iRacing eSports | <https://iracing.com/esports> | Championship/merit framing; standings, schedules; aligns with merit-based community. |
| 3 | IMSA Esports (iRacing) | <https://www.iracing.com/imsa-esports/> | Official series presentation; professional sim-racing tone. |
| 4 | FIA F4 Esports (iRacing) | <https://www.iracing.com/fia-f4-esports/> | High-level esports championship; premium positioning. |
| 5 | Oracle Red Bull Racing | <https://www.redbullracing.com/> | F1 team; "My Paddock," clear IA; countdowns, video, fan engagement. |
| 6 | Mercedes-AMG PETRONAS F1 | <https://www.mercedesamgf1.com/> | F1 team; storytelling, heritage, behind-the-scenes; premium tone. |
| 7 | Formula 1 | <https://formula1.com> | Official F1; results, standings, news; clean data and hierarchy. |
| 8 | McLaren (cars) | <https://cars.mclaren.com/> | "Project VIVA"; supercar configurator, performance focus; luxury automotive. |
| 9 | Bugatti | <https://www.bugatti.com/> | Luxury automotive; immersive, lifestyle-oriented digital experience. |
| 10 | Öhlins Professional Motorsport | <https://www.ohlins.eu/en/products/automotive/professional-motorsport/> | Motorsport product; technical, premium B2B feel. |

### Luxury automotive and premium (Awwwards / editorial)

| # | Name | URL | Why relevant |
|---|------|-----|--------------|
| 11 | Porsche Panamera (Awwwards SOTD) | <https://www.awwwards.com/sites/porsche-panamera> | Dark palette, fullscreen, parallax; black/white/red accent; strong visual impact. |
| 12 | Rolls-Royce Motor Cars (Awwwards) | <https://www.awwwards.com/sites/rolls-royce-motor-cars> | Product + lifestyle; responsive; sophisticated color and typography. |
| 13 | Rivian Automotive (Awwwards SOTD) | <https://www.awwwards.com/sites/rivian-automotive> | Overlay menus, gallery, tech-forward UI; premium EV brand. |
| 14 | Awwwards – Luxury | <https://www.awwwards.com/websites/luxury> | Curated luxury category; broad inspiration for premium feel. |
| 15 | 26 Great Automotive Websites | <https://www.awwwards.com/26-great-automotive-websites.html> | Automotive design roundup; variety of approaches. |
| 16 | TheVelvury | <https://thevelvury.com/> | Luxury web agency; minimal, serif-led, dark luxury aesthetic. |

### Dark / minimal luxury and typography

| # | Name | URL | Why relevant |
|---|------|-----|--------------|
| 17 | Bugatti new website (press) | <https://newsroom.bugatti.com/en/press-releases/> | "Dynamic, immersive"; mystic look and feel; lifestyle brand positioning. |
| 18 | Minimal dark luxury (serif) | — | Design-system alignment: Carbon Fiber + Playfair Display; minimal dark luxury references (e.g. Awwwards luxury, TheVelvury). |

### Exclusive community and membership

| # | Name | URL | Why relevant |
|---|------|-----|--------------|
| 19 | Members Only | <https://www.getmembersonly.com/> | Community/membership platform; member portals, gated feel. |
| 20 | Membership Academy | <https://www.membershipacademy.com/> | Membership site design; clarity and structure. |
| 21 | AccessAlly – design matters | <https://accessally.com/resources/accessally-design/> | Membership UX; design quality and retention. |

### Esports and gaming community

| # | Name | URL | Why relevant |
|---|------|-----|--------------|
| 22 | 29 Top Esports Website Design Examples | <https://muffingroup.com/blog/esports-website-design/> | Esports design patterns; engagement and hierarchy. |
| 23 | eSports Portal (TemplateMonster) | <https://www.templatemonster.com/landings/saas-websites/esports-website-design/> | Esports landing patterns; structure and CTAs. |
| 24 | AEThemes esports | <https://themes.aedevstudio.com/> (esports tag) | Premium esports themes; visual and layout ideas. |
| 25 | ESHUB Forge TeamBuilder | <https://eshub-forge.com/team-builder> | Esports team sites; roster, matches, news; community focus. |

### Sports and data clarity

| # | Name | URL | Why relevant |
|---|------|-----|--------------|
| 26 | ESPN F1 | <https://www.espn.com/f1> | Clean sports data; results, standings; readability. |

---

## 6. Design appeal

All web and landing decisions should align with [design-system.md](design-system.md) (voice, color, typography, motion) and use this inspiration list for tone and structure. **Strong design appeal** means premium, dignified, and technically precise—not cluttered or gimmicky. Gate and any future member-facing pages should reinforce "The Podium Invitation" (luxury, merit-based, dignified recognition).

---

## 7. Related

- [Design system & brand voice](design-system.md)
- [Phase 1 MVP scope](../product/phase-1-mvp-scope.md)
- [ADR-003 Hybrid auth paths](../architecture/decisions/003-hybrid-auth-paths.md)
- [Product manager personality](product-manager-personality.md)
- [Brand README](README.md)
- [Cloudflare Pages framework guides](https://developers.cloudflare.com/pages/framework-guides)
