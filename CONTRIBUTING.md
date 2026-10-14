# Contributing to The Mainframe

Thank you for considering a contribution. The Mainframe is a **local-first, privacy-first** life management app — meaning user data is never routed through a server, and the app must function fully offline. Every contribution should preserve that design principle.

---

## The Core Principle

> **Data stays on the user's devices.** If a proposed feature requires a cloud account, remote database, or always-on server connection, it is outside the scope of this project. The optional LAN sync deliberately avoids any cloud intermediary.

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/karefined-eng/the-mainframe.git
cd the-mainframe
npm install
```

### 2. Run the desktop app in development mode

```bash
npm run tauri dev
```

### 3. Run unit tests

```bash
node --experimental-strip-types --test tests/*.test.ts
```

### 4. Verify the frontend bundle and Rust backend

```bash
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

### Prerequisites

- Node.js 18 or newer
- Rust via [rustup](https://rustup.rs/)
- Platform dependencies for [Tauri v2](https://v2.tauri.app/start/prerequisites/)
- Android Studio + Android SDK (only for Android work)

---

## Project Structure

```
the-mainframe/
├── src/                    # React frontend
│   ├── App.tsx             # Root dashboard and routing
│   ├── components/         # Domain views, SyncPanel, Calendar, Import
│   ├── context/            # React context providers
│   └── lib/                # Urgency scoring, DB helpers, date windows
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs          # Tauri command registrations
│   │   └── sync.rs         # LAN sync server, PIN auth, WAL checkpoint
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # App config, CSP, SQLite plugin
├── tests/                  # Node.js unit tests (dashboard logic)
├── docs/                   # Architecture notes, handoffs, research
└── .github/workflows/      # CI: desktop and Android builds
```

---

## How to Contribute

### Bug reports

Use the [Bug Report issue template](.github/ISSUE_TEMPLATE/bug_report.yml). Include:
- Your platform (Windows / macOS / Linux / Android)
- The app version or git commit
- Clear reproduction steps
- Relevant error output (from the Tauri dev console or `adb logcat`)

**Please do not attach `.db` files or screenshots containing personal data.**

### Feature requests

Use the [Feature Request issue template](.github/ISSUE_TEMPLATE/feature_request.yml). Describe the problem you are solving, not just the solution. Features requiring a server, cloud account, or mandatory internet connection are out of scope.

### Pull Requests

1. Fork the repository and create a branch from `main`
2. Make focused, well-scoped changes — one concern per PR
3. Ensure `npm run build` and `cargo check --manifest-path src-tauri/Cargo.toml` pass without errors
4. Ensure `node --experimental-strip-types --test tests/*.test.ts` passes
5. Write a clear PR description: what changed and why
6. Reference any related issue with `Fixes #<number>`

### Good first issues

Look for issues tagged [`good first issue`](https://github.com/karefined-eng/the-mainframe/labels/good%20first%20issue) — these are intentionally scoped for contributors who are new to the codebase.

---

## Code Style

- **TypeScript:** Follow existing patterns; no `any` unless unavoidable
- **Rust:** Use `cargo fmt` and `cargo clippy` before committing
- **Icons:** Use `lucide-react` SVG icons — no emojis in UI
- **CSS variables:** Do not modify the design tokens in `src/index.css` without an explicit discussion
- **SQL:** Use `INSERT OR IGNORE` for deduplication; never raw string interpolation in SQL

---

## Environment Traps (Read Before Debugging)

| Trap | Workaround |
|---|---|
| `&&` fails in PowerShell | Use `;` to chain commands |
| `adb exec-out screencap -p > file` produces corrupt PNG on Windows | Use `adb shell screencap /sdcard/x.png && adb pull /sdcard/x.png` |
| `barcode-scanner` plugin is mobile-only (`#![cfg(mobile)]`) | Desktop `cargo check` passes; do not call scanner APIs from desktop code paths |
| Tauri SQL plugin uses WAL mode | Serve sync always checkpoints WAL first (`PRAGMA wal_checkpoint(TRUNCATE)`) |
| Port 9377 lingers after Stop Broadcast | `start_sync_server` waits up to 5s and nudges the dying thread; don't force-kill |

---

## Security

See [SECURITY-REVIEW.md](SECURITY-REVIEW.md) and the project's [Security Policy](.github/SECURITY.md).

To report a vulnerability privately, follow the instructions in the security policy.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
