# The Mainframe

**A private, local-first life management app for people whose work, learning, ideas, and goals do not fit in one list.**

The Mainframe brings studies, build ideas, acquisitions, long-term goals, and ventures into one focused dashboard. It is built for offline use with a local SQLite database, so your data stays on your devices instead of requiring an account, cloud subscription, or hosted service.

> **Early public release:** The Mainframe is under active development. Desktop builds and Android APKs are available through GitHub Actions artifacts while the first stable public release is prepared.

## Why The Mainframe

Most productivity tools are either generic task lists or broad workspace platforms. The Mainframe is a focused, privacy-first alternative for personal planning:

- **Local-first and offline:** Your database is stored locally on each device.
- **Five connected domains:** Studies and certifications, build ideas, acquisitions, long-term goals, and ventures.
- **Plain-text capture:** Turn an unstructured wall of text into organized items.
- **What's Hot dashboard:** Surface the work that needs attention across domains.
- **Optional LAN sync:** Move a bounded database snapshot between trusted devices on the same local network with one-time pairing.
- **Cross-platform foundation:** One Tauri v2 codebase targets Windows, macOS, Linux, and Android.

The app does not require a hosted account, telemetry service, or Internet connection for its core local workflow.

## Platform support

| Platform | Current deliverable | Status |
| --- | --- | --- |
| Windows 10/11 | Desktop installer artifacts from GitHub Actions | Build target |
| macOS | `.app`/`.dmg` artifacts from GitHub Actions | Build target; signing/notarization still required for distribution |
| Linux | AppImage/deb artifacts from GitHub Actions | Build target; test on target distributions before release |
| Android | Signed release APK or unsigned debug APK artifact | Build target; Play Store bundle and device testing remain |
| iOS | Not currently configured | Planned evaluation |

Desktop CI artifacts are unsigned unless platform signing is added. Android release signing is optional and uses repository secrets; see the [Android distribution guide](10_ANDROID_PRODUCTION_READINESS.md).

## Download a build

The repository's **Actions** tab contains the latest build artifacts:

1. Open the [Android APK workflow](../../actions/workflows/android.yml) or [desktop workflow](../../actions/workflows/desktop.yml).
2. Open a successful run.
3. Download the artifact for your platform.

These are CI artifacts, not yet versioned GitHub Releases. Before wider distribution, each platform needs real-device testing, versioned release notes, and its platform-specific signing/notarization.

## Data and sync boundaries

The default workflow is local and offline. Each device has its own SQLite database; installing the app on two devices does not automatically merge their data.

LAN sync is opt-in and intentionally limited:

- It is restricted to private/local network addresses and port `9377` (discovery uses `9378`).
- Pairing uses a six-digit, one-time bearer token that expires after 10 minutes.
- Transfers are limited to 64 MiB and validated before atomic replacement.
- The current transport is HTTP cleartext on the trusted LAN, not end-to-end encryption.
- Do not expose the sync port to the public Internet, use it on an untrusted network, or treat it as a cloud backup.

Read the [Android production-readiness guide](10_ANDROID_PRODUCTION_READINESS.md) for the complete security, signing, and release limitations.

## Quick start for contributors

### Prerequisites

- Node.js 18 or newer
- Rust via [rustup](https://rustup.rs/)
- Platform dependencies for [Tauri v2](https://v2.tauri.app/start/prerequisites/)
- Android Studio and Android SDK only for Android development

### Run the app

```bash
npm install

# Desktop development
npm run tauri dev

# Android development
npm run tauri android dev
```

### Build locally

```bash
# Frontend type-check and production bundle
npm run build

# Native desktop bundle
npm run tauri build

# Android APK
npm run tauri android build -- --target aarch64 --apk
```

If your machine cannot install Android or native desktop dependencies, use the GitHub Actions workflows instead. They build from a clean hosted runner and upload the resulting artifacts.

## Technology

- [Tauri v2](https://v2.tauri.app/) with Rust
- React, TypeScript, Vite, and Tailwind CSS
- SQLite through `tauri-plugin-sql`
- Local-network sync implemented in Rust

## Project documentation

- [Android production-readiness and release guide](10_ANDROID_PRODUCTION_READINESS.md)
- [Market and product research](11_MARKET_AND_PRODUCT_RESEARCH.md)
- [Project brief](00_PROJECT_BRIEF.md)
- [Data schema](01_DATA_SCHEMA.md)
- [Tech stack and setup](02_TECH_STACK_AND_SETUP.md)
- [Open product decisions](08_OPEN_DECISIONS_FOR_YOU.md)

The generated Android project under `src-tauri/gen/android` is committed because CI builds directly from it. Regenerate it only when changing Android configuration, then review the generated diff.

## Roadmap to a stable public release

- Test the desktop installers on supported Windows, macOS, and Linux environments.
- Add macOS signing/notarization and Windows/Linux distribution checks.
- Test Android installation, upgrades, lifecycle behavior, and LAN sync on real devices.
- Move LAN sync to encrypted transport before recommending it on networks that are not fully trusted.
- Publish versioned release artifacts, changelogs, privacy information, and backup guidance.
- Evaluate iOS support after the desktop and Android release paths are stable.

## Contributing

Issues and focused pull requests are welcome. Please include the platform, app version or commit, reproduction steps, and relevant logs. Avoid attaching database files or other private data.
