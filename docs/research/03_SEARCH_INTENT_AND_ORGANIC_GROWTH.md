# Search Intent, SEO & Organic Growth Research

**Location:** `docs/research/03_SEARCH_INTENT_AND_ORGANIC_GROWTH.md`  
**Author:** Antigravity AI & Founder  
**Grounded in:** Google Trends query patterns, Reddit community discourse (`r/ADHD`, `r/productivity`, `r/selfhosted`, `r/LocalFirst`, `r/ObsidianMD`), and organic conversion funnel dynamics.

---

## 1. Organic Search Strategy Thesis

Most developer tools fail at organic acquisition because they write copy describing their **implementation architecture** (e.g., *"A Tauri v2 SQLite app with TypeScript"*) rather than the **psychological pain point** being searched for at 11:30 PM by an exhausted user.

To convert organic searchers into long-term users, all public copy (README, website landing page, meta tags, and release notes) must align with the user's emotional state across three distinct search tiers:

```
┌────────────────────────────────────────────────────────┐
│  TIER 1: PROBLEM-AWARE (High Volume / Emotional Pain)   │
│  "to do list without guilt", "adhd friendly task app"  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  TIER 2: SOLUTION-AWARE (High Conversion / Spec-Driven)│
│  "local-first productivity", "offline personal OS"     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  TIER 3: COMPETITOR MIGRATION (Highest Commercial)     │
│  "notion alternative offline", "todoist no streaks"    │
└────────────────────────────────────────────────────────┘
```

---

## 2. High-Intent Search Query Matrix

### Tier 1: Problem-Aware Searches (Highest Volume & Emotional Urgency)
These searchers do not know The Mainframe exists, but they are acutely feeling the friction of traditional to-do lists.

| Target Search Query | Searcher Emotional State | Copy Translation Hook | Placement |
|---|---|---|---|
| `to do list without guilt` | Exhausted by red badges and shame cycles. | *"A to-do list that welcomes you back instead of punishing you."* | Meta description, Hero subhead, README |
| `to do list without overdue shame` | Anxious after returning from vacation/burnout. | *"Blunt, neutral re-entry cues—never an accusation wall."* | Landing page problem section |
| `adhd friendly task manager` | Struggling with executive function and paralysis. | *"Strictly capped at 3–5 items based on cognitive working memory."* | README badges, Meta keywords, Landing copy |
| `how to organize multiple projects` | Overwhelmed by disparate life commitments. | *"Pre-modeled homes for your parallel tracks with zero setup."* | Audience section, GitHub description |
| `app for people with too many ideas` | Ideas vanishing because capture is too tedious. | *"Bring in your messy lists in 3 seconds—paste raw text directly."* | Feature pillar 1, Walkthrough step 1 |
| `why do to do lists feel overwhelming` | Questioning their personal competence. | *"App abandonment is a software design flaw, not a moral failure."* | Blog / Reddit campaign hook |

### Tier 2: Solution-Aware / Category Searches (Highest Technical Alignment)
These searchers already know what architecture they want and are seeking a tool that implements it cleanly.

| Target Search Query | Technical Requirement | Proof Point in The Mainframe |
|---|---|---|
| `local first productivity app` | Zero cloud lock-in, client-side speed. | Tauri v2 + Rust backend, local SQLite database with WAL. |
| `offline personal dashboard` | Full functionality on flights or offline devices. | 100% offline; zero internet calls required for core flow. |
| `personal operating system` | Broad life management beyond chores. | 5 core domains: Goals, Ideas, Ventures, Courses, Acquisitions. |
| `sqlite productivity app` | Direct database inspection and longevity. | Single readable `.db` file; easy backups and SQL queries. |
| `p2p device sync task manager` | Multi-device without third-party servers. | Direct LAN / USB differential sync on port 9377. |

### Tier 3: Competitor Migration Searches (Highest Intent to Switch)
These searchers are actively migrating away from existing tools due to pricing, complexity, or privacy violations.

| Competitor Migration Query | Competitor Friction | The Mainframe Wedge |
|---|---|---|
| `notion alternative without subscription` | $8–$20/mo fees, cloud dependency. | 100% Free & Open Source, zero monthly rent. |
| `simple notion alternative for personal life` | 20 hours wasted on template setup. | 5 pre-built domains ready immediately. |
| `offline alternative to notion` | Cloud lag, white screen on planes. | Sub-second instant boot, zero cloud requirement. |
| `todoist alternative without streaks` | Karma score pressure, red overdue text. | No-shame re-entry, zero streak mechanics. |
| `things 3 alternative for windows and android` | Apple ecosystem lock-in. | Cross-platform desktop (Win/macOS/Linux) and Android. |

---

## 3. Organic Community Distribution Playbook

Paid ads are ineffective for developer tools and privacy-conscious users. Growth must be driven by community distribution where the problem-aware copy resonates:

### Channel 1: Hacker News (Show HN)
- **Title Formulation:**  
  `Show HN: The Mainframe – Calm, local-first personal OS for parallel projects (Tauri/Rust/SQLite)`
- **Key Angles:**
  - Highlight the local-first architecture (SQLite WAL, ~25 MB RAM idle).
  - Emphasize the direct P2P differential LAN/USB sync without cloud middleman.
  - Transparent trade-offs (honest limitations section, unsigned desktop builds in v0.1.0).

### Channel 2: Reddit `r/selfhosted` & `r/LocalFirst`
- **Hook:**  
  *"Tired of productivity tools charging monthly subscriptions for personal data: built a zero-account offline personal OS for PC & Android"*
- **Key Angles:**
  - Data sovereignty (100% offline SQLite).
  - Wired USB sync via `adb reverse tcp:9377 tcp:9377` for zero-firewall sync.
  - Zero telemetry, zero accounts.

### Channel 3: Reddit `r/ADHD` & `r/productivity`
- **Hook:**  
  *"Why to-do apps make us feel guilty (and how we designed a zero-streak, no-shame task dashboard based on cognitive load theory)"*
- **Key Angles:**
  - Why working memory collapses with >5 items (Cowan's limit).
  - The psychological trap of red overdue badges.
  - 3-second raw text paste ingestion from Notes or WhatsApp.

### Channel 4: GitHub Discovery & Topics
Ensure the repository maintains these exact 20 curated discovery topics:
`local-first`, `offline`, `privacy`, `productivity`, `react`, `rust`, `sqlite`, `tauri`, `life-management`, `personal-dashboard`, `typescript`, `android`, `cross-platform`, `self-hosted`, `open-source`, `adhd-friendly`, `offline-first`, `p2p-sync`, `personal-operating-system`, `task-manager`.

---

## 4. Copywriting Guardrails for Future Updates

Future agents and maintainers modifying documentation or marketing copy must follow these rules:
1. **Never make medical or therapeutic claims.** Frame all cognitive benefits as *software design principles* and *cognitive load reduction*, never as medical treatments.
2. **Never lead with pure tech-stack buzzwords.** Always state the human problem before the implementation stack (e.g., *"Calm, zero-shame dashboard for parallel projects"* before *"Built with Tauri v2 and SQLite"*).
3. **Always preserve the comparison matrix.** The table contrasting flat to-do lists, database builders, and The Mainframe is our highest-converting visual asset.
