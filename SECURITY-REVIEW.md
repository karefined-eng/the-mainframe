# Security Review

**Repository:** `karefined-eng/the-mainframe`  
**Review status:** 2026-10-05

## Summary

The application security review covered injection risks, authentication bypasses,
secrets in the repository, LAN synchronization, and vulnerable dependencies.
No high-confidence critical or high-severity application vulnerability remains
in the reviewed code. The SQLx Dependabot alert has been fixed. One moderate
Linux-only dependency alert remains because resolving it requires a compatible
Tauri/GTK dependency-chain upgrade rather than a forced lockfile override.

## Findings and disposition

| Severity | Area | Finding | Disposition |
|---|---|---|---|
| Moderate | Rust dependencies | `sqlx 0.8.0` matched GHSA-xmrp-424f-vfpx | Fixed by upgrading `sqlx` to `0.8.1`; `cargo check --locked` passes |
| Moderate | Rust dependencies | `glib 0.18.5` matches GHSA-wrw7-89jp-8q8g through the Linux GTK/WebKit stack | Deferred: the current Tauri/GTK versions require `glib 0.18`; do not force `glib 0.20` without a compatible upstream chain |
| High impact | LAN sync | Database transfer was previously too broadly exposed and insufficiently authenticated | Fixed with one-time Bearer PIN authentication, expiry, token consumption, strict request validation, private-peer filtering, source-verified discovery, and a 64 MiB response cap |
| High impact | Webview policy | Tauri Content Security Policy was disabled | Fixed with a restrictive CSP covering scripts, images, styles, and network connections |
| Medium | Dynamic SQL | User-controlled table/key values were used in dynamic SQL paths | Fixed with domain/key allowlists and explicit column selection |
| Informational | Secrets | No signing keystore, password, or private signing material is committed | Preserved; production signing values remain outside Git and are supplied through GitHub Actions secrets |

## Deferred dependency work

The remaining `glib` alert is inherited through the Linux-only GTK/WebKit
dependency path:

```text
tauri -> wry -> webkit2gtk -> gtk 0.18 -> glib 0.18.5
```

The application’s Windows and Android builds do not use this Linux GTK path.
The safe remediation is to upgrade Tauri/Wry and their Linux GTK dependencies
when a compatible release resolves `glib >= 0.20`. Until then, forcing a newer
`glib` version in `Cargo.lock` could produce an incompatible or unbuildable
dependency graph.

## Operational guidance

- Keep Android sync restricted to trusted local/private networks; the current
  transport is authenticated HTTP LAN transfer, not TLS.
- Keep the Android application ID and signing key stable for future upgrades.
- Recheck Dependabot alerts after each Tauri and Rust dependency update.
- Never commit keystores, passwords, base64 keystore contents, or GitHub secret
  values.
