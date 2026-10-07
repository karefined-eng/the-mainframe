# Pre-Release Verification Report — The Mainframe

**Date:** 2026-10-06 · **Branch:** `main` @ `4ae456b` · **Scope:** Desktop (Windows) + frontend + landing. No release was published; this is verification only.

## Result: ALL CHECKS PASS ✅

| # | Check | Method | Result |
|---|-------|--------|--------|
| 1 | TypeScript type-check + frontend build | `npm run build` (`tsc && vite build`) | ✅ Clean (16.8s; only a >500 kB chunk-size warning) |
| 2 | Rust backend compile | `cargo check` in `src-tauri/` | ✅ Clean (48.7s, no warnings shown) |
| 3 | Desktop dev smoke test | `npm run tauri dev` + CDP inspection on :9222 | ✅ Window rendered, all 8 domains, SQL query returned 7 migrations |
| 4 | **Packaged production build** (the mode where the blank screen previously appeared) | `npm run tauri build` → launched `tauri-app.exe` with CDP on :9223 | ✅ Renders fully (836 chars of UI text, all domains); SQL loads DB and queries all 14 tables through the CSP-restricted IPC |
| 5 | Landing page | Fresh load of `#/welcome` in the Tauri webview | ✅ 148 landing nodes rendered, marketing copy + SEO title correct |

## Key evidence

### Blank-screen fix confirmed in production
The two stacked regressions fixed in `47c919e` were both exercised:
- **Circular import crash** (`BackupExport.tsx` reading `domains` at module-eval time): the packaged app mounted React successfully (`readyState: complete`, root populated, all 8 domains visible).
- **CSP blocking Windows IPC** (missing `http://ipc.localhost`): a real SQL round-trip through the production webview succeeded — `SELECT` against `_sqlx_migrations` returned `7`, and `sqlite_master` listed all expected tables (`certifications`, `build_ideas`, `acquisitions`, `goals`, `ventures`, `writing`, `skills`, `experiences`, `cards`, `item_updates`, `notification_log`, `app_settings`).

### Production build artifacts
- `src-tauri/target/release/bundle/msi/The Mainframe_0.1.0_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/The Mainframe_0.1.0_x64-setup.exe`

## Notes (non-blocking)

1. **Bundle size warning** — the JS bundle is 573 kB (minified). Fine for a Tauri app (local assets), but code-splitting is a future option.
2. **Android not covered by this run** — Android verification happens via the GitHub Actions `Android APK` workflow (all recent runs green, signed release APK produced). A local Android build was not run here.
3. **`#/welcome` inside the app shell** — hash-only navigation from app→landing doesn't re-render by design (route is read on mount; documented behavior, not a bug). Fresh load works.
4. **No GitHub Releases** — APKs/installers exist only as CI artifacts. When you *are* ready to release, add a publish step.

## Verdict
The desktop app on `main` is functionally healthy end-to-end: frontend builds, Rust compiles, dev and **packaged production** both render and persist via SQLite. The blank-screen bug is verifiably fixed in the production build. From this run's scope, the app is in good shape to move toward release readiness — remaining gaps are process-level (Android on-device testing, release publishing), not correctness.
