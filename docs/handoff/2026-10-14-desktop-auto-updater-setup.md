# Desktop In-App Auto-Updater Architecture & Setup

**Date:** 2026-10-14  
**Author:** AI Pair Engineer & Kwadwo Asamoah  
**Component:** Tauri v2 Desktop In-App Auto-Updater  
**Platforms Supported:** Windows (NSIS `.exe` & `.msi`), macOS, Linux (desktop-gated)

---

## 1. Overview & Objective

To ensure seamless, frictionless updates without forcing users to manually download new releases from GitHub or re-run setup installers, The Mainframe now integrates native in-app auto-updating via `@tauri-apps/plugin-updater` and `tauri-plugin-updater`.

When a new GitHub Release is published with desktop bundles and updater artifacts (`latest.json` + `.sig` signatures), The Mainframe can detect updates, download the cryptographic delta payload in the background, display download progress in Settings, and seamlessly restart into the latest version.

---

## 2. Cryptographic Signing Architecture

Tauri v2 requires all auto-updater bundles to be digitally signed using Minisign keypairs to prevent tampering or man-in-the-middle payload substitution.

### A. Generated Keypair
- **Public Key:**
  ```text
  dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDQ4QTdENEREMEExNTM3REYKUldUZk54VUszZFNuU0tLY0xuUm8ydEpvNExKaUxFNTlzS0NCM2R5cktGU2RLNC9YKzJiZWpuYlkK
  ```
- **Public Key File:** `src-tauri/mainframe-updater.key.pub` (tracked in git)
- **Private Key File:** `src-tauri/mainframe-updater.key` (**STRICTLY GIT-IGNORED** via `.gitignore` pattern `*.key`)

### B. CI/CD Secret Configuration
To enable GitHub Actions (`.github/workflows/desktop.yml`) to sign updater builds and generate `latest.json`, the private key must be registered as a GitHub repository secret:
1. Open GitHub: **`karefined-eng/the-mainframe`** -> **Settings** -> **Secrets and variables** -> **Actions**
2. Click **New repository secret**
3. Name: `TAURI_SIGNING_PRIVATE_KEY`
4. Value: Paste the full multiline content of `src-tauri/mainframe-updater.key` (including `untrusted comment: minisign secret key...`)

---

## 3. Configuration & Gating

### A. Desktop-Only Rust Gating
The Tauri updater plugin does not run on Android or iOS. Attempting to compile it on mobile targets causes build failure.
- In `src-tauri/Cargo.toml`:
  ```toml
  [target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]
  tauri-plugin-updater = "2"
  ```
- In `src-tauri/src/lib.rs`:
  ```rust
  #[cfg(not(any(target_os = "android", target_os = "ios")))]
  {
      builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
  }
  ```

### B. Manifest Config (`src-tauri/tauri.conf.json`)
```json
"bundle": {
  "createUpdaterArtifacts": true
},
"plugins": {
  "updater": {
    "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDQ4QTdENEREMEExNTM3REYKUldUZk54VUszZFNuU0tLY0xuUm8ydEpvNExKaUxFNTlzS0NCM2R5cktGU2RLNC9YKzJiZWpuYlkK",
    "endpoints": [
      "https://github.com/karefined-eng/the-mainframe/releases/latest/download/latest.json"
    ]
  }
}
```

### C. Permissions Capability (`src-tauri/capabilities/default.json`)
```json
"permissions": [
  "core:default",
  "sql:default",
  "store:default",
  "updater:default"
]
```

---

## 4. Frontend Neuro-UX Integration (`src/components/Settings.tsx`)

Following Mainframe Neuro-UX guidelines (zero shame mechanics, clean feedback loops, no emojis, purely `lucide-react` icons):
1. **Status Display:** Displays current installed app version (`0.1.0`), platform indicator, and update checking status.
2. **Interactive States:**
   - **Idle:** Clean "Check for Updates" button with `RefreshCw` icon.
   - **Checking:** Smooth spinning loader feedback.
   - **Up to Date:** Subdued green confirmation with `CheckCircle2` icon.
   - **Update Available:** Displays new target version, release notes (if present), and an "Update & Restart" action.
   - **Downloading:** Live percentage progress bar tracking byte download chunks.
   - **Ready / Restarting:** Prompts immediate relaunch with `RotateCw` icon.

---

## 5. Verification & Testing Protocol

1. **Rust Check:**
   ```bash
   cargo check --manifest-path src-tauri/Cargo.toml
   ```
2. **Frontend Check:**
   ```bash
   npm run build
   ```
3. **CI Pipeline:**
   On tag push `v*.*.*`, GitHub Actions will build desktop bundles, sign the installers with `TAURI_SIGNING_PRIVATE_KEY`, generate `latest.json`, and upload everything to the release assets.
