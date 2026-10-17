# Voice Rant Ingestion, Privacy-First AI Sorting, Project origin.md Seeding & Seamless Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a frictionless, mobile-first one-tap mic capture workflow that transcribes unstructured spoken rants, automatically decomposes and categorizes them across The Mainframe's 9 domains using privacy-first AI, enables seamless Markdown (`origin.md` / `.md`) and `.txt` exports directly from cards, and reinforces rock-solid mobile-desktop sync as database entries scale.

**Architecture:** 
- Schema migration (Migration 8) adding `journal` domain and updating domain definitions:
  - `experiences`: clarified as Bucket List & Real-World Adventures.
  - `writing`: clarified as Essays, Articles & Formal Research.
  - `journal`: dedicated to Personal Logs, Reflections, and unfiltered day notes.
- Frontend voice recording layer with ephemeral audio handling (transcribe and immediately discard audio payload).
- Multi-domain decomposition engine supporting local Ollama loopback (`127.0.0.1:11434`), Web Speech API, or private user-configured endpoint.
- Export engine allowing one-click export of any card or item into `origin.md`, `.md`, or `.txt` directly from list view and drafting mode without PDF bloat.
- Permanent preservation of all founder voice memo transcripts in `docs/transcripts/`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Tauri v2 (Rust + SQLite WAL).

