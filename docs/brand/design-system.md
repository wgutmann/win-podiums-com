# Visual Design System & Brand Guidelines

**Project**: WinPodiums  
**Brand Philosophy**: "The Podium Invitation" — Luxury, Merit-Based, Dignified Recognition  
**Version**: 1.0

**Doc type**: Design | **ID**: DC-DS | **Related**: [web-presence](web-presence.md), [phase-1-mvp-scope](../product/phase-1-mvp-scope.md), [ADR-003](../architecture/decisions/003-hybrid-auth-paths.md), [product-manager-personality](product-manager-personality.md), [HLD](../architecture/high-level-design.md), [brand README](README.md)

## Brand Positioning

WinPodiums is a **luxury community** for **elite sim racers**. Every design decision must reinforce:
1. **Merit-based access** (earned through podium finishes, not self-reported)
2. **Dignified ceremony** (physical racing podium metaphors)
3. **Premium quality** (high-end materials and refined interactions)

## Color Palette

### Primary Colors

**White Marble** `#FAFAFA`
- **Usage**: Backgrounds, cards, elevated surfaces
- **Metaphor**: Clean, pristine, gallery-like spaces
- **Application**: Main page backgrounds, card containers

**Champagne Gold** `#D4AF37`
- **Usage**: Accents, highlights, CTAs, success states
- **Metaphor**: Trophy metal, podium finish indicators
- **Application**: Primary buttons, verified badges, P1/P2/P3 indicators

**Carbon Fiber** `#1A1A1A`
- **Usage**: Text, dark surfaces, high contrast
- **Metaphor**: Racing materials, technical precision
- **Application**: Body text, headers, plugin UI dark mode

### Secondary Colors

**Silver** `#C0C0C0`
- **Usage**: Secondary text, borders, subtle dividers
- **Application**: Captions, inactive states, horizontal rules

**Platinum** `#E5E4E2`
- **Usage**: Hover states, inactive elements, subtle backgrounds
- **Application**: Button hover borders, disabled inputs

**Deep Black** `#0A0A0A`
- **Usage**: Absolute contrast, shadows, depth
- **Application**: Modal overlays, drop shadows

### Semantic Colors

**Success**: Champagne Gold `#D4AF37`
- **Usage**: Verified state, podium indicators, confirmation messages
- **Rationale**: Gold = achievement (reuses primary brand color)

**Warning**: Amber `#FFA500`
- **Usage**: Pending verification, attention needed
- **Application**: "Authentication required" messages, pending status badges

**Error**: Dark Red `#8B0000`
- **Usage**: Validation failures, critical errors
- **Application**: Form errors, failed submissions, error states

**Info**: Neutral Gray `#4A5568`
- **Usage**: Informational text, neutral notices
- **Application**: Help text, tooltips, informational banners

## Typography

### Headline Font (Serif)

**Family**: "Playfair Display" (primary); "Cormorant Garamond" is an optional alternative.
- **Character**: Elegant, classic, high-end editorial
- **Weights**: 300 (Light) for subtitles, 400 (Regular) for headlines
- **Letter Spacing**: +0.05em (spaced-out for dignified feel)
- **Usage**: Page titles, section headers, ceremonial messages

**Example**:
```
ACCEPT YOUR INVITE ON THE PODIUM
```

### Body Font (Sans-Serif)

**Family**: "Inter" or "Montserrat"
- **Character**: Clean, modern, highly readable
- **Weights**: 400 (Regular) for body, 500 (Medium) for emphasis
- **Letter Spacing**: Normal
- **Usage**: Paragraphs, navigation, UI labels, technical text

### Monospace Font (Technical)

**Family**: "JetBrains Mono" or "Fira Code"
- **Character**: Technical, precise, developer-friendly
- **Usage**: API tokens, version numbers, code snippets, technical specifications

### Typography Scale

```
H1:   48px / 3rem      (Page titles, "Accept Your Invite")
H2:   36px / 2.25rem   (Section headers)
H3:   24px / 1.5rem    (Card titles, subsections)
Large: 18px / 1.125rem (Important paragraphs, emphasis)
Body:  16px / 1rem     (Default text, paragraphs)
Small: 14px / 0.875rem (Captions, metadata, secondary info)
Tiny:  12px / 0.75rem  (Legal text, fine print)
```

