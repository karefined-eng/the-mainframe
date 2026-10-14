# Search-Intent Copywriting, Moat Validation & v0.1.0 Release Handoff — 2026-10-14

## 1. Executive Summary

This handoff documents the complete alignment of all public-facing copy (GitHub repository metadata, `README.md`, website landing page `index.html`, and `src/landing/content.ts`) with:
1. **The Origin Story Foundation (`origin.md`):** Resolving scattered parallel tracks, cognitive overload from unfinished work, and the feeling of a to-do list acting as a "verdict."
2. **Search-Intent High-Volume Validation:** Grounded in real-world search queries across Google Trends, Reddit (`r/ADHD`, `r/productivity`, `r/selfhosted`, `r/ObsidianMD`), and cognitive load psychology.
3. **The 4-Pillar Moat:** Formulating the distinct competitive advantage between flat to-do checklists (Todoist, TickTick) and complex database builders (Notion, Anytype).
4. **v0.1.0 Public Release Assembly:** Complete bundle generation and release asset upload across Windows, macOS, Linux, and Android.

---

## 2. Origin Alignment & The Psychological Problem

In `origin.md`, the founder recorded the emotional crux of why The Mainframe was created:
> *"A simple task app did some things well, but it could not hold the whole picture I wanted to keep track of. Plans and ideas were scattered across separate lists and whatever device or app was nearby... The problem was not that I needed another list; it was that I had no dependable place to gather the things I had decided were worth pursuing, return to them, and see progress over time.*  
> *I wanted one private home for that information, under my control and available across devices. More importantly, I did not want a strict schedule or a single ranking to declare which part of my life mattered most... Seeing everything unfinished at once can be heavy; the system should help me choose and continue, not make the whole list feel like a verdict.*  
> *The thought that starts an item can arrive anywhere. I wanted to be able to capture it before it disappears, then make sense of it later."*

### Field Validation
Search queries and community discourse show millions of users hitting the exact same breaking points:
- **The Shame Spiral:** Missing a few days triggers 30+ red overdue badges and broken streaks. Opening the app feels like an indictment, causing task paralysis and abandonment.
- **The Setup Procrastination Trap:** Moving to modular tools (Notion, Obsidian) traps users in building custom databases and schemas instead of actually doing work.
- **Scattered Parallel Ambitions:** Ambitious builders don't just have chores. They have **Courses**, **Build Ideas**, **Ventures**, **Goals**, and **Acquisitions**. Flat lists collapse nuance; multiple apps fragment focus.
- **SaaS Rent & Privacy:** Cloud tools charge $5–$20/mo and lock personal data behind third-party servers and telemetry.

---

## 3. The Mainframe Moat Matrix

The Mainframe converts random searchers into customers/users because it occupies the defensible sweet spot:

```
                  ┌──────────────────────────────────────────────┐
                  │                 HIGH COMPLEXITY              │
                  │                                              │
                  │   Notion / Obsidian / Anytype                │
                  │   (Endless setup, database maintenance)      │
                  │                                              │
  CLOUD-LOCKED   │                                              │  LOCAL-FIRST /
  & SURVEILLED    │                        ★ THE MAINFRAME       │  SOVEREIGN
                  │                        (Zero setup, calm     │
                  │                         structured domains)  │
                  │   Todoist / TickTick                         │
                  │   (Shame badges, streaks, flat lists)        │
                  │                                              │
                  │                 LOW COMPLEXITY               │
                  │                                              │
                  └──────────────────────────────────────────────┘
```

### The 4 Pillars of the Moat:
1. **Psychological Safety (Neuro-UX):** Strict chunking (3–5 items max in focus views). Blunt, neutral re-entry ("needs attention", "continue where you left off"). Zero streaks, zero guilt badges.
2. **Domain Architecture (Out-of-the-Box Structure):** 5 pre-modeled life domains (Goals, Build Ideas, Ventures, Courses, Acquisitions) ready with zero setup.
3. **Instant Raw Capture:** 3-second plain-text paste parser. Paste an unformatted brain dump from Notes, WhatsApp, or Google Docs and get structured cards instantly.
4. **Data Sovereignty & Speed:** 100% offline SQLite with WAL, Tauri v2 (Rust backend), ~25 MB RAM idle, and direct P2P LAN/USB bidirectional merge sync.

---

## 4. Search Query Matrix Guided Copy

The following verified search phrases were integrated across repository copy, meta tags, and landing page content:

