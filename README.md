# The Mainframe

[![Desktop Builds](https://github.com/karefined-eng/the-mainframe/actions/workflows/desktop.yml/badge.svg)](https://github.com/karefined-eng/the-mainframe/actions/workflows/desktop.yml)
[![Android APK](https://github.com/karefined-eng/the-mainframe/actions/workflows/android.yml/badge.svg)](https://github.com/karefined-eng/the-mainframe/actions/workflows/android.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=white)](https://v2.tauri.app/)

> **The calm, local-first personal operating system for everything you're learning, building, pursuing, and acquiring.**

A **private, offline-first personal dashboard** for Windows, macOS, Linux, and Android.  
Zero accounts. Zero cloud lock-in. Zero subscription fees. No-shame Neuro-UX design.

![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?logo=sqlite&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white)

---

## Why The Mainframe

Most productivity tools fail because of two extremes:
1. **The To-Do List Shame Spiral:** Apps like Todoist and TickTick punish missed days with rolling overdue dates, red alert badges, and broken streaks—triggering avoidance loops and abandonment.
2. **The Modular Setup Trap:** Tools like Notion, Obsidian, and Anytype require hours of manual database schema building, turning system maintenance into a distraction from actual execution.
3. **Scattered Parallel Ambitions:** Ambitious builders don't just have flat "chores." They have **Courses** they are taking, **Build Ideas** they are prototyping, **Ventures** they are operating, **Goals** they are measuring, and **Acquisitions** they are researching.

The Mainframe sits in the calm, defensible sweet spot: **pre-modeled life domains, zero configuration, no-shame re-entry, and 100% offline sovereignty.**

### How The Mainframe Compares

| Feature / Trait | Standard To-Do Apps (Todoist, TickTick) | Database Builders (Notion, Anytype) | The Mainframe |
|---|---|---|---|
| **Data Storage** | Proprietary Cloud | Cloud / Complex Hybrid | **100% Local SQLite (Offline-First)** |
| **Pricing** | Monthly Subscription ($4–$10/mo) | Free tier with paid walls | **100% Free & Open Source (FOSS)** |
| **Setup Time** | Minimal (flat lists) | Hours of template tuning | **Instant (5 Pre-modeled Domains)** |
| **Overdue Handling** | Punitive red badges & broken streaks | Manual formula / user-built | **Neuro-UX: Neutral re-entry (No shame)** |
| **Cross-Device Sync** | Centralized cloud server | Cloud sync | **P2P LAN / USB Bidirectional Merge** |
| **Scope of Life** | Flat chores & checklists | Requires relational schemas | **Courses, Goals, Ideas, Ventures, Purchases** |

### Core Pillars
- **Strict Chunking & No-Shame Re-entry (Neuro-UX)** — Working memory is respected by capping high-priority focus to 3–5 items. Returning after time away is met with neutral, supportive prompts ("needs attention", "continue where you left off") rather than an accusation wall.
- **Five Pre-Structured Domains** — Instant homes for Courses & Certifications, Build Ideas, Acquisitions, Long-Term Goals, and Ventures with zero database setup.
- **3-Second Plaintext Capture** — Paste unformatted text dumps from Apple Notes, WhatsApp, or Google Docs; The Mainframe parses them directly into structured cards without retyping.
- **Sovereign Local-First Architecture** — Your database is a local SQLite file with Write-Ahead Logging (WAL). Zero cloud telemetry, zero accounts.
- **Direct Device-to-Device Sync** — Non-destructive differential merge across PC and Android over your local Wi-Fi or wired USB (`adb reverse`). No cloud middleman.
- **Native Cross-Platform Performance** — Built with Tauri v2 (Rust backend) for ultra-low memory footprint and instant boot times on Windows, macOS, Linux, and Android.

```mermaid
graph LR
    subgraph "Your Devices (Local-First)"
        PC["Desktop\n(Windows / macOS / Linux)"]
        DB1[("SQLite DB")]
        Phone["Android App"]
        DB2[("SQLite DB")]
    end
    subgraph "Optional LAN Sync (private network only)"
        SYNC["One-time PIN pairing\nPorts 9377/9378"]
    end
    PC <--> DB1
    Phone <--> DB2
    DB1 <-- "Snapshot transfer (opt-in)" --> SYNC
    SYNC --> DB2
    Internet((Internet)) -. "never touches your data" .-> PC
```

---

## Platform Support

| Platform | Deliverable | Status |
|---|---|---|
| Windows 10/11 | Desktop installer via GitHub Actions | ✅ Build target |
| macOS | `.app` / `.dmg` via GitHub Actions | ✅ Build target · signing/notarization pending |
| Linux | AppImage / `.deb` via GitHub Actions | ✅ Build target · test on target distros |
| Android | Signed release APK or debug APK | ✅ Build target · Play Store bundle pending |
| iOS | — | Planned evaluation |

> **Early public release.** Builds are available as GitHub Actions artifacts while the first stable, signed release is prepared. See [Download a build](#download-a-build).

---

## Download a Build

1. Open the [Desktop builds workflow](../../actions/workflows/desktop.yml) or [Android APK workflow](../../actions/workflows/android.yml)
2. Click a successful run
3. Download the artifact for your platform

These are CI artifacts, not yet versioned GitHub Releases. Each platform still needs real-device testing and platform-specific signing before wider distribution.

---

## Quick Start (Contributors)

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Rust via rustup](https://rustup.rs/)
- [Tauri v2 platform dependencies](https://v2.tauri.app/start/prerequisites/)
- Android Studio + Android SDK (Android builds only)

### Run locally

```bash
git clone https://github.com/karefined-eng/the-mainframe.git
cd the-mainframe
npm install

# Desktop dev server
npm run tauri dev

# Android dev (connect device or start emulator first)
npm run tauri android dev
```

### Run tests

```bash
node --experimental-strip-types --test tests/*.test.ts
```

### Build

```bash
npm run build          # frontend type-check + bundle
npm run tauri build    # native desktop bundle
npm run tauri android build -- --target aarch64 --apk  # Android APK
```

If you cannot install native dependencies locally, the GitHub Actions workflows build from a clean runner — fork the repo, push a branch, and download the artifact.

---

## Data & Sync Boundaries

The default workflow is **fully local and offline**. Each device has its own SQLite database with Write-Ahead Logging (WAL).

Mainframe provides direct device-to-device local synchronization with two operational modes:

| Mode | Behavior | Best For |
|---|---|---|
| **Bidirectional Merge** *(Recommended)* | Non-destructive differential exchange (`POST /sync/exchange`). Combines additions and newer edits from both devices without either device overwriting the other. | Day-to-day use across PC and Mobile |
| **Mirror Snapshot** | Atomic snapshot replacement with automatic pre-merge backup (`mainframe_backup_<timestamp>.db`). | Fresh installs or one-way device restores |

### Sync Network Constraints

| Constraint | Detail |
|---|---|
| Network scope | Private/local addresses only (RFC 1918) or wired USB (`adb reverse tcp:9377 tcp:9377`) |
| Authentication | Six-digit one-time PIN bearer token, rotates after completed sync |
| Transfer limit | 64 MiB maximum payload |
| Validation | SQLite schema dynamic column mapping + integrity checks |
| Transport | HTTP cleartext on trusted local network or USB reverse proxy |
| Ports | 9377 (transfer / exchange), 9378 (UDP discovery beacon) |

⚠️ Do not expose sync ports to the public Internet or treat local sync as an external cloud backup.

See [docs/handoff/2026-10-14-bidirectional-merge-sync.md](docs/handoff/2026-10-14-bidirectional-merge-sync.md) for full protocol architecture.

---

## Technology

| Layer | Stack |
|---|---|
| App framework | [Tauri v2](https://v2.tauri.app/) |
| Backend / sync | Rust (`tiny_http`, `ureq`, `rusqlite`) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Database | SQLite via `tauri-plugin-sql` |
| Mobile | Android (aarch64) via Tauri Android |
| Icons | `lucide-react` |

---

## Project Documentation

| Document | Purpose |
|---|---|
| [Project brief](00_PROJECT_BRIEF.md) | Product scope and design decisions |
| [Data schema](01_DATA_SCHEMA.md) | SQLite table definitions and migrations |
| [Tech stack and setup](02_TECH_STACK_AND_SETUP.md) | Toolchain and build configuration |
| [Notification engine](06_NOTIFICATION_ENGINE.md) | Urgency scoring algorithm |
| [Android production guide](10_ANDROID_PRODUCTION_READINESS.md) | Signing, distribution, device testing |
| [Security Review](SECURITY-REVIEW.md) | Security audit findings and disposition |
| [Agent docs (AGENTS.md)](docs/AGENTS.md) | Architecture map and environment traps for AI agents |

The generated Android project under `src-tauri/gen/android` is committed because CI builds directly from it. Regenerate it only when changing Android configuration, then review the diff carefully.

---

## Roadmap

- [ ] Test desktop installers on Windows, macOS, and Linux environments
- [ ] macOS signing / notarization and Windows / Linux distribution hardening
- [ ] Android device testing: install, upgrade, lifecycle, and LAN sync
- [ ] Encrypted transport for LAN sync
- [ ] Versioned release artifacts with changelogs and privacy documentation
- [ ] iOS support evaluation

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

When filing an issue, include your platform, app version or commit, reproduction steps, and relevant logs.  
**Do not attach database files or screenshots containing personal data.**

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
