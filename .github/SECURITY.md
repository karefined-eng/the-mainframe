# Security Policy

## Supported Versions

The Mainframe is in early public release. Security fixes are applied to the latest commit on `main`.

| Version | Supported |
|---|---|
| `main` (latest) | ✅ Yes |
| Older commits | ❌ No |

## Reporting a Vulnerability

**Please do not report security vulnerabilities in public GitHub issues.**

Report security vulnerabilities privately using [GitHub's private security advisory system](https://github.com/karefined-eng/the-mainframe/security/advisories/new). This allows the maintainer to assess and address the issue before any public disclosure.

When reporting, please include:
- A clear description of the vulnerability
- Steps to reproduce or a proof of concept
- The potential impact
- Your suggested fix (if any)

You should receive a response within 7 days. If you do not, follow up via the repository's GitHub Discussions.

## Security Design Summary

The Mainframe is a **local-first** app. Its security model is:

- **No cloud account, no remote database.** The app has no backend server that could be compromised to expose user data.
- **Local SQLite database.** Data is stored on-device using the operating system's file system permissions.
- **LAN sync is opt-in and private-network-only.** The sync server rejects connections from public IP addresses (HTTP 403). Authentication uses a six-digit one-time bearer token that expires after 10 minutes and is consumed on successful use.
- **Content Security Policy.** The Tauri WebView enforces a restrictive CSP covering scripts, styles, images, and network connections.
- **No telemetry.** The app does not send any usage data, crash reports, or analytics to any external service.

## Known Limitations

| Area | Limitation |
|---|---|
| LAN sync transport | HTTP cleartext; suitable for trusted private networks only. TLS is on the roadmap. |
| Desktop installers | Currently unsigned (no code-signing certificate). Browsers and OS may warn on download. |
| `glib 0.18` (Linux) | A moderate advisory (GHSA-wrw7-89jp-8q8g) through the Linux GTK/WebKit dependency chain. Deferred until Tauri/Wry ships a compatible `glib 0.20` upgrade path. Does not affect Windows or Android builds. |

See [SECURITY-REVIEW.md](../SECURITY-REVIEW.md) for the full audit findings and disposition.