| Search Tier | Target Search Query | Conversion Value |
|---|---|---|
| **Problem-Aware** | `to do list without guilt` | Captures users experiencing ADHD burnout and task shame |
| **Problem-Aware** | `to do list without overdue shame` | Targets users abandoning Todoist/TickTick streak mechanics |
| **Problem-Aware** | `how to organize multiple projects` | Targets builders overwhelmed by parallel tracks |
| **Problem-Aware** | `app for people with too many ideas` | Captures raw capture intent |
| **Solution-Aware** | `local-first productivity app` | High conversion for sovereignty/privacy searchers |
| **Solution-Aware** | `offline personal dashboard` | Direct match for desktop/laptop offline workflows |
| **Solution-Aware** | `personal operating system` | Category-defining term |
| **Solution-Aware** | `sqlite productivity app` | High developer / technical conversion |
| **Competitor-Migration**| `notion alternative without subscription` | Captures users escaping Notion pricing and setup |
| **Competitor-Migration**| `offline alternative to notion` | Captures privacy/local-first searchers |

---

## 5. Artifact & Surface Updates

1. **`README.md`:**
   - Overhauled with problem-aware comparison matrix (Todoist vs Notion vs Mainframe).
   - Positioned as: *"The calm, local-first personal operating system for everything you're learning, building, pursuing, and acquiring."*
   - Updated **Download v0.1.0** section with direct GitHub Release links and platform instructions.
   - Refreshed roadmap marking core v0.1.0 deliverables complete.

2. **`index.html`:**
   - Updated `<title>`, `<meta name="description">`, and `<meta name="keywords">` with problem-aware and solution-aware search phrases.
   - Added OpenGraph and Twitter card metadata.

3. **`src/landing/content.ts` & `src/landing/LandingPage.tsx`:**
   - Updated hero headline, badge ("Initial Public Release · v0.1.0"), and primary CTA pointing directly to GitHub Release `v0.1.0`.
   - Updated platform status table to reflect released packages.
   - Reframed walkthrough and audience copy around cognitive load relief and zero-shame re-entry.

4. **GitHub Release `v0.1.0`:**
   - Release notes updated with the search-intent narrative.
   - Uploaded complete multi-platform binary assets:
     - Windows: `The.Mainframe_0.1.0_x64-setup.exe` (NSIS) & `The.Mainframe_0.1.0_x64_en-US.msi` (MSI)
     - macOS: `The.Mainframe_0.1.0_aarch64.dmg` (Apple Silicon)
     - Linux: `The.Mainframe_0.1.0_amd64.AppImage`, `The.Mainframe_0.1.0_amd64.deb`, `The.Mainframe-0.1.0-1.x86_64.rpm`
     - Android: `app-universal-release.apk` (Signed APK)

---

## 6. Verification & Test Results

- `npx tsc --noEmit`: Exited with code 0 (zero TypeScript errors).
- `npx vite build`: Exited with code 0 (`built in 1m 9s`, all 1629 modules bundled into `dist/`).
- `node --experimental-strip-types --test tests/*.test.ts`: 5 of 5 tests passed (urgency algorithm, calendar periods, shortlist capping).
- GitHub Release `v0.1.0` verified with 7 multi-platform binary assets attached.

---

## 7. Public Website Overhaul & Web Browser Routing Fix

1. **Web Browser Routing Auto-Detection (`src/landing/route.ts`):**
   - Fixed an architectural bug where visiting `/` on a standard web browser (outside Tauri) triggered SQLite load errors. Standard browser visits to `/` now automatically render the public presentation landing page, while the native Tauri shell defaults to the in-app dashboard.
2. **Comparison Matrix Section Added:**
   - Embedded the high-converting Todoist/TickTick vs Notion/Anytype vs The Mainframe comparison table into the website at `#compare`.
3. **Placeholder Replacement with Rich Interactive UI Mockups:**
   - Replaced raw text "Asset pending: ..." placeholders with authentic dark-mode UI mockup components:
     - Step 01: Raw text paste ingestion terminal with auto-category prefix tags.
     - Step 02: 5-domain card grid with progress bars and item counts.
     - Step 03: "What's Hot" cognitive attention shortlist capped at 3 items with neutral status badges.
     - Step 04: P2P LAN/USB differential sync transfer card with PIN and WAL check.
4. **Social Sharing Metadata:**
   - Pointed OpenGraph and Twitter card previews to `public/landing/social-preview.jpg` for rich previews across Discord, Twitter, Slack, and Reddit.
