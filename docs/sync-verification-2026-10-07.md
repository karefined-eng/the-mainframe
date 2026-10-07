# Sync Feature Verification & Bug Log — 2026-10-07

Context: the LAN snapshot sync (ports 9377/9378) had never been proven
end-to-end. A CDP-driven test session against the dev app on Windows
found and fixed **four real bugs** in `src-tauri/src/sync.rs`, plus the
missing native QR scanner. All fixes are in commit `a91cd89`.

## Bugs found (all previously shipped, all fixed)

1. **401 on every sync (auth was fully broken).** The server stored the
   display PIN (`482-391`) and compared it verbatim to the `Authorization:
   Bearer <digits>` header clients send (`482391`). Every request failed.
   Fix: normalize both sides to digits before comparing.
2. **Stale snapshot (WAL).** The SQL plugin runs the DB in WAL journal
   mode; recent writes live in `mainframe.db-wal` until a checkpoint.
   Serving only `mainframe.db` could ship a snapshot missing recent
   writes — and `PRAGMA integrity_check` still passes, so the receiver
   cannot detect it. Fix: `wal_checkpoint(TRUNCATE)` in the serve path,
   refuse with 503 if it cannot complete.
3. **Port 9377 never released after Stop Broadcast.** The handler thread
   blocked in `tiny_http` `incoming_requests()` and only noticed the stop
   when a *new* request arrived; until then the listener socket stayed
   open and the next `start_sync_server` failed with error 10048 (the
   "port already in use" the SyncPanel UI already had a message for).
   Fix: AtomicBool stop flag checked every loop iteration + the start
   path nudges the dying thread with a loopback connect and waits (max
   5s) for the port before rebinding.
4. **Advertised IP could be unroutable on Android.** `local_ip()` may
   return the cellular or a virtual adapter's address. Fix:
   `pick_advertised_ip()` probes the route the OS would actually use
   toward a private target (UDP connect, no packets), with subnet
   probes as fallback.

## Also added

- **Native QR scanning** via `tauri-plugin-barcode-scanner` (mobile
  only). The crate is `#![cfg(mobile)]`: on desktop it compiles empty,
  so the `.plugin(...)` registration must be cfg-gated or `cargo check`
  fails on Windows. SyncPanel now has a "Scan Connection QR" button
  that auto-fills IP+PIN and starts the pull. The QR payload contract is
  `http://<ip>/[?port]/?pin=<6 digits>`.

## Verified end-to-end (desktop, CDP-driven)

- serve -> authenticated download of the live DB (122,880 bytes,
  integrity ok, 14 tables, 7 migrations)
- write via the app's SQL plugin -> serve -> pulled DB contains the new
  row (WAL checkpoint proven)
- stop -> port released -> start again on the same port (rebind proven)

## Still to verify on device

- two-way sync with the itel phone (needs the new CI APK)
- QR scan flow with the phone camera + camera permission prompt
- discovery (UDP broadcast) phone <-> desktop on the same Wi-Fi

## Friction traps for future agents

- `tiny_http`'s server thread does not exit on `unblock()` alone: it
  needs either a request or an explicit loop-exit condition. Any code
  that stops a tiny_http server and rebinds the same port must account
  for this.
- PowerShell 5.1 `>` / `adb exec-out screencap -p > file` corrupts
  binary output (CRLF mangling). Use `adb shell screencap /sdcard/x.png`
  + `adb pull`.
- `edit`/`apply_patch` tools fail on this repo's CRLF files when given
  LF content; patch via PowerShell string replace with explicit `` `r`n ``
  or accept the tool's exact-match discipline.
- tauri-plugin-barcode-scanner is mobile-only (`#![cfg(mobile)]`);
  desktop builds see no `init()` symbol.
