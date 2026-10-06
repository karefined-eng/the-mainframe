# Agent Operating Manual — The Mainframe

Read this before acting in this repository. It is the project's central
nervous system: what the codebase is, where things live, how to find them,
and which environment traps exist here. The global rules live in
`~/.zcode/AGENTS.md`; the product's intent lives in [origin.md](origin.md).

## What this project is

A local-first life-management desktop + Android app: Tauri v2 (Rust) with a
React 19 + TypeScript + Vite 7 + Tailwind v4 frontend, SQLite storage via
`tauri-plugin-sql`, opt-in LAN snapshot sync, and a public marketing landing
page deployed on Vercel. No accounts, no backend, no telemetry in the app.
Intent and scope: [origin.md](origin.md) and [../00_PROJECT_BRIEF.md](../00_PROJECT_BRIEF.md)
(the brief is the single source of truth — do not re-derive scope).

## Architecture map

### Frontend (`src/`)

- `App.tsx` — the shell. Owns the **`domains` const**, the single registry of
  the eight life domains (certifications, build_ideas, acquisitions, goals,
  ventures, writing, skills, experiences). Anything domain-aware iterates this.
- `components/` — one view per surface: `Sidebar`, `DashboardHome`,
  `DomainView`, `PasteIngest` (the plain-text ingestion path),
  `NotificationEngine`, `SyncPanel`, `CalendarView`, `BackupExport`,
  `FocusDraftingMode`, `Settings`, `Toast`.
- `engine/` — `dashboardModel.ts` (counts, hot items, re-entry summary) and
  `urgency.ts` / `urgencyScoring.ts` (the attention engine; its emitted reason
  strings are the only reasons the landing page may quote).
- `context/SyncContext.tsx` — pass-through sync state provider.
- `landing/` — the public marketing page: `route.ts` (outside Tauri every path
  resolves to the landing; inside Tauri the hash/path rules apply),
  `LandingPage.tsx`, `content.ts` (all copy — every factual claim must mirror a
  verified source documented in its header), `metadata.ts` (SEO; `SITE_ORIGIN`
  is set to the Vercel production domain), `landing.css` (scoped `lp-*`).
- `main.tsx` — mount + `StartupErrorBoundary` + `Root` route shell.

### Backend (`src-tauri/`)

- `src/lib.rs` — Tauri builder + the **7 SQL migrations** (never edit an
  applied migration; append a new version — sqlx stores checksums).
- `src/sync.rs` — LAN snapshot sync over `tiny_http`, ports **9377** (transfer)
  and **9378** (discovery). Cleartext by design; private-network only.
- `tauri.conf.json` — identifier `com.karefined.the-mainframe`, SQL preload
  `sqlite:mainframe.db`, the CSP (see quirks below), window config.
- `capabilities/default.json` — windows/webviews `*`, core + opener + sql perms.
- `gen/android/` — generated Android project (release build is minify-off).

### Data

SQLite DB lives at the app-data dir of the identifier
(`%APPDATA%\com.karefined.the-mainframe\mainframe.db` on Windows). Tables: the
eight domain tables plus `cards`, `item_updates`, `notification_log`,
`app_settings`, `_sqlx_migrations`. Schema changes only via new migrations.

### Web deployment

Vercel, project `the-mainframe` (scope `koasamoah010-4848s-projects`), product
domain **https://the-mainframe-app.vercel.app** (auto-follows production
deploys). `vercel.json` pins build/output/rewrites; `.vercelignore` excludes
everything the web build does not need. Deploy: `vercel --prod --yes` from the
repo root. Analytics: `@vercel/analytics` mounted **only** in `LandingPage`.

## Search and grep strategies

- Domain registry → `grep -n "export const domains" src/App.tsx`.
- Schema truth → `grep -n "version: " src-tauri/src/lib.rs` (migrations).
- Attention/urgency wording → `src/engine/urgencyScoring.ts` (strings there are
  a public-copy contract).
- Landing copy → `src/landing/content.ts`; platform claims must mirror
  `README.md` and are labeled build-target-only.
- CSP/deploy config → `src-tauri/tauri.conf.json`, `vercel.json`,
  `.vercelignore` (root only — the CLI ignores nested .gitignore files).

## Environment traps (project-specific)

General Windows/Git-Bash quirks live in the global `~/.zcode/AGENTS.md`. Ones
unique to this repo:

- **CSP vs Windows plugin IPC:** `ipc:` in the CSP does not cover the Windows
  endpoint `http://ipc.localhost`; without it in `connect-src`, the SQL plugin
  is silently blocked in production builds (dev has no CSP injected, so dev
  works while prod breaks). Already configured — do not remove it.
- **Two identifier data dirs:** old `com.kwadw.the-mainframe` and new
  `com.karefined.the-mainframe` both exist under `%APPDATA%`; both databases
  were verified empty (schema-only). Do not "migrate" between them.
- **Dev server / blank window:** `the-mainframe.bat` runs `npm run tauri dev`
  in a visible console. A blank app window usually means the Vite dev server
  died; the console stays open on exit by design.
- **Debugging the packaged webview:** launch with
  `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222` and
  drive CDP over `node:http` (this kernel has no `fetch`/`WebSocket` globals —
  hand-roll the WebSocket framing or use the minimal client pattern from the
  handoff docs).
- **Vercel CLI upload size:** without the root `.vercelignore`, deploys try to
  upload ~7.4 GB of `src-tauri/target` artifacts and abort. Keep the
  `.vercelignore` in sync when adding top-level directories.

## Workflows

- App dev: `npm run tauri dev` (or `the-mainframe.bat`) — Vite on :1420.
- Web-only landing preview: `npm run dev`, open `http://localhost:1420/#/welcome`
  (plain browser root also shows the landing).
- Installers: `npm run tauri build` → `src-tauri/target/release/bundle/*`;
  copies go to `dist-installers/` (gitignored staging).
- Site deploy: `vercel --prod --yes` (project already linked via `.vercel/`).

## Document map

Root-level numbered docs (`00_PROJECT_BRIEF.md` … `11_MARKET_AND_PRODUCT_RESEARCH.md`)
are the original specification set and stay at the root because code comments
reference them by path. Landing-specific planning lives in
[LANDING_PAGE_PLAN.md](LANDING_PAGE_PLAN.md). Security posture:
[../SECURITY-REVIEW.md](../SECURITY-REVIEW.md). Handoffs:
[handoff/](handoff/). UX rationale: [research/](research/).
