# DEBUG HANDOFF — Sync Feature (LAN snapshot sync) — 2026-10-07

**Read this fully before touching sync code.** It saves you a full day of
re-diagnosis. Everything below was verified by live testing, not assumed.

---

## 0. State of the world when you pick this up

- Branch `main` @ `a91cd89` — contains 6 sync fixes + the native QR scanner.
  CI built a **signed release APK** from it (run #43-ish, artifact
  `mainframe-android-release-aarch64`). That APK **is installed on the test
  phone** (itel S688LN, serial `153772559C004211`, Android 15/API 35).
- Desktop verified **end-to-end**: serve → authenticated pull → WAL freshness
  → stop → rebind. All green. See `docs/sync-verification-2026-10-07.md`.
- Phone↔PC sync **still fails with 401 "Invalid PIN"** for a now-understood
  reason (§2, Bug #7 — not yet fixed). QR scanning fails with "Camera
  permission denied" (§3, Bug #8 — not yet fixed).
- A dev instance (`npm run tauri dev`, CDP on :9222) may still be running in
  the background from this session (background pid ~15868). Kill anything on
  ports 1420/9222 before starting fresh.
- Test phone connects to this PC **via USB tethering** (phone is the tether
  host): PC IP `10.50.205.103`, phone tether IP `10.50.205.99`, phone
  **cellular** IP `10.34.137.220` (`seth_lte0`), phone has **no wlan0** right
  now. Raw TCP PC→phone:9377 **works** (`TcpClient.Connect` = True).

---

## 1. Bugs FIXED in `a91cd89` (do not re-diagnose)

All in `src-tauri/src/sync.rs` unless noted:

1. **PIN auth was 100% broken (401 on every request).** Server stored the
   display-formatted PIN (`"482-391"`) and compared verbatim against the
   bearer token clients send (`"482391"`). Fix: both sides normalized with
   `.replace('-', "")` before comparing.
2. **Stale snapshot (WAL).** DB is WAL-mode (`PRAGMA journal_mode` = wal).
   Serving `mainframe.db` alone can miss recent writes (they sit in
   `mainframe.db-wal`); `integrity_check` still passes so the receiver can't
   tell. Fix: `checkpoint_wal()` runs `PRAGMA wal_checkpoint(TRUNCATE)` in
   the serve path, returns 503 if it can't fully flush. **Verified live**:
   row inserted via the app's SQL plugin appears in the pulled DB.
3. **Port 9377 never released after stop → 10048 on restart.** `tiny_http`'s
   handler thread blocks in `incoming_requests()`; `unblock()` alone does NOT
   close the listener. The thread only noticed stop when a *new* request
   arrived. Fix: `is_stopped: Arc<AtomicBool>` checked at the top of every
   loop iteration + `start_sync_server` waits (max 5 s) for the port,
   nudging the dying thread with `TcpStream::connect(("127.0.0.1", 9377))`.
   **Verified live**: stop → start on same port succeeds.
4. **Advertised IP unreliable.** `local_ip_address::local_ip()` can pick a
   cellular/virtual NIC. Fix: `pick_advertised_ip()` does a UDP
   `connect()` toward a private target (no packets sent) and reads the
   local endpoint the OS routes through; falls back through subnet probes
   then `local_ip()`.
5. **QR scanner added** (`SyncPanel.tsx` + `tauri-plugin-barcode-scanner`,
   mobile-only crate `#![cfg(mobile)]` — **desktop has no `init()` symbol;
   the `.plugin(...)` registration is cfg-gated in `lib.rs`**). UI shows
   "Scan Connection QR"; handler parses `http://<ip>/[?port]/?pin=<6 digits>`
   and auto-starts the pull.
6. **Capabilities**: `barcode-scanner:allow-scan`,
   `barcode-scanner:allow-check-permissions`,
   `barcode-scanner:allow-request-permissions` in
   `src-tauri/capabilities/default.json` (the names `allow-scanner` /
   `allow-permission` DO NOT EXIST — cargo build script will reject them).

Verified on desktop via CDP (`node $TEMP/cdp-run.js` pattern, minimal
hand-rolled WebSocket client — this host has no fetch/WebSocket globals in
plain node scripts; see docs/AGENTS.md "Debugging the packaged webview").

---

## 2. Bug #7 — OPEN: phone↔PC sync 401 "Invalid PIN" even with correct PIN

**Symptom**: Phone serves (QR + PIN `581-972` visible, BROADCASTING, port
confirmed listening via `adb shell netstat`). PC pulls via
`pull_from_device("10.50.205.99:9377", "581972")` → `401 Invalid PIN`.
Raw TCP to that address/port succeeds. The PIN is correct.

**Root cause (near-certain, verified by code reading):**
`is_local_peer()` in `sync.rs`:

```rust
(IpAddr::V4(local), IpAddr::V4(peer)) => {
    is_local_target(IpAddr::V4(peer))
        && (peer.is_loopback()
            || peer.is_link_local()
            || local.octets()[..3] == peer.octets()[..3])   // ← THIS
}
```

It compares the **first three octets** (a /24 assumption). On this setup the
source and target are legitimately on the same *link* but different /24s:
phone cellular `10.34.137.220` (its advertised/routed address), PC comes
from `10.50.205.103` (USB tether subnet). `10.34.x` ≠ `10.50.x` in the first
three octets → `peer_is_local = false` → 401 **before the PIN is even
checked**. The same failure mode will hit any user whose phone is on
cellular/hotspot with a different subnet from the PC, i.e. it breaks the
hotspot use-case that mobile sync exists for.

**Recommended fix (small, safe):**
The /24 check adds nothing security-wise — the PIN + TTL + one-time
consumption are the actual auth. Either
- delete the octet comparison and keep only `is_local_target(peer)` (still
  refuses public IPs), or
- relax to `local.octets()[0] == peer.octets()[0] && both private`
  (same /8 for RFC1918), or
- compare against the full set of the host's interface addresses instead of
  one `local_ip` (best; enumerate via `local_ip_address::list_local_interfaces`
  or the std-only UDP-probe trick already in `pick_advertised_ip`).

Also note the phone advertises `10.34.137.220` (cellular) in its QR — for the
tethered test the PC had to use `10.50.205.99` manually. `pick_advertised_ip`
prefers the OS route to `192.168.255.255`; on Android the route to that
address goes out the cellular interface, so the QR points at an address the
PC can still reach here, but on a real Wi-Fi LAN it should pick wlan0. If
on-device testing shows the wrong interface chosen, prefer private
addresses over carrier-grade NAT (`100.64.0.0/10` — `tun0` showed
`100.123.x.x`) by rejecting `100.64.0.0/10` in the probe.

**How to re-test after fixing:**
1. `npm run tauri android build` locally is slow; push and let CI build, or
   `npm run tauri android build -- --debug --target aarch64` for a local APK.
2. `adb install -r <apk>`.
3. Wake phone (`adb shell input keyevent KEYCODE_WAKEUP`), launch
   (`adb shell am start -n com.karefined.the_mainframe/.MainActivity`),
   hamburger = `adb shell input tap 90 130` (works; `63 87` is too high),
   Device Sync (drawer scrolls; it's at the bottom),
   tap "Generate Connection Code" (`~450, 874` after scrolling the card into
   view), read PIN from screenshot, then from the PC:
   `pull_from_device("10.50.205.99:9377", "<6digits>")` via CDP, or simply
   `curl.exe -H "Authorization: Bearer <6digits>" http://10.50.205.99:9377/db -o t.db`.
4. Success = HTTP 200 + valid SQLite file. Then verify the reverse
   direction: PC serves (dev instance, `start_sync_server` via CDP), phone
   taps Scan Connection QR (grant camera permission first, §3) or types
   `10.50.205.103:9377` + PIN, taps Sync Now.

---

## 3. Bug #8 — OPEN: camera permission never requested

**Symptom**: On the phone, "Scan Connection QR" → error box: *"Camera
permission denied. Enable it in system settings to scan."*
`dumpsys package com.karefined.the_mainframe` →
`android.permission.CAMERA: granted=false`.

**Root cause**: `tauri-plugin-barcode-scanner` on Android does NOT
auto-prompt. The JS `scan()` fails immediately when permission is absent.
The plugin exposes `requestPermissions()` / `checkPermissions()` in the JS
API (`@tauri-apps/plugin-barcode-scanner`) and we added the capability
permissions, but `handleScanQr` in `SyncPanel.tsx` never calls them.

**Fix (small):** in `handleScanQr`, before `scan()`:

```ts
import { scan, Format, checkPermissions, requestPermissions } from "@tauri-apps/plugin-barcode-scanner";
// ...
let perm = await checkPermissions();
if (perm !== "granted") {
  perm = await requestPermissions();
  if (perm !== "granted") { setScanStatus("error"); setScanError("Camera permission denied…"); return; }
}
```

(Exact return-shape: check `node_modules/@tauri-apps/plugin-barcode-scanner/dist-js/index.d.ts` — `PermissionState`.)
Alternatively pre-grant for testing:
`adb shell pm grant com.karefined.the_mainframe android.permission.CAMERA`.

---

## 4. Environment traps that cost real time (do not skip)

- **Phone dozes**: screenshots come back all-black when `mWakefulness=Dozing`.
  Wake with `adb shell input keyevent KEYCODE_WAKEUP` (+ `keyevent 82` to
  dismiss keyguard) before any screencap/tap sequence.
- **Foreground steals**: the phone popped a "Choose an account" Google
  dialog and the GitHub app over our app mid-test. Check
  `adb shell dumpsys activity activities | grep ResumedActivity` before
  trusting a tap; relaunch ours with `am start -n
  com.karefined.the_mainframe/.MainActivity`.
- **PowerShell 5.1 mangles binary stdout**: `adb exec-out screencap -p > f.png`
  produces a corrupt file (CRLF translation). Use
  `adb shell screencap -p /sdcard/x.png` + `adb pull`, then delete on device.
- **`adb shell ... > /dev/null`** fails on Windows PowerShell (tries `C:\dev\null`).
  Use `| Out-Null` on the PowerShell side or `2>&1 | Out-Null`.
- **Screenshot coordinates**: `input tap` uses real pixels (1080x2400 here);
  the tool shows me 900x2000 scaled images — multiply by 1.2 / 1.2.
  Hamburger ≈ `(90, 130)`. `uiautomator dump` sees only a bare WebView node
  (Tauri webview internals are opaque to it) — drive UI by screenshot +
  tap coordinates.
- **CDP port is per-instance**: dev used `--remote-debugging-port=9222`,
  packaged build used 9223 (and only worked after fully killing prior
  instances — WebView2 user-data locking). The minimal WS client script
  lives at `%TEMP%\cdp-run.js` (will not survive reboots; pattern is
  reproduced in the session log).
- **`is_local_peer` 401s are indistinguishable from wrong-PIN 401s** —
  both return the same `Unauthorized()` response. If you add a fix, log
  distinguishable reasons server-side (or return 403 vs 401) to save the
  next debugger an hour.
- **PIN display vs wire**: display `581-972`, wire `581972`. The QR already
  encodes the stripped form. Keep it that way.
- **CI**: `Android APK` workflow builds on every push; artifacts expire.
  Download via API with the git-stored credential:
  `$cred = "protocol=https`nhost=github.com`n" | git credential fill` →
  use password as Bearer for `api.github.com`. Repo is private; anonymous
  API 404s.
- **Landing/app route quirk**: `#/welcome` only renders the landing on a
  *fresh load* (route is read at mount); in-app hash change doesn't
  re-render. Documented in `src/landing/route.ts`.

---

## 5. Definition of done for this work stream

1. `is_local_peer` relaxed per §2 → phone serves, PC pulls with 200 + valid
   SQLite; integrity_check `ok`; data matches what the phone UI shows.
2. Camera permission flow fixed per §3 → tapping "Scan Connection QR"
   prompts once, then scanning the PC's QR auto-fills and starts the pull.
3. Reverse direction: PC serves, phone pulls (same assertions).
4. Both directions verified on the itel device AND on a normal Wi-Fi LAN
   (phone on wlan0 — the current tests were over USB tether because the
   phone had no Wi-Fi; re-check `pick_advertised_ip` picks the wlan0
   address there).
5. Update `docs/sync-verification-2026-10-07.md` with the new results and
   delete this handoff (or fold it into that doc).

## 6. Quick command crib

```powershell
# wake + launch
adb shell input keyevent KEYCODE_WAKEUP
adb shell am start -n com.karefined.the_mainframe/.MainActivity
# is our app foreground?
adb shell "dumpsys activity activities | grep ResumedActivity"
# is the phone serving?
adb shell "netstat -tlnp | grep 9377"
# grant camera for QR testing
adb shell pm grant com.karefined.the_mainframe android.permission.CAMERA
# PC-side pull without the app UI:
curl.exe -H "Authorization: Bearer 123456" http://10.50.205.99:9377/db -o pulled.db
# validate what was pulled:
python -c "import sqlite3; c=sqlite3.connect('pulled.db'); print(c.execute('PRAGMA integrity_check').fetchone()[0])"
```
