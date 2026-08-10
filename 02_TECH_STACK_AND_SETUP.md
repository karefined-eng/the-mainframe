# The Mainframe — Tech Stack & Setup

## Stack

- **Tauri v2** — Rust backend, single codebase, targets Windows desktop AND Android from the same project. This is the reason Tauri was chosen over a Kotlin/Compose-only approach: Compose would mean two separate codebases for Windows vs Android, which the user explicitly does not want.
- **Frontend**: React + Tailwind CSS. Tailwind chosen for speed of iteration and consistency with the user's other recent builds.
- **Database**: SQLite, via `tauri-plugin-sql`. One `.db` file, same schema on desktop and Android.
- **State management**: keep it minimal — React Context or Zustand, not Redux. This is a single-user local app, not a complex multi-actor system.

## Environment (already available on user's machine)

- Windows 11 Build 26200
- Antigravity IDE (primary editor — build agent runs here)
- Python 3.13, Node.js, Git, GitHub Desktop, Chocolatey
- Docker Desktop, WSL2 (Kali Linux) — not required for this project but available
- ProtonVPN always-on — irrelevant to local build, noted for context only

## Setup steps for the agent

1. `npm create tauri-app@latest the-mainframe -- --template react-ts`
2. Confirm Tauri 2.x is being used (not 1.x) — mobile targets require v2.
3. Add Android target support: `rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android` and configure via `tauri android init` (requires Android SDK/NDK — flag to user if not already installed, do not silently skip).
4. Add `tauri-plugin-sql` with the `sqlite` feature.
5. Install Tailwind CSS into the React frontend per Tailwind's Vite integration docs (Tauri's React template uses Vite).
6. Create the SQLite schema from `01_DATA_SCHEMA.md` as a migration file, run on first app launch if the DB doesn't exist yet.

## Build order (matches project brief section 7)

1. SQLite schema + migrations
2. Rust-side Tauri commands: CRUD operations per domain table (create, read/list, update, delete, mark status)
3. React dashboard shell: sidebar with 5 domain entries (collapsible to icon rail), top period switcher (Daily/Weekly/Monthly — display-only filter on `target_date` for v1, no calendar sync logic)
4. Domain cards in collapsed state (count summaries only)
5. Domain expand view (full list per domain, add/edit/delete inline)
6. Plain-text paste ingestion box per domain
7. Windows build: `tauri build`
8. Android build: `tauri android build` — debug APK first for testing on device, release APK once stable

## Styling reference

- Background: `#0E0E10` (near-black)
- Surface/card background: slightly lighter than base, e.g. `#1A1A1D`
- Primary text: `#F2F2F0` (off-white)
- Accent (active states, current item, highlights only): `#4A9EFF` (electric blue)
- Keep accent usage sparing — one color, used deliberately, not decoratively. This directly reflects the reference app-icon screenshot the user provided (two off-white bars, one blue bar, dark rounded card).
- Dark mode is the only mode required for v1.

## Do not do

- Do not introduce Redux, GraphQL, or a backend server — this is a local-first single-user app.
- Do not build file-upload UI for ingestion — text-paste only, per project brief.
- Do not add authentication/login screens — local app, no accounts in v1.
- Do not scaffold CRDT sync, WebRTC, or any multi-device logic.