**Spec:** [docs/origin.md](file:///c:/Users/asamoah/the-mainframe/docs/origin.md#L17-L44) and [docs/transcripts/2026-10-17-founder-voice-memos.md](file:///c:/Users/asamoah/the-mainframe/docs/transcripts/2026-10-17-founder-voice-memos.md)

---

## Global Constraints

- **Design System Immortality:** Do not alter color tokens, font families, or CSS variables defined in `src/index.css`.
- **Neuro-UX Minimums:** Never use shame mechanics or red overdue badges. Preserve implementation intentions (`action_trigger`) verbatim without truncation.
- **SQLite Deduplication:** All inserts must use `INSERT OR IGNORE` with unique constraints.
- **Ponytail Minimalist Aesthetic:** No emojis (no 🎙️, 🧠, 💾). Exclusively use `lucide-react` SVG icons (`Mic`, `Radio`, `FileCode`, `Check`, `Trash2`, `BookOpen`, `Download`, `Compass`, `Feather`).
- **Data Sovereignty:** Discard audio data from memory immediately after transcription. No unconsented external exfiltration.
- **No Heavy PDF Bloat:** Pure, lightweight plain text and Markdown exports (`.md`, `.txt`).

## Review Focus

- Empty or single-word rant submissions (must handle cleanly without crashing or spawning empty cards).
- Network or local inference timeout (must fall back to raw plaintext note saved in Drafts or raw import).
- Long multi-idea rants spanning 4+ domains (must parse each independently without drop-off).
- Card export with empty or null notes/drafts (must format clean header and placeholder without failing).
- Migration 8 idempotence on app reload across desktop and mobile.

---

### Task 1: Add `journal` Domain & Refine `experiences` / `writing` Definitions

**Files:**
- Modify: `src-tauri/src/lib.rs` (Add Migration 8 for `journal` table)
- Modify: `src/App.tsx` (Add `journal` to domains array, DomainKey, domain counts, BookOpen icon)
- Modify: `src/components/ItemForm.tsx` (Add `journal` field definitions)
- Modify: `src/components/PasteIngest.tsx` (Add `journal` to `validDomains`)
- Modify: `src/components/DomainView.tsx` (Add updated banner copy for Bucket List, Essays & Research, and Journal)

**Interfaces:**
- DomainKey: `"certifications" | "build_ideas" | "acquisitions" | "goals" | "ventures" | "writing" | "skills" | "experiences" | "journal"`
- Produces: SQLite table `journal` with `title UNIQUE`, `notes`, `status`, `target_date`, `target_time`, `raw_import_text`, `created_at`, `updated_at`.

- [x] **Step 1: Add Migration 8 to `src-tauri/src/lib.rs`**
  Define `CREATE TABLE IF NOT EXISTS journal (...)`.

- [x] **Step 2: Update frontend domain mappings in `src/App.tsx`, `ItemForm.tsx`, `PasteIngest.tsx`, and `DomainView.tsx`**
  Update label and tooltip definitions for `experiences` ("Bucket List"), `writing` ("Essays & Research"), and `journal` ("Journal & Reflections").

- [x] **Step 3: Verify Rust and frontend build**
  Run: `cargo check --manifest-path src-tauri/Cargo.toml` and `npm run build`
  Expected: Clean compilation.

- [x] **Step 4: Commit**
  ```bash
  $env:GIT_AUTHOR_NAME='karefined-eng'; $env:GIT_AUTHOR_EMAIL='ka.refined@gmail.com'
  $env:GIT_COMMITTER_NAME='karefined-eng'; $env:GIT_COMMITTER_EMAIL='ka.refined@gmail.com'
  git add src-tauri/src/lib.rs src/App.tsx src/components/ItemForm.tsx src/components/PasteIngest.tsx src/components/DomainView.tsx
  git commit -m "feat(domain): add journal domain and clarify experiences and writing"
  ```

---

### Task 2: Seamless Card & Project `origin.md` / Markdown / Text Export

**Files:**
- Create: `src/engine/exportEngine.ts`
- Create: `tests/exportEngine.test.ts`
- Modify: `src/components/ItemRow.tsx` (Add quick export action dropdown or button)
- Modify: `src/components/FocusDraftingMode.tsx` (Add `.md` and `origin.md` export options)

**Interfaces:**
- Produces: 
  - `exportCardAsOriginMd(item: BaseItem, cards?: Card[]): string`
  - `exportCardAsMarkdown(item: BaseItem, cards?: Card[]): string`
  - `exportCardAsText(item: BaseItem, cards?: Card[]): string`
  - `downloadFile(filename: string, content: string, mimeType: string): void`

- [x] **Step 1: Write the failing unit tests for `exportEngine.ts`**
  Verify proper formatting of `origin.md`, standard Markdown, and plain text without dependencies.

- [x] **Step 2: Run test to verify it fails**
  Run: `node --experimental-strip-types --test tests/exportEngine.test.ts`
  Expected: FAIL

- [x] **Step 3: Implement `src/engine/exportEngine.ts`**
  Provide helper functions to generate clean Markdown, origin seeds, and download triggers.

- [x] **Step 4: Integrate export actions into `ItemRow.tsx` and `FocusDraftingMode.tsx`**
  Add download button allowing one-click export as `.md`, `.txt`, or `origin.md`.

- [x] **Step 5: Run tests and verify build**
  Run: `node --experimental-strip-types --test tests/exportEngine.test.ts` and `npm run build`
  Expected: PASS

- [x] **Step 6: Commit**
  ```bash
  $env:GIT_AUTHOR_NAME='karefined-eng'; $env:GIT_AUTHOR_EMAIL='ka.refined@gmail.com'
  $env:GIT_COMMITTER_NAME='karefined-eng'; $env:GIT_COMMITTER_EMAIL='ka.refined@gmail.com'
  git add src/engine/exportEngine.ts tests/exportEngine.test.ts src/components/ItemRow.tsx src/components/FocusDraftingMode.tsx
  git commit -m "feat(export): add seamless origin.md and markdown card exports"
  ```

---

### Task 3: Multi-Domain Rant Parsing & Decomposition Engine

**Files:**
- Create: `src/engine/rantParser.ts`
- Create: `tests/rantParser.test.ts`

**Interfaces:**
- Produces: `parseRantTranscript(transcript: string, options?: ParseOptions): ParsedRantResult`
- Handles all 9 domains: `certifications`, `build_ideas`, `acquisitions`, `goals`, `ventures`, `writing`, `skills`, `experiences`, `journal`.

- [x] **Step 1: Write failing unit tests for parsing multi-idea transcripts**
  Test decomposition of a mixed transcript containing a venture idea, a fitness goal, a skydiving bucket list entry, a journal reflection, and an app build idea into distinct items.

- [x] **Step 2: Run test to verify it fails**
  Run: `node --experimental-strip-types --test tests/rantParser.test.ts`
  Expected: FAIL

- [x] **Step 3: Implement `src/engine/rantParser.ts`**
  Implement intent extraction, tag generation, and `is_software_build` classification.

- [x] **Step 4: Run test to verify it passes**
  Run: `node --experimental-strip-types --test tests/rantParser.test.ts`
  Expected: PASS

- [x] **Step 5: Commit**
  ```bash
  $env:GIT_AUTHOR_NAME='karefined-eng'; $env:GIT_AUTHOR_EMAIL='ka.refined@gmail.com'
  $env:GIT_COMMITTER_NAME='karefined-eng'; $env:GIT_COMMITTER_EMAIL='ka.refined@gmail.com'
  git add src/engine/rantParser.ts tests/rantParser.test.ts
  git commit -m "feat(ai): add multi-domain rant decomposition parser"
  ```

---

### Task 4: Ephemeral Voice Capture Component (`VoiceCaptureModal.tsx`)

**Files:**
- Create: `src/components/VoiceCaptureModal.tsx`
- Modify: `src/App.tsx` (Add pinned header mic button & modal trigger)

**Interfaces:**
- Consumes: `parseRantTranscript`, `exportEngine`, `getDb`
- Produces: Visual modal with recording waveform, live transcription preview, domain card review list, one-click `[Seed origin.md]` export, and one-click database commit.

- [x] **Step 1: Implement Web Speech / MediaRecorder ephemeral capture hook**
  Ensure microphone streams are stopped and audio buffers cleared upon completion.

- [x] **Step 2: Build the Review & Triage Drawer UI**
  Follow Neuro-UX guidelines: display extracted items in flat cards with domain badges, editable titles, and individual `[Add]` / `[Discard]` actions.

- [x] **Step 3: Add `origin.md` download action directly on detected build ideas**
  Render `[Export origin.md]` button on software items.

- [x] **Step 4: Verify in dev build and run full test suite**
  Run: `npm run build` and `node --experimental-strip-types --test tests/*.test.ts`
  Expected: Clean build and all tests pass.

- [x] **Step 5: Commit**
  ```bash
  $env:GIT_AUTHOR_NAME='karefined-eng'; $env:GIT_AUTHOR_EMAIL='ka.refined@gmail.com'
  $env:GIT_COMMITTER_NAME='karefined-eng'; $env:GIT_COMMITTER_EMAIL='ka.refined@gmail.com'
  git add src/components/VoiceCaptureModal.tsx src/App.tsx
  git commit -m "feat(ui): add voice rant capture modal with origin.md seed export"
  ```
