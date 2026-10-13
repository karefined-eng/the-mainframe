# Public Release Readiness & Sync Fix Handoff — 2026-10-13

## 1. Summary of Changes

This sprint finalized the remaining blockers to prepare **The Mainframe** (`karefined-eng/the-mainframe`) for public open-source release:

1. **Resolved LAN Sync Cross-Subnet Rejection (Bug #7 in `src-tauri/src/sync.rs`):**
   - **Root Cause:** `is_local_peer` checked if the first 3 octets (/24) matched between server and peer. On mobile hotspot or USB tethering (where the PC might be on `10.50.205.x` and the phone on `10.34.137.x`), requests were rejected as non-local prior to PIN authentication.
   - **Fix:** Switched to evaluating `is_local_target(peer_ip)`, which strictly enforces RFC 1918 private IPv4, loopback, and link-local ranges without artificially restricting to identical /24 subnets.
   - **Telemetry:** Rejection of non-local peers now returns HTTP 403 Forbidden with logging, cleanly distinguishing it from HTTP 401 Unauthorized (invalid/expired PIN).

2. **Resolved Camera Permission Prompt for Mobile QR Scanner (Bug #8 in `src/components/SyncPanel.tsx`):**
   - **Root Cause:** Android barcode scanner requires explicit runtime permission; calling `scan()` directly returned permission denied without prompting the user.
   - **Fix:** Integrated `checkPermissions()` and `requestPermissions()` from `@tauri-apps/plugin-barcode-scanner`. If permission is not yet granted, it prompts the Android OS dialog before activating the camera.

3. **Open-Source Licensing:**
   - Added standard [MIT License](../../LICENSE) attributed to `karefined-eng`.
   - Updated `package.json` with `"license": "MIT"`.
   - Updated `src-tauri/Cargo.toml` with `license = "MIT"`.
   - Linked license details in [README.md](../../README.md).

4. **Security & Privacy Audit:**
   - Verified that no keystores (`.jks`, `.keystore`), credentials, private keys, or `.env` files are tracked in Git.
   - Verified that `.env*` and `.vercel` remain ignored in `.gitignore`.
   - Ran `git log -p -S` scans for exposed tokens across Git history.

5. **Test & Build Verification:**
   - Frontend bundle (`tsc && vite build`): Succeeded (0 errors).
   - Backend Rust build (`cargo check`): Succeeded (0 errors).
   - Node test suite (`node --experimental-strip-types --test tests/*.test.ts`): All 5 tests passed.

## 2. GitHub Visibility Command

To make the repository public on GitHub, run:

```bash
gh repo edit karefined-eng/the-mainframe --visibility public
```
