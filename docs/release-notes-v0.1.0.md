# The Mainframe v0.1.0 — Initial Public Release

**The Mainframe** is a private, local-first life management application. Track courses, goals, ideas, ventures, and purchases with **zero account, zero cloud, and zero telemetry**. Everything stays on your local device in an offline SQLite database.

---

## Highlights

### 🔒 100% Local-First & Offline
- Your data lives strictly on your device in a high-performance SQLite database (`the-mainframe.db`) with Write-Ahead Logging (WAL).
- No logins, no accounts, no subscriptions, and zero tracking.

### 🌐 Direct Device-to-Device LAN Sync
- Wire-free snapshot sync between your PC and Android phone over your local Wi-Fi or USB hotspot.
- QR-code pairing, native Android camera scanning, and time-limited 4-digit PIN authentication.
- Atomic SQLite WAL checkpointing guarantees zero corrupted snapshots during transfer.

### 🧠 Neuro-UX Cognitive Design
- **Strict Chunking:** High-priority queues capped at 3–5 items to prevent working memory overload.
- **No-Shame Delays:** Overdue items are presented neutrally ("blunt re-entry") without punitive red streaks or flashing warnings.
- **Zeigarnik Cues:** Active in-progress loops stay visible to maintain momentum.
- **Implementation Intentions:** Your "when/where/how" execution triggers are preserved verbatim.

### 📊 Five Core Domains
1. **Goals:** Target milestones with urgency scoring and progress bars.
2. **Acquisitions:** Intentional wishlist planning and spending justification.
3. **Build Ideas:** Software prototypes, feature backlog, and execution readiness.
4. **Ventures:** Business ventures, operational milestones, and strategic initiatives.
5. **Certifications & Courses:** Continuous learning paths and timeline tracking.

---

## Downloads

| Platform | Package | Architecture |
|---|---|---|
| **Windows** | `The Mainframe_0.1.0_x64-setup.exe` (Installer) | x64 |
| **Windows** | `The Mainframe_0.1.0_x64_en-US.msi` (MSI Package) | x64 |
| **Android** | `app-universal-release.apk` (Signed Release APK) | arm64 / universal |
| **Linux** | `The Mainframe_0.1.0_amd64.AppImage` / `.deb` | x64 |
| **macOS** | `The Mainframe.app.tar.gz` / `.dmg` | universal / Apple Silicon |

---

## Verifying Integrity
All artifacts are built transparently via GitHub Actions from the open-source repository at [karefined-eng/the-mainframe](https://github.com/karefined-eng/the-mainframe).