## Spacing System

Based on **8px base unit** for consistency:

```
xs:  4px  (0.25rem)  — Tight internal spacing (icon padding)
sm:  8px  (0.5rem)   — Compact spacing (button padding)
md:  16px (1rem)     — Default spacing (card padding)
lg:  24px (1.5rem)   — Comfortable spacing (section gaps)
xl:  32px (2rem)     — Section spacing (major dividers)
2xl: 48px (3rem)     — Major section breaks (hero → content)
3xl: 64px (4rem)     — Hero/landing spacing (top-level sections)
```

## Layout & Grid

**Max Content Width**: 1200px (centered on large screens)
**Grid**: 12-column responsive grid
**Gutter**: 24px between columns

### Breakpoints
- **Mobile**: 0-767px (single column, stacked layout)
- **Tablet**: 768-1023px (2-column hybrid)
- **Desktop**: 1024px+ (full multi-column layout)

## Component Patterns

### Buttons

**Primary (Ceremonial CTA)**

Visual: Gold gradient with subtle shadow, transforms on hover

```css
.btn-primary {
  background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
  color: #1A1A1A;
  padding: 16px 32px;
  border-radius: 2px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}
```

**Secondary (Subtle Actions)**

Visual: Transparent with border, color shifts on hover

```css
.btn-secondary {
  background: transparent;
  border: 1px solid #C0C0C0;
  color: #1A1A1A;
  padding: 12px 24px;
  border-radius: 2px;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover {
  border-color: #D4AF37;
  color: #D4AF37;
}
```

### Cards (Content Containers)

Visual: White marble with subtle shadow, lifts on hover

```css
.card {
  background: #FAFAFA;
  border: 1px solid #E5E4E2;
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
```

### Status Indicators

**Pending**: Pulsing amber circle (1.5s pulse cycle)
```css
.status-pending {
  width: 12px;
  height: 12px;
  background: #FFA500;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**Verified**: Static gold checkmark with subtle glow
```css
.status-verified::before {
  content: "✓";
  color: #D4AF37;
  filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.5));
}
```

**Error**: Red X with shake animation
```css
.status-error::before {
  content: "✕";
  color: #8B0000;
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```

## Transitions & Animations

### Guiding Principles

1. **No Spinners**: Use elegant progress indicators (thin line animations, WinPodiums crest drawing)
2. **Hardware Accelerated**: Only animate `transform` and `opacity` (GPU-accelerated properties)
3. **Smooth Easing**: Use `cubic-bezier(0.4, 0, 0.2, 1)` for all transitions
4. **Dignified Speed**: 300-500ms duration (never fast/jarring)

### "Light-Leak" Transition (Verification Moment)

The signature animation when a user's first podium is verified.

```css
@keyframes lightLeak {
  0% {
    opacity: 0;
    transform: scale(0.95);
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.8); /* Peak brightness like sun hitting a lens */
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1);
  }
}

