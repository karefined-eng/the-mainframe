# Design System & Visual Tokens: The Mainframe

## 1. Brand Identity & Aesthetic Principles
The Mainframe is a private, local-first personal operating system built with the "Ponytail" minimalist philosophy: calm, unobtrusive, highly durable, and free of clutter.

- **Mode:** `Persuade` for landing page (`src/landing/`), `Operate` for application dashboard (`src/App.tsx`).
- **Strict Minimalist Rule:** ZERO emojis in the UI. Exclusively use `lucide-react` SVG icons.
- **Cognitive Shield (Neuro-UX):** Capped at 3–5 items in working memory views. Blunt, neutral re-entry cues with zero shame mechanics (no red overdue badges, no broken streaks).
- **Depth Architecture:** Declare elevation once per element using hairline borders (`1px solid #1F2024`) with subtle surface tonal shifts. No ghost cards (no heavy drop shadows combined with borders).

## 2. Color Tokens (Immutable)
| Token Name | Hex Code | Purpose |
|---|---|---|
| `--color-bg` | `#0E0E10` | Base canvas background |
| `--color-surface` | `#1A1A1D` | Interactive card and panel background |
| `--color-surface-alt` | `#141518` | Header, secondary bar, and inset background |
| `--color-border` | `#1F2024` | 1px hairline rule and component divider |
| `--color-text` | `#F2F2F0` | High-contrast primary text |
| `--color-text-muted` | `#B1B3B7` | Secondary text and metadata |
| `--color-accent` | `#4A9EFF` | Primary button, focus indicator, active state (used sparingly) |
| `--color-accent-hover` | `#6BB0FF` | Primary button hover state |
| `--color-warning` | `#FBBF24` | Neutral attention / status tag |

## 3. Typography
- **Primary Interface Font:** `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Font weight: 400 (regular), 500 (medium), 600 (semibold), 700 (bold).
  - Tracking: `-0.022em` on headings; tracking floor stops at `-0.03em`.
- **Code, Numbers, & Measurement Font:** `"JetBrains Mono", ui-monospace, monospace`
  - Used strictly for code snippets, raw paste inputs, terminal commands, tabular measurements, and timestamps. Never used as a general display face.

## 4. Spacing & Layout
- Layout Max Width: `1140px` (`--lp-max`)
- Page Gutter: `clamp(20px, 5vw, 40px)`
- Section Vertical Padding: `clamp(52px, 7vw, 88px)`
- Ruled Lists: Content sections are separated by 1px borders (`lp-ruled`), never stacked cards.
- Radii:
  - Cards and Panels: `12px` – `14px`
  - Buttons and Inputs: `8px` – `10px`
  - Badges and Tags: `4px` – `6px`

## 5. Themed Browser Surfaces
- **Text Selection:** `color-mix(in srgb, #4A9EFF 34%, transparent)` with text `#F2F2F0`.
- **Caret Color:** `#4A9EFF`.
- **Scrollbar:** Thumb `#1F2024`, Track `transparent`, width `10px`.
- **Focus Visible:** `2px solid #4A9EFF`, outline offset `2px`.
- **Underline Offset:** `3px`, thickness `1px`.
