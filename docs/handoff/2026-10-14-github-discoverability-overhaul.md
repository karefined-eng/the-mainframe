# GitHub Discoverability & Community Health Overhaul Handoff — 2026-10-14

## 1. Summary of Changes

This sprint completed the full GitHub discoverability, repository branding, and community health suite for **The Mainframe** (`karefined-eng/the-mainframe`):

1. **Repository Metadata & Search Signals:**
   - **Repository Description Configured:** *"Local-first life management app. Track courses, goals, ideas, ventures and purchases - offline SQLite, no account, no cloud. Tauri v2 + Rust + React, desktop and Android."*
   - **15 Curated GitHub Topics Added:** `local-first`, `offline`, `privacy`, `productivity`, `react`, `rust`, `sqlite`, `tauri`, `life-management`, `personal-dashboard`, `typescript`, `android`, `cross-platform`, `self-hosted`, `open-source`.
   - **Repository Issue Labels Automated:** Applied `scripts/setup-labels.ps1` to configure 14 color-coded labels (`bug`, `enhancement`, `good first issue`, `help wanted`, `triage`, `platform: windows`, `platform: macos`, `platform: linux`, `platform: android`, `sync`, `ui/ux`, `docs`, `performance`, `security`).

2. **Community Health & Open Source Governance:**
   - `CONTRIBUTING.md`: Dev environment setup, project structure, offline/local-first design principles, and PR workflow.
   - `.github/ISSUE_TEMPLATE/bug_report.yml`: Structured form for reporting bugs across Desktop and Android.
   - `.github/ISSUE_TEMPLATE/feature_request.yml`: Structured feature request form enforcing local-first and privacy compliance.
   - `.github/ISSUE_TEMPLATE/config.yml`: Disables blank issues, routes security issues to private advisories.
   - `.github/SECURITY.md`: Activates GitHub security advisory reporting and policy badges.
   - `.github/FUNDING.yml`: Provides GitHub Sponsors foundation for creator support.

3. **Visual Assets & Social Preview:**
   - Generated high-resolution 16:9 social preview card saved to `public/landing/social-preview.jpg`.
   - README enhanced with CI status badges, system architecture Mermaid diagram, and clear project taxonomy.

4. **Environment Trap Logged:**
   - Fixed Windows PowerShell 5.1 UTF-8 without BOM em-dash (`—` / `0x94`) tokenization bug in `scripts/set-repo-metadata.ps1`.
   - Documented the quirk and workaround in `docs/AGENTS.md`.

## 2. Verification

- All 15 GitHub topics and description verified via `gh repo view`.
- Issue labels verified via `gh label list`.
- Repo metadata script execution verified.