.verification-reveal {
  animation: lightLeak 800ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### "Curtain Pull" (Dashboard Reveal)

Used when transitioning from landing page to member dashboard.

```css
@keyframes curtainPull {
  0% {
    clip-path: inset(0 100% 0 0); /* Hidden, clipped from right */
  }
  100% {
    clip-path: inset(0 0 0 0); /* Fully revealed */
  }
}

.dashboard-reveal {
  animation: curtainPull 1200ms cubic-bezier(0.65, 0, 0.35, 1);
}
```

## Iconography

**Style**: Minimal, line-based (2px stroke weight)
**Size**: 24x24px default, scale to 16px (small) or 32px (large)
**Color**: Inherit from text color, or Champagne Gold for emphasis
**Library**: Custom icons or Heroicons (outline variant)

### Key Icons
- **Verified Badge**: Gold checkmark in circle
- **Podium**: Trophy or laurel wreath outline
- **Monitoring**: Radar or heartbeat line
- **Settings**: Gear outline
- **Auth**: Lock or key outline

## Accessibility Standards

### Color Contrast

All color combinations meet **WCAG AA minimum**:
- **Body text** (16px): 4.5:1 contrast ratio
- **Large text** (18px+): 3:1 contrast ratio

**Verified Combinations**:
- Carbon Fiber (#1A1A1A) on White Marble (#FAFAFA): 15.9:1 ✓
- Champagne Gold (#D4AF37) on Carbon Fiber (#1A1A1A): 4.8:1 ✓
- Deep Black (#0A0A0A) on White Marble (#FAFAFA): 19.6:1 ✓

### Focus States

All interactive elements must have visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid #D4AF37;
  outline-offset: 2px;
}
```

### Keyboard Navigation

- All interactive elements must be keyboard-accessible (Tab, Enter, Escape)
- Modal dialogs must trap focus (Tab cycles within modal)
- Skip links for main content (`<a href="#main">Skip to content</a>`)

### Screen Readers

- Use semantic HTML (`<nav>`, `<main>`, `<article>`, etc.)
- ARIA labels where semantic HTML is insufficient
- Image `alt` text for all meaningful images (empty `alt=""` for decorative)
- Form labels properly associated with inputs

### Motion

Respect `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Responsive Behavior

### Mobile Adaptations

- **Layout**: Stack all multi-column layouts to single column
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Typography**: Reduce scale by 10-15% (e.g., H1 from 48px → 42px)
- **Animations**: Simplify or disable elaborate animations (faster, less elaborate)
- **Auth**: QR code auth becomes primary method (browser launch secondary)
- **Spacing**: Reduce padding/margins by 25% (e.g., lg: 24px → 18px)

### Tablet Behavior

- **Hybrid Layout**: 2-column grid for content, single column for narrow sections
- **Navigation**: Collapsible sidebar or hamburger menu
- **Touch**: Same 44x44px minimum touch targets

## Design Tokens (Implementation)

For developers: Export as CSS variables or JavaScript/TypeScript constants.

```css
:root {
  /* Colors */
  --color-white-marble: #FAFAFA;
  --color-champagne-gold: #D4AF37;
  --color-carbon-fiber: #1A1A1A;
  --color-silver: #C0C0C0;
  --color-platinum: #E5E4E2;
  --color-deep-black: #0A0A0A;
  --color-warning: #FFA500;
  --color-error: #8B0000;
  --color-info: #4A5568;
  
  /* Typography — headline: Playfair Display primary; optional: Cormorant Garamond */
  --font-headline: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  
  /* Transitions */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-curtain: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 300ms;
  --duration-standard: 500ms;
  --duration-slow: 800ms;
}
```

## Brand Voice & Messaging

### Tone

- **Formal but not stiff**: "Welcome to the Paddock" (not "Welcome to WinPodiums")
- **Earned, not arrogant**: "Your podium finish has been verified" (not "You're elite now")
- **Technical precision**: Use racing terminology correctly (split, incidents, iRating)
- **Encouraging but selective**: "Keep racing" (not "Everyone's a winner")

### Example Microcopy

| Context | Bad | Good |
|---------|-----|------|
| First podium verified | "Congrats! You're in!" | "Verification complete: 1st Place, Spa-Francorchamps" |
| Auth required | "Please log in" | "Link your Discord to begin monitoring" |
| Plugin installed | "Setup complete!" | "Telemetry link established" |
| Error state | "Oops! Something went wrong" | "Verification failed: signature mismatch" |

## Implementation Checklist

- [ ] Load fonts (Playfair Display primary; Inter, JetBrains Mono; optional headline: Cormorant Garamond)
- [ ] Define CSS variables for colors, spacing, typography
- [ ] Create component library (buttons, cards, status indicators)
- [ ] Implement light-leak animation for verification moment
- [ ] Implement curtain-pull animation for dashboard reveal
- [ ] Ensure all interactive elements meet 44x44px minimum touch target
- [ ] Test color contrast ratios (WCAG AA)
- [ ] Add focus states for keyboard navigation
- [ ] Implement prefers-reduced-motion media query
- [ ] Test responsive breakpoints (mobile, tablet, desktop)

## Related Documentation

- [Figma Design File](https://figma.com/...) — (TBD: Once mockups are created)
- [Component Library](https://storybook-url...) — (TBD: Once Storybook is set up)
- [Brand Guidelines PDF](./WinPodiums-Brand-Guidelines.pdf) — (TBD: Export for partners)
