# AGENTS.md — The Mainframe Central Nervous System

## 1. Project Overview & Architecture Map

The Mainframe is a private, local-first life management application built with Tauri v2 (Rust backend) and React + TypeScript + Tailwind CSS (frontend).

- **Frontend:**
  - `src/App.tsx`: Root dashboard with fluid domain cards, timeline, and navigation.
  - `src/components/SyncPanel.tsx`: LAN snapshot sync interface (broadcasting QR code, manual IP/PIN, and native mobile camera scanner).
  - `src/components/`: Domain views (`AcquisitionsView`, `BuildIdeasView`, `CertificationsView`, `GoalsView`, `VenturesView`), Calendar, and Import drawers.
  - `src/lib/`: Database helpers, sync hooks, urgency calculations, and period window filtering.
- **Backend:**
  - `src-tauri/src/main.rs` & `lib.rs`: Entry point and Tauri command registrations.
  - `src-tauri/src/sync.rs`: Local network HTTP snapshot sync server and client (`tiny_http`, `ureq`), WAL checkpointing (`PRAGMA wal_checkpoint(TRUNCATE)`), private network IP discovery, PIN authentication.
  - `src-tauri/tauri.conf.json`: Tauri configuration, window dimensions, CSP security policies, and SQLite plugin preloads.
- **Database:**
  - SQLite managed via `tauri-plugin-sql` and direct backend connections during sync snapshotting.

## 2. Core Search & Grep Strategies

- Prefer `view_file` with line slices for reading targeted functions.
- Run tests with `node --experimental-strip-types --test tests/*.test.ts`.
- Verify Rust code with `cargo check --manifest-path src-tauri/Cargo.toml`.
- Verify TypeScript & Vite bundle with `npm run build`.

## 3. Known Tool Quirks & Environment Traps (Friction Log)

- **Built-in `browser_subagent` (Playwright CDN 404):** The built-in Antigravity IDE browser agent fails to download Playwright driver on Windows. Write custom scripts or use terminal tools instead.
- **PowerShell Command Separators:** Use `;` instead of `&&` when chaining commands in Windows PowerShell.
- **CRLF vs LF Line Endings:** Files in this repository have CRLF line endings. Ensure patch tools use exact character sequences.
- **PowerShell Binary Redirection:** `adb exec-out screencap -p > file` corrupts binary images due to CRLF translation. Use `adb shell screencap /sdcard/x.png` + `adb pull`.
- **`tiny_http` Port Rebinding:** `tiny_http`'s server thread blocks on `incoming_requests()`. When stopping, a thread must exit cleanly or be nudged via a loopback connection before rebinding port 9377.
- **Barcode Scanner Plugin Desktop Symbol:** `tauri-plugin-barcode-scanner` is `#![cfg(mobile)]`. Its `.plugin()` registration in `lib.rs` must remain gated with `#[cfg(mobile)]`.
- **Private Subnet LAN Sync:** USB tethering and mobile hotspots create non-identical private subnets (e.g. `10.50.x.x` vs `10.34.x.x`). Peer authorization checks `is_local_target` (RFC 1918 private / link-local / loopback) rather than assuming a matching /24 octet prefix.
