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
- **Community & Discoverability Files:**
  - `CONTRIBUTING.md`: Dev setup, project structure, PR workflow, environment traps.
  - `.github/ISSUE_TEMPLATE/`: Structured YAML templates (bug_report.yml, feature_request.yml, config.yml).
  - `.github/SECURITY.md`: Security policy activating GitHub's Security Policy badge.
  - `.github/FUNDING.yml`: Sponsor button foundation.
  - `public/landing/social-preview.jpg`: 16:9 social preview image for GitHub/Twitter/Discord.
  - `scripts/setup-labels.ps1`: PowerShell script for GitHub label curation.
  - `scripts/set-repo-metadata.ps1`: PowerShell script for GitHub Topics + description (run once, requires network).

## 2. Core Search & Grep Strategies

- Prefer `view_file` with line slices for reading targeted functions.
- Run tests with `node --experimental-strip-types --test tests/*.test.ts`.
- Verify Rust code with `cargo check --manifest-path src-tauri/Cargo.toml`.
- Verify TypeScript & Vite bundle with `npm run build`.

## 3. Known Tool Quirks & Environment Traps (Friction Log)

- **Built-in `browser_subagent` (Playwright CDN 404):** The built-in Antigravity IDE browser agent fails to download Playwright driver on Windows. Write custom scripts or use terminal tools instead.
- **PowerShell Command Separators:** Use `;` instead of `&&` when chaining commands in Windows PowerShell.
- **Branch-only File Reads:** The workspace file reader only sees the checked-out branch. For a file present only on another Git branch, use `git show <branch>:<path>` instead of opening it by workspace path.
- **PowerShell UTF-8 without BOM & Smart Quotes:** Windows PowerShell 5.1 interprets UTF-8 `.ps1` files without BOM in Windows-1252. The UTF-8 em-dash byte `0x94` (`—`) maps to `”` (right double quote) in Windows-1252, prematurely terminating quoted strings and exposing interior characters (like `&`) as bare syntax errors (`The ampersand (&) character is not allowed`). Workaround: Keep scripts pure ASCII (use `-` instead of `—`) or save with UTF-8 with BOM.
- **CRLF vs LF Line Endings:** Files in this repository have CRLF line endings. Ensure patch tools use exact character sequences.
- **PowerShell Binary Redirection:** `adb exec-out screencap -p > file` corrupts binary images due to CRLF translation. Use `adb shell screencap /sdcard/x.png` + `adb pull`.
- **`tiny_http` Port Rebinding:** `tiny_http`'s server thread blocks on `incoming_requests()`. When stopping, a thread must exit cleanly or be nudged via a loopback connection before rebinding port 9377.
- **Barcode Scanner Plugin Desktop Symbol:** `tauri-plugin-barcode-scanner` is `#![cfg(mobile)]`. Its `.plugin()` registration in `lib.rs` must remain gated with `#[cfg(mobile)]`.
- **Private Subnet LAN Sync:** USB tethering and mobile hotspots create non-identical private subnets (e.g. `10.50.x.x` vs `10.34.x.x`). Peer authorization checks `is_local_target` (RFC 1918 private / link-local / loopback) rather than assuming a matching /24 octet prefix.
- **Tauri Plugin Updater Platform Scope:** `tauri-plugin-updater` only supports desktop targets (Windows, macOS, Linux). Attempting to compile it on mobile targets (Android/iOS) causes build failure. In `Cargo.toml`, gate the dependency with `[target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]`, and in `src-tauri/src/lib.rs`, gate the builder registration with `#[cfg(not(any(target_os = "android", target_os = "ios")))]`.
- **Tauri ACL Capability Scoping for Desktop-Only Plugins:** Permissions for desktop-only plugins (like `updater:default`) must not be placed in unconditional capability files (`default.json`), otherwise Android cross-compilation fails because the plugin's permissions do not exist in the mobile crate AST. Define them in a separate capability file (e.g. `src-tauri/capabilities/desktop-updater.json`) with `"platforms": ["windows", "macOS", "linux"]`.
- **Tauri Minisign Passwordless CI Signing:**
  1. *Key Length Invariant (Private vs Public):* Minisign public keys are 152 characters Base64, while private keys are 348 characters Base64. If the 152-char public key (`.pub`) is mistakenly saved into `TAURI_SIGNING_PRIVATE_KEY` instead of the 348-char secret key (`.key`), Minisign underflows its secret key read buffer and fails with `failed to decode secret key: incorrect updater private key password: failed to fill whole buffer`. Always ensure `TAURI_SIGNING_PRIVATE_KEY` contains the full 348-character private key.
  2. *Non-Interactive CI Password Handling:* For passwordless keys generated with `tauri signer generate --ci`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""` must be explicitly provided in the workflow environment. If omitted, the signer attempts to prompt standard input for a password, encounters closed EOF on headless CI runners, and fails with `failed to fill whole buffer`.
  3. *Whitespace & Newline Sanitization:* Trailing newlines or CRLF characters in GitHub Secrets cause Tauri's Minisign Base64 decoder to fail with `failed to decode base64 key: Invalid symbol 10, offset <len>` (ASCII 10 is `\n`). Always strip newlines and spaces in CI before invocation: `CLEAN_KEY=$(printf "%s" "${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}" | tr -d '\r\n[:space:]')`.
- **Bulletproof ADB Reverse Wired Sync:** When Wi-Fi LAN sync fails due to Windows Defender Firewall blocking inbound port 9377 or Wi-Fi router AP client isolation, use wired ADB reverse tunneling over USB. Run `adb reverse tcp:9377 tcp:9377`. Then have the PC broadcast (`Send Database`), and on the Android phone (`Receive Database`), pull using IP `127.0.0.1` and the 6-digit PIN. This bypasses Wi-Fi routers and local firewalls entirely with zero packet loss.



