# Impeccable AI Frontend Design Methodology & Craft Standards

**Document:** `docs/research/05_IMPECCABLE_DESIGN_METHODOLOGY.md`  
**Author:** Antigravity AI & Founder  
**Date:** October 2026  
**Source Attribution:** Paul Bakaus ([`pbakaus/impeccable`](https://skills.sh/pbakaus/impeccable), [Mastering Impeccable](https://www.yeou.dev/articles/mastering-impeccable-ai-frontend-architecture/))  
**Local Workspace Installation:** `.agents/skills/impeccable/`

---

## 1. Core Philosophy: The Deterministic Rail for AI Frontend Craft

Generative AI models left unconstrained inevitably converge on predictable, mediocre frontend patterns:
- Uncalibrated spacing and generic purple-to-blue gradients.
- "Card Soup": endless repeated grids of nested cards containing an icon tile, a generic heading, and two lines of gray text.
- Kicker/eyebrow badges above every heading (`EXPLORE FEATURES`, `WHY CHOOSE US`).
- Monospace fonts used as a decorative costume rather than for actual data, code, or measurements.
- Zero-offset halos and fuzzy drop-shadows combined with thick borders ("ghost cards").

The **Impeccable** skill package enforces strict, deterministic design guardrails across all AI agent sessions. It establishes an uncompromising quality floor, a shared vocabulary of 23 design commands, and 58 automated anti-pattern detection rules.

---

## 2. The Four Surface Modes

Before designing or modifying any interface, agents must declare the **Surface Mode** to govern visual priorities:

1. **Persuade (Landing Pages, Marketing, Pricing):**
   - *Goal:* The visitor decides and acts; design is the product.
   - *Directives:* Earn attention in 3 seconds. Use high-contrast hierarchy, atmospheric lighting, and interactive playgrounds where visitors experience the product live.
2. **Operate (Dashboards, Editors, Tools, Settings):**
   - *Goal:* The visitor completes a task with minimal friction.
   - *Directives:* Scanability, consistency, and native keyboard affordances outrank decorative expression. Strict adherence to working memory limits.
3. **Read (Documentation, Guides, Changelogs):**
   - *Goal:* The visitor understands complex ideas.
   - *Directives:* Optimal typography scale, body measure strictly between 65–75 characters per line, clean ruled dividers.
4. **Experience (Showcases, Visual Walkthroughs):**
   - *Goal:* The visitor is inside the work itself.
   - *Directives:* The interface recedes completely; the artifact leads.

---

## 3. The 23 Impeccable Design Commands

| Command | Category | Purpose & Invariant |
|---|---|---|
| `audit [target]` | Evaluate | Runs deterministic anti-pattern checks (contrast, spacing, typography, a11y, responsive behavior). Reports findings without modifying code. |
| `critique [target]` | Evaluate | Comprehensive UX heuristic review scoring cognitive load, visual hierarchy, and information architecture. |
| `polish [target]` | Refine | The final production pass. Cleans up edge cases, alignment drift, micro-spacing, and token inconsistencies until zero issues remain. |
| `bolder [target]` | Refine | Amplifies bland, safe, or timid interfaces with confident typography, higher contrast, and stronger hierarchy. |
| `quieter [target]` | Refine | Tones down overstimulating, noisy, or aggressive designs (removes unnecessary badges, borders, and competing colors). |
| `distill [target]` | Refine | Strips an interface down to its absolute essence. Eliminates decorative bloat and reduces visual clutter. |
| `typeset [target]` | Enhance | Calibrates typography scale, tracking (stops at `-0.04em`), line heights, and font pairings. |
| `layout [target]` | Enhance | Corrects spatial rhythm, macro-spacing, and grid alignment. Enforces ruled dividers over nested cards. |
| `colorize [target]` | Enhance | Replaces monochromatic or muddy color applications with intentional, strategic accent placement. |
| `animate [target]` | Enhance | Adds purposeful, authored micro-animations respecting `prefers-reduced-motion` with exponential ease-out curves. |
| `delight [target]` | Enhance | Introduces memorable micro-details (hardware keycaps, reactive cards, sound cues, precision hover states). |
| `overdrive [target]` | Enhance | Pushes design boundaries into award-winning territory with cutting-edge visual techniques. |
| `harden [target]` | Refine | Production readiness: audits error states, empty states, boundary overflows, and edge cases. |
| `clarify [target]` | Fix | Sharpens UX copy, microcopy, button labels, and instructional cues. |
| `adapt [target]` | Fix | Ensures responsive perfection across desktop, tablet, and mobile breakpoints. |
| `optimize [target]` | Fix | Eliminates layout shifts (CLS), unnecessary re-renders, and heavy assets for sub-50ms responsiveness. |
| `init` | Build | Generates durable product context in `PRODUCT.md`. |
| `document` | Build | Generates or updates `DESIGN.md` from locked CSS variables and design tokens. |
| `extract [target]` | Build | Extracts reusable tokens and components into the design system. |
| `shape [feature]` | Build | Pre-implementation architectural planning for new frontend features. |
| `onboard [target]` | Refine | Designs first-run experiences and zero-data states. |
| `live` | Iterate | Interactive browser iteration session. |
| `generate [n] [elem]`| Iterate | Generates multiple visual alternatives for a named element in the browser. |

---

## 4. The Craft Floor & Absolute Bans (Non-Negotiable)

### Absolute Bans (Never Permitted in Code)
1. **No Kicker or Eyebrow Badges:** Never place small uppercase labels (`FEATURES`, `WHY US`) floating above an `<h2>` or `<h3>`. Headings carry their own weight; delete the kicker.
2. **No "Card Soup":** Never build pages out of repeated grids of identical cards (icon + heading + paragraph). Nested cards (cards inside cards) are strictly forbidden. Use ruled lines (`1px solid var(--lp-border)`) to separate content.
3. **No Gradient Text:** Emphasis comes from font size, font weight, or color tinting, never text gradients.
4. **No Emojis as UI Icons:** Never use Unicode glyphs or emojis (`✏️`, `📋`, `💾`). Exclusively use real SVG icon libraries (`lucide-react`) in consistent stroke weights (1.5px – 2px).
5. **No Monospace as Costume:** Monospace (`JetBrains Mono`) is strictly reserved for code, timestamps, data rows, and measurements. Never use it decoratively for general headings.
6. **No "Ghost Cards":** Declare elevation once: either a clean border OR a soft diffused shadow, never both.
7. **No Gray Text on Colored Surfaces:** Secondary text on tinted or colored surfaces must be tinted from that hue, never flat neutral gray.
8. **No Functional Text Below 11px:** Microcopy must remain legible.

### Mandatory Verifications (Checked on Every Build)
- **Contrast:** Body copy ≥ 4.5:1; large headings ≥ 3:1 against background.
- **Themed Browser Surfaces:** Default browser elements ruin dark-mode immersion. Always theme:
  - Text selection (`::selection`)
  - Caret color (`caret-color`)
  - Custom scrollbars (`::-webkit-scrollbar` and `scrollbar-color`)
  - Focus rings (`:focus-visible`)
  - Underline offset (`text-underline-offset: 3px`)
- **Spacing Scale:** Tight component groupings paired with generous macro-section padding (`clamp(52px, 7vw, 88px)`).
- **Single Authored Motion Moment:** One purposeful entrance animation per surface, disabling gracefully under `@media (prefers-reduced-motion: reduce)`.

---

## 5. Mainframe Design System Anchor (`docs/DESIGN.md`)

Impeccable commands inspect `DESIGN.md` and `PRODUCT.md` before executing edits. For The Mainframe, the immutable tokens are:

- **Background Base:** `#0E0E10` (Dark obsidian canvas)
- **Surface Elevation 1:** `#141518` (Surface alternative / header)
- **Surface Elevation 2:** `#1A1A1D` (Interactive cards / panels)
- **Hairline Border:** `#1F2024` (Subtle 1px divider rule)
- **Electric Accent:** `#4A9EFF` (Used sparingly for primary actions, active loops, and focal cues)
- **Primary Text:** `#F2F2F0` (High-contrast off-white)
- **Muted Text:** `#B1B3B7` (Calibrated secondary copy)
- **Warning Accent:** `#FBBF24` (Neutral caution / overdue attention)
- **Primary Typography:** `Inter`, -apple-system, sans-serif
- **Code & Measurement Typography:** `JetBrains Mono`, monospace
