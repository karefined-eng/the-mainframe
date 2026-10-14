# The Mainframe v0.1.0 — Calm, Local-First Personal Operating System

**The Mainframe** is the calm, offline-first home for everything you are learning, building, pursuing, and acquiring — without the cloud, without a subscription, and without the shame of a backlog wall.

Five pre-modeled domains. Zero database setup. Zero telemetry. Your data lives strictly on your device.

---

## Why It Exists

Most productivity apps fail in one of two ways:
- **The To-Do List Shame Spiral:** Red overdue badges, broken streaks, and punitive notifications that trigger anxiety instead of action.
- **The Modular Setup Trap:** Blank-canvas tools (Notion, Obsidian) that require hours of schema design before you can capture a single task.

The Mainframe occupies the calm sweet spot: pre-structured life domains that are immediately useful, with Neuro-UX mechanics that welcome you back instead of punishing you for stepping away.

---

## What's In v0.1.0

### Zero-Shame Attention View
The **What's Hot** dashboard surfaces a short, urgency-scored list capped at 3–5 items based on cognitive working memory limits. Returning after a long break shows calm, neutral re-entry cues — never an accusation wall.

### Five Pre-Modeled Life Domains
No blank canvases. No database schema design. Structured homes ready immediately:
1. **Goals** — Target milestones with urgency scoring and time windows.
2. **Build Ideas** — Software prototypes, feature backlogs, and execution readiness.
3. **Ventures** — Business ventures, operational milestones, and strategic initiatives.
4. **Certifications & Courses** — Continuous learning paths and timeline tracking.
5. **Acquisitions** — Intentional purchase planning and spending justification.

### 3-Second Plain-Text Capture
Paste an unformatted wall of text from Apple Notes, WhatsApp, Google Docs, or anywhere else. Each line becomes a structured card in the correct domain instantly. Zero retyping.

### 100% Offline SQLite — No Cloud, No Account
Your database is a local SQLite file with Write-Ahead Logging (WAL). No logins, no subscriptions, no telemetry, and no data that ever leaves your device unless you explicitly choose to sync.

### Direct Device-to-Device Bidirectional Sync
Non-destructive differential merge across your PC and Android phone:
- **Bidirectional Merge (Recommended):** Exchanges only the diff — both devices get newer edits without either overwriting the other.
- **Mirror Snapshot:** One-directional restore with automatic backup before replacement.
- Sync over your local **Wi-Fi** or wired **USB** via `adb reverse tcp:9377 tcp:9377`. No cloud middleman.

### Native Cross-Platform via Tauri v2 (Rust)
Ultra-low memory footprint (~25 MB RAM idle), instant boot, and a single codebase that builds for Windows, macOS, Linux, and Android from the same Rust+React+SQLite stack.

---

## Downloads

| Platform | Package | Architecture |
|---|---|---|
| **Windows** | `The.Mainframe_0.1.0_x64-setup.exe` (NSIS Installer) | x64 |
| **Windows** | `The.Mainframe_0.1.0_x64_en-US.msi` (MSI Package) | x64 |
| **macOS** | `The.Mainframe_0.1.0_aarch64.dmg` (Disk Image) | Apple Silicon (M1/M2/M3) |
| **Linux** | `.AppImage` / `.deb` / `.rpm` | x86_64 |
| **Android** | `app-universal-release.apk` (Signed APK) | arm64-v8a / universal |

> **Desktop builds are unsigned for this initial release.** Windows and macOS will show a security warning on first launch — this is expected and safe. Click "Run Anyway" (Windows) or right-click → Open (macOS) to proceed.

---

## Verifying Integrity

All artifacts are built transparently from the open-source repository via GitHub Actions:
- [Desktop builds workflow](https://github.com/karefined-eng/the-mainframe/actions/workflows/desktop.yml)
- [Android APK workflow](https://github.com/karefined-eng/the-mainframe/actions/workflows/android.yml)

---

## What's Next

- Play Store distribution and macOS notarization
- Universal quick-add and first-run sample workspace
- Snooze / "Not relevant anymore" re-entry mechanics
- Encrypted sync transport for WAN use cases

---

Built with [Tauri v2](https://v2.tauri.app/) · Rust · React · TypeScript · SQLite
Source: [karefined-eng/the-mainframe](https://github.com/karefined-eng/the-mainframe)
