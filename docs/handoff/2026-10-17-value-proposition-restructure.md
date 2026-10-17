# Value Proposition Restructure — Worldview-First Positioning

**Date:** 2026-10-17
**Trigger:** Founder critique session — "the value proposition for the app is shaky."

## The Diagnosis

The foundational insight in `docs/origin.md` (a dependable private home for chosen pursuits,
no rigid ranking) was solid, but the outward packaging had three problems:

1. **Overclaimed moat language.** Public copy used "defensible sweet spot" / "defensible
   moat". The four pillars are copyable individually; the honest moats are accumulated-data
   switching costs and FOSS trust. "Defensible" invites debunking on HN/reddit.
2. **Category label with no lane.** "Personal operating system" is a graveyard category
   (Anytype already claims it). We were entering a crowded label instead of owning our own.
3. **Competitor-bashing led the pitch.** README "Why" opened with Todoist/Notion flaws
   instead of our worldview, burying the sharpest asset: the five-domain ontology
   ("your life isn't a flat list").

## The New Positioning

**Worldview first, proof points second:**

- **Hero (H1 everywhere):** "Your life isn't a flat list. It's five parallel tracks."
- **Mirror moment (leads every Why section):** course notes in one app, prototype ideas in
  GitHub issues, gear research in a dozen tabs — scattered because no tool held them all,
  not because you're disorganized.
- **Three defining moments:** the paste (3-second capture) → the return (calm re-entry,
  never shame) → the exit (one SQLite file you own, free forever).
- **Title tag:** `The Mainframe — Local-First Home for Five Parallel Tracks` (57 chars,
  narrower than the previous 58-char SERP-tuned title; keeps the `local-first` keyword).
- **Meta description (146 chars):** "Your life isn't a flat list. Courses, ideas,
  ventures, goals, and acquisitions get calm homes in one private, local-first app with
  offline SQLite."

## Files Changed

| File | Change |
|---|---|
| `index.html` | Title ×3 (title/og/twitter), description ×4, JSON-LD Organization/WebSite/Software descriptions, hero H1 + paragraph, Why mirror-moment paragraph, compare paragraph, footer tagline, freshness dates → 2026-10-17, fixed "zero telemetry, accounts, or telemetry" duplication bug |
| `src/landing/content.ts` | `pageMeta` title + description (metadata.ts derives automatically) |
| `src/landing/LandingPage.tsx` | Hero H1 + sub, Why lede (mirror moment), compare lede (dropped "defensible") |
| `README.md` | Tagline + full "Why" section restructure (mirror → worldview → three moments) |
| `PRODUCT.md` | §1 definition rewritten to the new anchor phrase |
| `DESIGN.md` | §1 descriptor updated |
| `public/llms.txt` | Blockquote positioning + "Key Principles & Defensible Moat" → "Design Invariants" |
| `public/llms-full.txt` | Blockquote positioning |

## Deliberately NOT Changed

- **`meta keywords`** still contains `personal operating system` — it is an invisible
  search-intent capture term (real query volume), not positioning copy. We capture the
  query without claiming the category.
- **`docs/research/*` and `docs/handoff/*`** — historical research record; the moat
  framework remains valid as *internal design invariants* (its §4 feature-rejection test
  is excellent and stays binding).
- **`docs/release-notes-v0.1.0.md`** — published release artifact; retroactive edits
  would diverge from the GitHub release.
- **Comparison tables** (README + landing) — kept but demoted below the worldview;
  tables convert well on GitHub. Framing softened from attacks to facts.

## SEO Constraints Preserved

- Title pixel width: 57 chars vs previous 58 (both under budget; `local-first` keyword kept).
- Meta description 146 chars (within 150–160 target band edge, acceptable).
- Evidence density intact: version, MIT license, release date, port 9377 retained in the
  pre-rendered hero paragraph.
- Freshness signals updated (`meta date`, `article:modified_time`, `dateModified` → 2026-10-17;
  `datePublished` stays 2026-10-14).
- Pre-rendered semantic HTML ↔ React landing copy remain in sync (per the index.html
  header comment contract).

## Verification

- `npm run build` passes (28.8s; the >500 kB chunk warning is pre-existing).
- Grep confirms zero "personal operating system"/"defensible" in public copy except the
  intentional keywords-meta capture term.

## Next Thread (Not Started)

The **capture-loop latency gap** is the remaining substance risk: pillar 3 promises
3-second capture, but thoughts arrive on the phone and sync is LAN/USB snapshot-based, so
phone→desktop visibility can lag by hours. Options: local capture queue on Android that
auto-merges on next contact, or honest messaging about sync cadence. This is an
engineering decision requiring its own session — see `docs/research/02` §4 invariant 4
(any sync redesign must stay peer-to-peer and local-first).
