# Learning Proposal: Tauri CI/CD & Cross-Platform Sync Invariants

**Status:** Approved & Applied  
**Date:** 2026-10-14  
**Author:** AI Pair Assistant & Kwadwo Asamoah  
**Trigger:** `/learn` invoked following investigation and fixes of failed GitHub Actions runs (`38545062847`, `38550600999`, `38552604719`) and Android DB sync failure.

---

## 1. Target Location

- **Workspace:** `.agents/AGENTS.md` (inserted under custom rules)
- **Workspace:** `docs/AGENTS.md` (section: "## 3. Known Tool Quirks & Environment Traps")

---

## 2. Classification & Rationale

### Change 1: Tauri Platform-Gated Capability Isolation
- **Kind:** Rule — A strict architectural constraint preventing cross-compilation breakage.
- **Scope:** Workspace (Tauri v2 multi-platform desktop + Android stack).
- **Evidence:** GitHub Actions run `38545062847` failed during `cargo build --target aarch64-linux-android` with code 101 because `updater:default` was in `src-tauri/capabilities/default.json` without platform limits. Fixed by moving it to `src-tauri/capabilities/desktop-updater.json` with `"platforms": ["windows", "macOS", "linux"]`. Run `38552604746` succeeded (`build in 5m38s`).

### Change 2: Passwordless Minisign Key CI Signing
- **Kind:** Rule — Specific environment variable constraint for GitHub Actions CI/CD workflows.
- **Scope:** Workspace (Tauri CI workflows using Minisign).
- **Evidence:** GitHub Actions runs `38550600999` and `38552604719` failed with `failed to decode secret key: incorrect updater private key password: failed to fill whole buffer` when `TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ""` was explicitly set in the workflow. For passwordless keys, the environment variable must be completely unset.

### Change 3: Bulletproof Wired USB Sync via ADB Reverse
- **Kind:** Rule / Procedure — Operational rule for cross-platform SQLite database synchronization.
- **Scope:** Workspace (The Mainframe PC-Android sync architecture).
- **Evidence:** User reported Wi-Fi sync was failing due to local network client isolation and direction confusion. Setting up `adb reverse tcp:9377 tcp:9377` and pulling from `127.0.0.1:9377` resolved the issue instantly, transferring the entire 122KB database in <1s.

---

## 3. Scope

- **Applies to:** Tauri v2 plugin configuration, GitHub Actions workflow definitions, Android compilation, and device-to-device database sync in The Mainframe.
- **Does not apply to:** Generic web frontend code, standalone scripts outside Tauri, or external cloud databases.

---

## 4. Proposed Additions

### Addition A: In `.agents/AGENTS.md`

anchor:
```markdown
# Non-Destructive Bidirectional Sync
When implementing device-to-device data synchronization (e.g., between PC and Mobile):
1. **Never auto-erase**: Never implement destructive syncs that automatically overwrite or erase local data upon connection without explicit consent.
2. **Explicit Directional Control**: Always provide the user with explicit UI options to choose the sync direction (e.g., `PC -> Mobile`, `Mobile -> PC`, or `Merge`) similar to professional audio mixing consoles.
3. **Transport Agnostic**: Support multiple localized transfer protocols where possible (Wired/USB via ADB reverse, Local Wi-Fi, QR code, Bluetooth) to prevent ecosystem lock-in and ensure offline capability.
</RULE>
```

text to insert after that anchor:

```markdown
<RULE>
---
name: Tauri Platform-Gated Capability Isolation
description: >
  Prevents Android/iOS compilation failures in Tauri v2 when using desktop-exclusive plugins (like tauri-plugin-updater).
---
# Tauri Platform-Gated Capability Isolation
When adding plugins that only compile on desktop (e.g. `tauri-plugin-updater`), NEVER place their permissions in unconditional capability files (such as `src-tauri/capabilities/default.json`).
Mobile targets (Android/iOS) do not have the plugin in their dependency tree, causing `cargo build` to fail when validating permissions during ACL compilation.
Instead, always isolate desktop-only permissions into a dedicated capability file (e.g., `src-tauri/capabilities/desktop-updater.json`) with:
`"platforms": ["windows", "macOS", "linux"]`
</RULE>

<RULE>
---
name: Tauri Minisign Passwordless CI Signing
description: >
  Prevents buffer read decryption errors during automated desktop bundling in GitHub Actions CI when using passwordless signing keys.
---
# Tauri Minisign Passwordless CI Signing
When configuring GitHub Actions to sign Tauri desktop update artifacts with a passwordless Minisign key (generated with `tauri signer generate --ci` without password):
1. Pass the private key via `TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}`.
2. DO NOT pass `TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ""` as an empty string. If this variable is defined, Minisign attempts scrypt password decryption and aborts with `failed to decode secret key: incorrect updater private key password: failed to fill whole buffer`. Leave `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` completely unset.
</RULE>

<RULE>
---
name: Bulletproof ADB Reverse Wired Sync
description: >
  Standardizes wired USB synchronization as the primary reliable fallback when local Wi-Fi or firewall blocks device-to-device transfer.
---
# Bulletproof ADB Reverse Wired Sync
When synchronizing the local SQLite database between PC and Android, local Wi-Fi is susceptible to router AP client isolation and Windows Defender Firewall inbound blocking on port 9377.
Whenever a physical Android device is connected via USB:
1. Run `adb reverse tcp:9377 tcp:9377` to tunnel Android port 9377 directly to the PC.
2. Instruct the user to broadcast from the data source device (`Send Database`).
3. On the receiving Android device (`Receive Database`), pull directly from IP `127.0.0.1` and the 6-digit PIN. This eliminates all network failure points.
</RULE>
```

---

## 5. Conflicts and Alternatives

- **Existing Rules:** Extends `Non-Destructive Bidirectional Sync` and `Tauri-First Architecture`. No conflicts with existing rules.
- **Alternatives Considered:** 
  - Storing only in `docs/AGENTS.md` — rejected because `.agents/AGENTS.md` directly informs agent prompt context rules across IDE sessions, whereas `docs/AGENTS.md` is a manual human reference document. Both should remain synchronized.

---

## 6. Verification Plan

1. Re-read `.agents/AGENTS.md` and `docs/AGENTS.md` after approval to confirm exact syntax and XML/Markdown block structure.
2. Verify git status and ensure zero lint or formatting breakage.
