# The Mainframe — Project Brief & Agent Instructions

Status: Concept locked. Ready for scaffold build.
Owner: Kwadw
Purpose of this file: Single source of truth for the IDE agent (Antigravity). Read this file and everything else in this root directory before writing code. Do not re-derive scope — it is already decided below.

---

## 1. What This Is

The Mainframe is a personal, local-first life-management system that consolidates everything currently scattered across separate lists, notes apps, and mental tracking into one dashboard:

- Online courses (name, platform, link, progress)
- Purchases / acquisitions to make (gear, apparel, equipment)
- Long-term goals and bucket-list items
- Build ideas / dev projects / business ventures ("the core mainframe of things to pursue")
- Any other list-shaped life data the user has, expressed as plain text

It is not a generic to-do app. The design principle is **fluid prioritization, not rigid scheduling** — the system reflects what matters across parallel tracks (coursework, freelance client work, personal builds, physical goals) without forcing a single linear queue.

## 2. Problem It Solves

The user currently holds multiple lists across phone and laptop with no single point of truth. Existing "life management" apps (Notion, TickTick-style aggregators, student-life dashboards seen on Instagram/YouTube) solve pieces of this but are either too generic or too heavy. The Mainframe is purpose-built around the user's actual five domains, not a blank generic workspace.

## 3. Core Design Decisions (already made — do not revisit)

| Decision | Resolution |
|---|---|
| Platform strategy | ONE codebase → Windows native desktop (.exe) + Android (.apk). No separate mobile framework. |
| Framework | **Tauri v2** (Rust backend + React/Tailwind frontend). Tauri 2's mobile support covers Android from the same project as the desktop build. |
| Local storage | **SQLite**, accessed via `tauri-plugin-sql`. Same DB file format across platforms. |
| Sync/multi-device | **Local Wi-Fi Network Sync** (Last-write-wins resolution) between Windows and Android. Devices sync when connected to the same local network/port. |
| Auth/security | Not in v1. No DIDs, no Passkeys, no BitLocker/AES-GCM design work. A local passphrase unlocking a SQLCipher-encrypted DB file is the ceiling of what's needed right now. The device disk is already the trust boundary. |
| Data ingestion | Plain-text paste only. NOT file upload, NOT format-specific parsers for MD/CSV/XLSX/PDF. User copies existing lists from wherever (Notion, notes app, anywhere) and pastes as plain text into a text box. One parsing code path: plain text → structured rows. This was explicitly simplified down from an earlier multi-format ingestion pipeline concept. |
| New task entry | Same mechanism as ingestion — type or paste directly into the dashboard. No file round-trip ever, for either bulk import or single new items. |
| Tagging | Deferred. No semantic tagging system in v1. Structure first, tag later once real usage patterns are known. |
| Calendar relationship | The Mainframe is the source of truth. Google Calendar (if connected later) is a one-way, read-only mirror of dates/deadlines. Never the reverse. Not required for v1. |
| Google Calendar-style UI reference | View switcher for daily / weekly / monthly periods, modeled loosely on Calendar's UI, not its data model. |
| "It Worked" Moment | Pasting a raw wall of text and watching it instantly transform into structured rows via the import skill, seeing everything collapsed/calm, and getting useful non-intrusive urgent notifications. |
| Big Domain Sorting | Search/filter box inside domains + automatic sorting (in-progress first, then most recently touched). |
| What's Hot View | **One combined view/dashboard** showing the most urgent items across ALL domains together. |
| "Done" Meaning | Specific completion states (Operating, Failed, Paused, Done) plus an option for the user to type in a custom status string. |
| Recurring Tasks | Supported. The system must handle recurring items (e.g. weekly client deliverables, habits). |
| Re-entry Experience | Blunt and uncomfortable. When returning after time away, show exactly how behind the user is, as this discomfort serves as useful motivation. |

## 4. Visual Identity

- Background: near-black / dark charcoal (`#0E0E10` range)
- Cards / primary text: off-white (`#F2F2F0` range)
- Accent: electric blue (`#4A9EFF` range) — used for active states, the "current" item, highlights only. Single accent color, used sparingly.
- Reference: user-provided app icon screenshot (three horizontal bars, middle bar in accent blue, rounded card) — establishes tone: minimal, high-contrast, one accent, no visual noise.
- Dark mode is default and primary. Light mode can follow later; not blocking v1.

## 5. UI Structure (resolved from UX research pass — see 03_UX_RESEARCH_NOTES.md)

- **Left sidebar**, collapsible to an icon rail: the 5 domains (Studies, Dev/Build Ideas, Acquisitions, Long-term Goals, Ventures — see schema doc for exact naming).
- **Top strip**: period switcher (Daily / Weekly / Monthly), positioned top-left per F-pattern scanning behavior.
- **Main content area**: domain dashboard opens COLLAPSED by default — each domain shows only a count/summary card ("3 courses in progress," "2 items to acquire"). Clicking a domain expands it into its full list. This progressive-disclosure pattern is the direct fix for the "seeing everything unfinished at once is demotivating" problem raised during concept discussion.
- No more than ~5 summary cards visible at once in the collapsed state, per dashboard cognitive-load research (users reliably register the first 3–5 items in a repeated row and disengage after).

## 6. What's Explicitly Out of Scope for v1

Do not build these unless the user asks again after v1 ships:
- Multi-format file parsing (PDF/CSV/XLSX ingestion)
- Real-time multi-user sync or collaboration
- CRDT conflict resolution
- P2P/WebRTC device mesh
- DID/Passkey authentication
- AI-powered semantic tagging or auto-categorization
- Mobile push notifications / background services
- Any file-upload-based workflow, for import OR task entry

## 7. Build Agent Instructions

- This directory (`the-mainframe/`) is the full context. All docs the agent needs are here as plain files — no external MCP/RAG lookup required.
- Read `01_DATA_SCHEMA.md` before touching the database layer.
- Read `02_TECH_STACK_AND_SETUP.md` before scaffolding the project.
- Read `03_UX_RESEARCH_NOTES.md` for the UI rationale, if layout decisions need justification.
- Build order: SQLite schema → Rust/Tauri backend commands (CRUD per domain) → React dashboard shell (sidebar + collapsed cards) → plain-text paste ingestion → domain expand/detail views → Windows build → Android build.
- When in doubt between "more capable" and "ships this week," choose ships-this-week. This mirrors the user's own build pattern on EleViewer (single .exe, PySide6, shipped first, iterated after) — Tauri v1 for Mainframe follows the same discipline.
