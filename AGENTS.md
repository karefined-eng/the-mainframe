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
  - `.winget/manifests/k/karefined-eng/the-mainframe/`: Windows Package Manager (winget) manifests for package ID `karefined-eng.the-mainframe` (v0.1.0; NSIS + MSI installers, digests match GitHub release assets).

- **Research & Foundations Library (`docs/research/`):**
  - `docs/origin.md`: Foundational origin story, core reasoning, and psychological intent.
  - `docs/research/01_NEURO_UX_AND_COGNITIVE_PSYCHOLOGY.md`: Working memory limits (3–5 items), zero-shame blunt re-entry, Zeigarnik open loops, implementation intentions.
  - `docs/research/02_COMPETITIVE_MOAT_AND_POSITIONING.md`: The 4-pillar defensible moat (Neuro-UX, 5 domains, 3-sec capture, offline SQLite + P2P sync).
  - `docs/research/03_SEARCH_INTENT_AND_ORGANIC_GROWTH.md`: High-volume verified search query matrix and community distribution playbooks.
  - `docs/research/04_COMPETITOR_LANDING_PAGE_TEARDOWNS.md`: Exhaustive teardowns of 11 competitors (Linear, Raycast, Obsidian, Anytype, Things 3, Zed, LocalSend, Todoist, Superhuman, Logseq, Notion).
  - `docs/research/05_IMPECCABLE_DESIGN_METHODOLOGY.md`: Full 23-command reference, craft floor, surface modes (Persuade, Operate, Read), and absolute bans.
  - `docs/research/search-intent-copywriting-framework.md`: Line-by-line copy implementation guide across README, landing page, and meta tags.
  - `DESIGN.md` & `PRODUCT.md`: Root-level design token locks and product positioning anchors.

## 2. Mandatory Neuro-UX Constraints
1. **Strict Chunking:** High-priority queues (What's Hot) must remain capped at 3–5 items.
2. **Zero Shame Mechanics:** Never use punitive alerts, broken streaks, or red overdue text.
3. **Additive Instant Feedback:** State changes must reflect on screen in milliseconds without waiting on network.
4. **Preserve Action Triggers:** Verbatim user implementation intentions (`action_trigger`) must never be truncated.

## 3. Core Search & Grep Strategies

- Prefer `view_file` with line slices for reading targeted functions.
- Run tests with `node --experimental-strip-types --test tests/*.test.ts`.
- Run frontend anti-pattern audit with `npx impeccable detect`.
- Verify Rust code with `cargo check --manifest-path src-tauri/Cargo.toml`.
- Verify TypeScript & Vite bundle with `npm run build`.

## 4. Known Tool Quirks & Environment Traps (Friction Log)

- **Built-in `browser_subagent` (Playwright CDN 404):** The built-in Antigravity IDE browser agent fails to download Playwright driver on Windows. Write custom scripts or use terminal tools instead.
- **PowerShell Command Separators:** Use `;` instead of `&&` when chaining commands in Windows PowerShell.
- **Windows PowerShell `curl` Alias Trap:** In Windows PowerShell, `curl` is aliased to `Invoke-WebRequest`. Piping or backgrounding this alias can cause hung tasks. Always explicitly call `curl.exe` for fast, headless HTTP checks.
- **Impeccable Detector Font Calibration:** `npx impeccable detect` flags popular fonts like `Inter` as `overused-font`. Because `Inter` is our locked design system token in `src/index.css` and `DESIGN.md`, do not change the font. Instead, add an ignore rule via `.impeccable/config.json` (`npx impeccable ignores add-value overused-font Inter`).
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
- **Skills CLI Silent Git Fallback Delay:** When running `npx skills update` (or `add`) without an authenticated GitHub token, unauthenticated rate limiting prompts the CLI to log `GitHub API unavailable; checking via Git clone` and silently fall back to sequential shallow git cloning. Large upstream repositories (such as `heygen-com/hyperframes`, ~392MB) will take several minutes to download into `%TEMP%\skills-*` while the terminal UI spinner visually appears frozen on the preceding item (e.g. `Updating brag…`). The process is not hung; monitor active git child processes via `Get-CimInstance Win32_Process -Filter "Name = 'git.exe'"` or inspect folder growth in `%TEMP%\skills-*`.
- **`impeccable detect` Live Headless Browser URL vs Localhost:** When auditing a locally running dev server on Windows with `impeccable detect`, use `http://127.0.0.1:1420/` rather than `http://localhost:1420/`. Using `localhost` can cause navigation timeouts (30000ms) under Windows IPv6/IPv4 dual-stack resolution, whereas `127.0.0.1` binds synchronously and completes in seconds.
- **Proportional Font Measure vs Fixed-Character Limits:** When setting container widths to comply with typographic line-length boundaries (`< 80 characters`), setting `max-width: 68ch`–`70ch` can still yield lines of 85–93 characters when rendered with proportional sans-serif fonts (such as Inter) because narrower glyphs (`i`, `l`, `t`, `r`) pack more characters per `ch` unit. Setting container bounds to `max-width: 56ch`–`58ch` reliably caps proportional type below the 80-character readability threshold.
- **Repo Pre-Commit Identity Guard vs Env-Overridden Git Identity:** `git commit` fails with `COMMIT BLOCKED - wrong git identity` because the hook requires `karefined-eng <ka.refined@gmail.com>` while the harness environment sets `GIT_AUTHOR_*`/`GIT_COMMITTER_*` to `Copilot App`. Setting `git config user.name/user.email` does NOT fix this (environment variables override config). Workaround: prefix the commit with inline env vars: `GIT_AUTHOR_NAME='karefined-eng' GIT_AUTHOR_EMAIL='ka.refined@gmail.com' GIT_COMMITTER_NAME='karefined-eng' GIT_COMMITTER_EMAIL='ka.refined@gmail.com' git commit ...`. Never bypass with `--no-verify`.
- **Batch `sed -i` After `git mv` Can Silently Skip a File:** On Windows Git Bash, running one `sed -i 's/old/new/g' renamed-*.yaml` batch over files just renamed with `git mv` left one file unsubstituted while exiting 0. Root cause is timing/locking around the freshly moved files. Workaround: after any batch in-place edit, verify with `grep -rn "old-string" <dir>` and require exit code 1 (no matches) before committing.

- **NPM Audit / Dependabot Friction:** `npm audit` reports 1 high vulnerability (`source-map-js` GHSA-68fv-2mgg-jv7q, CVSS 7.5, allows event-loop DoS through indexed source-map offsets). The vulnerability lives in `@tailwindcss/node@4.3.3` → `source-map-js@1.2.1` as a transitive dependency of `vite@7.3.6`. No `dependabot.yml` is configured in `.github/`; alerts from the GitHub API return null because there is no Dependabot schedule. Manual upgrade path: `npm install @tailwindcss/node@latest` or `npm install source-map-js@1.2.2+` (fix available in 1.2.2+). If auto-dependency updates are needed, add a `dependabot.yml` with `package-ecosystem: npm` and `schedule.interval: weekly`.




