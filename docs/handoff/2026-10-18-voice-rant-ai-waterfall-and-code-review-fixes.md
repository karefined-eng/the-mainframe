# Voice Rant AI Waterfall Engine, Export System & Code Review Hardening

**Date:** 2026-10-18  
**Scope:** Voice Rant decomposition engine, multi-provider AI audio transcription, card exports, and code review fixes.

---

## 1. What Changed

### A. Voice Capture & Quick Rant Decomposer
- **`src/components/VoiceCaptureModal.tsx`:**
  - Upgraded voice capture from ephemeral Web Speech API to native `MediaRecorder` with real-time seconds timer and audio chunk streaming.
  - Connected audio transcription waterfall (`transcribeAudio`) with live visual progress state.
  - Integrated AI multi-domain decomposition (`parseRantWithAI`) with live active provider badges (`Gemini`, `OpenRouter`, `NVIDIA`, or `Local mode`).
  - Fixed a critical SQLite column mismatch: `action_trigger` is now conditionally inserted only into domains whose schema includes that column (`goals`, `build_ideas`, `ventures`). For all other domains (`certifications`, `acquisitions`, `writing`, `skills`, `experiences`, `journal`), the verbatim trigger is safely preserved by appending it to `notes` (`Trigger: <when/where/how>`), preventing SQLite `no such column: action_trigger` runtime exceptions while keeping user implementation intentions intact.
  - Implemented one-click **"Seed origin.md"** export button for software build ideas directly from the parsed cards drawer.

### B. Multi-Provider AI Engine Waterfall
- **`src/engine/aiProvider.ts`:**
  - Designed local-first fallback waterfall for audio transcription: Gemini $\rightarrow$ OpenRouter $\rightarrow$ Groq Whisper $\rightarrow$ manual input prompt.
  - Designed fallback waterfall for transcript decomposition: Gemini $\rightarrow$ OpenRouter $\rightarrow$ NVIDIA NIM $\rightarrow$ local regex parser (`rantParser.ts`).
  - Made JSON array parsing robust using `raw.match(/\[[\s\S]*\]/)`, ensuring responses with conversational preamble or trailing commentary don't fail parsing.
  - Replaced unreleased model IDs (`gemini-2.5-flash`) with verified production IDs (`gemini-2.0-flash`, `gemini-1.5-flash`), eliminating guaranteed initial 404 HTTP round-trip delays.
  - Updated `OPENROUTER_MODELS` to valid IDs (`google/gemini-2.0-flash-001`, `google/gemini-flash-1.5`).
  - Extracted audio format dynamically from `audioBlob.type` for OpenRouter and Groq Whisper endpoints.
  - API keys are queried fresh from local SQLite `app_settings` on each request, ensuring zero stale state and zero in-memory key leakage.

### C. Settings & Security Policies
- **`src/components/Settings.tsx`:**
  - Added AI Voice Parser configuration section supporting API keys for `gemini_api_key`, `openrouter_api_key`, `nvidia_api_key`, and `groq_api_key`.
  - Added password masking with show/hide toggle buttons and provider status badges.
  - Added keys to `validSettingKeys` to allow secure database persistence into `app_settings`.
- **`src-tauri/tauri.conf.json`:**
  - Updated CSP `connect-src` whitelist to allow outbound HTTPS requests to:
    - `https://generativelanguage.googleapis.com`
    - `https://openrouter.ai`
    - `https://api.groq.com`
    - `https://integrate.api.nvidia.com`

### D. Calendar & Domain Polish
- **`src/components/CalendarView.tsx`:**
  - Registered `journal: "#64748b"` in `domainColors`, adhering to defensive UI mapping.

---

## 2. What Broke

- **No regressions or broken functionality.**
  - All 11 unit tests in `tests/*.test.ts` pass (`node --experimental-strip-types --test tests/*.test.ts`).
  - TypeScript compilation passes cleanly (`npx tsc --noEmit` $\rightarrow$ 0 errors).
  - Rust backend passes compilation checks (`cargo check --manifest-path src-tauri/Cargo.toml` $\rightarrow$ exit code 0).

---

## 3. What Is Blocked

- **No blockers.**
  - Cloud AI features are completely optional: if no keys are configured in Settings, the app operates 100% offline and locally via the deterministic regex decomposer in `rantParser.ts`.
  - Commits are intentionally unstaged and uncommitted per Part II git rules ("Never commit or push unless I ask").

---

## 4. Next Agent's First 3 Actions

1. **Verify UI in Dev Server:**
   Launch the application (`npm run tauri dev` or `the-mainframe.bat`) and click **"Rant / Speak"** in the top navigation bar to test the Voice Capture modal and domain card approval flow.
2. **Execute Git Commit Upon User Request:**
   When requested by the user, stage modified files and commit with the mandatory inline identity:
   ```powershell
   $env:GIT_AUTHOR_NAME='karefined-eng'; $env:GIT_AUTHOR_EMAIL='ka.refined@gmail.com'
   $env:GIT_COMMITTER_NAME='karefined-eng'; $env:GIT_COMMITTER_EMAIL='ka.refined@gmail.com'
   git add src/components/VoiceCaptureModal.tsx src/components/Settings.tsx src/components/CalendarView.tsx src-tauri/tauri.conf.json src/engine/aiProvider.ts
   git commit -m "feat(ai): add multi-provider voice capture waterfall and fix domain trigger persistence"
   git log -1 --format='%h | A=%an <%ae> | C=%cn <%ce>'
   ```
3. **Audit Android MediaRecorder Permissions:**
   Inspect Android audio recording permissions in `src-tauri/gen/android` if targeting mobile APK builds to ensure the `RECORD_AUDIO` manifest permission is granted when running on physical devices.
