# Handoff: blank screen to public launch (2026-10-05)

Session span: one day, from "the desktop app is showing a blank screen" to a
public production site. Written for the next agent so none of this has to be
re-derived.

## Starting state

- Desktop app blank; two fixes for blank-screen bugs had already shipped that
  morning (CSP origins at 13:15, fonts/CSP at 94e3586), an app identifier had
  been renamed (`com.kwadw` → `com.karefined`), and installers built at 12:26
  predated both. A `tauri dev` session was running with Vite live, plus a
  DuckDuckGo tab pointed at localhost:1420.

## Root causes found (three, stacked)

1. **Dev blank: circular-import TDZ.** `BackupExport.tsx` read the `domains`
   const at module-evaluation time while importing it from `App.tsx`. The whole
   module graph died with `ReferenceError: Cannot access 'domains' before
   initialization` — React never mounted, and no error boundary can catch a
   module-eval failure. Fix: resolve the valid-domain set lazily.
   Introduced by `6953ed0` ("harden app security") — the same commit that
   caused cause 2.
2. **Production empty: CSP vs Windows IPC.** The CSP allowed the `ipc:` scheme,
   but on Windows the SQL plugin fetches `http://ipc.localhost` — not matched
   by `ipc:` — so every database call was blocked and the installed app
   rendered an empty shell. Dev has no CSP injected, which is why dev and prod
   failed differently. Fix: add `http://ipc.localhost` to `connect-src`.
3. **The "dead dev server" blank.** `the-mainframe.bat` started
   `npm run tauri dev` detached; when Vite died, the webview was left pointing
   at a dead port with no error anywhere. Fix: run in a visible console with a
   `pause` on exit.

## Hardening added

- `App.tsx` surfaces startup DB failures in a visible error panel instead of
  `console.error` (a DB failure must never look like an empty shell).
- `ws://localhost:1420` allowed in the dev CSP so Vite HMR/overlays work inside
  the webview.
- `StartupErrorBoundary` (pre-existing) covers render errors; module-eval
  failures still cannot be caught — keep the import graph clean.

## Verification technique worth keeping

Drive the real WebView2 over CDP: launch with
`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`, then use
the `/json/list` endpoint and a minimal WebSocket client hand-rolled over
`node:http` + `node:crypto` (the ZCode `node_repl` kernel has no
`fetch`/`WebSocket` globals). This reads the actual console, DOM, and
screenshots of the packaged app — it found both the TDZ and the CSP break.

## Data finding (settled — do not re-investigate)

The identifier rename split app-data dirs. Both databases were inspected
directly (`node:sqlite`): **both are schema-only, zero rows**. No user data
ever existed; nothing was lost. `AppData\Roaming\com.kwadw.the-mainframe` and
`mainframe.db.pre-migration.bak` are safe to delete.

## Launch pipeline (Vercel)

- Project `the-mainframe` (scope `koasamoah010-4848s-projects`), linked via
  `.vercel/`. Production domain: **https://the-mainframe-app.vercel.app**
  (`themainframe` and `the-mainframe` vercel.app subdomains are taken by
  others; `-theta` was the auto-assigned name). The alias follows production
  automatically.
- `vercel.json` pins Vite build/output + SPA rewrite + immutable asset caching.
- `.vercelignore` is mandatory: the CLI ignores only the root `.gitignore`, so
  without it a deploy tries to upload ~7.4 GB of `src-tauri/target` and aborts.
- Routing: outside Tauri, every path renders the landing (see
  `src/landing/route.ts`); inside Tauri the app opens the dashboard. Verified
  in a plain browser and via CDP.
- Vercel Web Analytics mounted on the landing route only (first-party,
  cookie-free); the "Nothing is uploaded" guarantee was reworded to match.
- Deployment Protection (Vercel Authentication) initially blocked all public
  access — it must stay off for a public marketing site.

## Landing copy state (deliberate)

The V2 prototype copy was ported (`da00129`), then reverted by a parallel
session (`3a789be`, "restore honest copy over fabricated hero panel") which
also produced `prototypes/V3`. The live site intentionally carries the honest
copy; `route.ts`, `content.ts`, and the file headers document the claim
discipline. Any copy change must keep every factual claim mirrored to a
verified source listed in `content.ts`'s header.

## Repository state at handoff

- Branch `public-landing-page` (tip: analytics commit) holds the landing,
  logo, deploy config; `main` holds product code + blank-screen fixes only —
  the landing is **not merged to main yet**.
- Vercel is CLI-deployed, not Git-connected; push-to-deploy requires merging
  to main and connecting the repo in the dashboard.
- Branches pending cleanup: `backup/pre-rewrite-main-3a63bf1`,
  `backup/public-landing-page`, `karefined-eng-security-audit`
  (`karefined-eng-android-release-pipeline` is active in a Copilot worktree —
  do not touch).
- Open: disable Vercel Deployment Protection (owner action), custom domain,
  landing-only bundle to shrink the deployed JS.
