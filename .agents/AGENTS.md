<RULE[user_global]>
---
name: Frictionless Launchers
description: >
  Automatically generate a .bat launcher script for uncompiled local projects to improve developer UX and reduce terminal friction on Windows.
---
# Frictionless Launchers
When scaffolding a new local project on Windows that relies on a development server (e.g., Vite, Tauri, React, Node) and is not immediately bundled into a standalone executable, you MUST automatically generate a `.bat` launcher script in the project root.

The script should use the following robust pattern:
```bat
@echo off
cd /d "%~dp0"
start "" <your-start-command>
```
Name the file `<project-name>.bat` (e.g., `the-mainframe.bat`). This ensures the user can double-click the file (or a desktop shortcut) to launch the project with zero terminal friction.
</RULE[user_global]>

<RULE>
---
name: Mainframe Neuro-UX Guidelines
description: >
  Strict UI/UX design constraints for The Mainframe based on cognitive load theory and ADHD-friendly psychology. Must be applied to all frontend React/Tailwind components.
---
# Mainframe Neuro-UX Guidelines
When implementing UI components, dashboards, or notification views for The Mainframe, you MUST adhere to the following neurological UX constraints:

1. **Strict Chunking (Working Memory):** Never display massive walls of raw tasks. In the "What's Hot" or urgent views, limit the top high-priority items to 3-5 distinct chunks.
2. **No Shame Mechanics:** Never use punitive design (e.g., flashing red text, broken streaks, aggressive alerts) for overdue items. Present delays neutrally ("blunt re-entry") to avoid triggering avoidance loops or dopamine deficits.
3. **Immediate Additive Feedback:** The exact millisecond a task is completed, provide immediate, satisfying visual feedback (e.g., a smooth strikethrough, a clean animation, or color transition).
4. **Avoid Hick's Law Fatigue:** Do NOT build complex tag clouds, multi-sort dropdowns, or excessive domain filters. Rely on algorithmic curation (urgency scores) over manual user filtering.
5. **Zeigarnik Cues:** Prominently surface items marked `in_progress` to create a psychological open loop, encouraging the user to finish them.
6. **Implementation Intentions:** If an item has an `action_trigger` (the user's "when/where/how" plan), it MUST be displayed verbatim. Do not replace it with generic text.
</RULE>

<RULE>
---
name: Mainframe SQLite Deduplication
description: >
  Enforces strict deduplication at the database schema level using SQLite constraints to prevent duplicate entries from multiple imports or manual entry.
---
# Mainframe SQLite Deduplication
When generating SQLite schemas, writing import scripts, or performing migrations for The Mainframe, you MUST include native database constraints to prevent duplicate row creation. Do not rely solely on frontend or application logic.

1. **Unique Constraints**: Apply a `UNIQUE(title)` constraint to all primary domain tables (`courses`, `acquisitions`, `goals`, `build_ideas`, `ventures`).
2. **Conflict Resolution**: When performing inserts (e.g., during bulk imports or pasting text), always use `INSERT OR IGNORE` to silently skip existing entries without throwing an error, or `INSERT OR REPLACE` if the user is explicitly updating an item.
</RULE>

<RULE>
---
name: Defensive UI Mapping
description: >
  Enforces safe fallbacks when using dictionary lookups for UI styling based on dynamic or extensible domains.
---
# Defensive UI Mapping
When mapping dynamic keys (like database domains, categories, or enums) to UI properties (like colors, icons, or classes) in React components, you MUST ALWAYS provide a safe fallback value. 
Never assume the dictionary contains all possible keys.
Example: `backgroundColor: domainColors[key] || "#94a3b8"`
</RULE>

<RULE>
---
name: Windows ACL Terminal Error Fallback
description: >
  Guides the agent on how to handle the "opening NUL for ACL write: Access is denied" error on Windows.
---
# Windows ACL Terminal Error Fallback
If you encounter the error `opening NUL for ACL write: Access is denied.` when trying to execute a command via the `run_command` tool on Windows, DO NOT attempt to retry the command with `cmd.exe /c` or other wrappers. 
Acknowledge the environment limitation and immediately provide the exact command to the user so they can run it manually in their own terminal.
</RULE>

<RULE>
---
name: Database Migration and Reset Safety
description: >
  Prevents accidental data loss when troubleshooting database or migration errors by enforcing mandatory backup steps, user warnings, and schema alignment checks.
---
7. **Database Migration and Reset Safety**
When troubleshooting database schema or migration errors (such as Tauri SQL plugin checksum mismatches):

1. **Mandatory Backup First**: NEVER instruct or execute deletion of a database file (`.db`, `.sqlite`) without first creating a copy (e.g., `mainframe_backup.db`).
2. **Explicit User Warning**: Always explicitly inform the user that clearing a database file will reset local data/stats before providing deletion commands.
3. **Import Script Schema Sync**: Before recommending or executing database import scripts, verify that table names and column definitions in the script match the current application migrations (e.g., `certifications` vs legacy `courses`).
4. **Frontend Schema Sync**: Whenever database tables (such as domains) are renamed or added in migrations, you MUST also update the corresponding frontend configuration files (e.g., `domains` array, `DomainKey` types, and `domainFields` mapping in `App.tsx` and related components) to match the new table names exactly. Failing to do this causes unhandled SQL exceptions at runtime.
</RULE>

<RULE>
---
name: UI/UX Intent over Static Mockups
description: >
  Prioritizes the user's verbal/textual workflow constraints over literal static HTML mockups, and enforces a strict minimalist aesthetic (no emojis, use lucide-react).
---
# UI/UX Intent over Static Mockups
When the user provides static prototypes (e.g., HTML mockups) alongside audio transcripts or textual explanations:
1. **Transcript as Source of Truth:** Treat the static mockup as a structural or visual baseline only. The ultimate source of truth for the interaction model, dynamic state (e.g., "side-by-side editing", "draggable cards"), and workflow is the user's transcript. Do not blindly copy the static code if the verbal intent demands a more complex, interactive state.
2. **Strict Minimalist Aesthetic:** Adhere to the "Ponytail" minimalist philosophy. **NEVER use emojis in the UI** (e.g., no ✏️, 📋, 💾). Exclusively use `lucide-react` SVG icons for all UI elements requiring iconography. Maintain a clean, native-feeling aesthetic without bloat.
</RULE>

<RULE>
---
name: Design System Immortality
description: >
  Prevents agents from altering the design tokens, fonts, or colors of The Mainframe without explicit permission.
---
# Design System Immortality
NEVER modify the CSS variables, color tokens, or font families defined in `src/index.css` or `05_AGENT_KICKOFF_PROMPT.md` unless the user EXPLICITLY asks you to "change the theme" or "update the design tokens". 
Do not "modernize" or "make it premium" by changing these base colors or fonts (e.g. do not switch from Inter to Satoshi, or from Blue to Amber) just because it looks subjectively better.
</RULE>

<RULE>
---
name: Tauri Android Network Binding
description: >
  Prevents WebView connection failures (chrome-error://chromewebdata/) during Tauri Android development by enforcing global host binding in Vite.
---
# Tauri Android Network Binding
When configuring or troubleshooting a Tauri v2 project for Android development on Windows, you MUST ensure that the underlying frontend dev server (e.g., Vite) is bound to all network interfaces. 
In `vite.config.ts`, you must set `server.host: true` instead of `host: process.env.TAURI_DEV_HOST || false`. 
This is strictly required to allow physical Android devices and emulators to reliably connect to the dev server over the local network or ADB reverse proxy.
</RULE>

<RULE>
---
name: Tauri-First Architecture
description: >
  Prioritizes Tauri (Rust + React/web frontend) for all new desktop and mobile application development to ensure superior performance, low overhead, and a single cross-platform codebase.
---
# Tauri-First Architecture
When scaffolding new applications or proposing architecture for re-engineering existing projects (like Eleviewer), you MUST default to a single-codebase, multi-platform approach using **Tauri v2**. 
- Leverage Rust for the backend/system-level operations to guarantee low resource consumption.
- Ensure the architecture natively targets both Desktop (Windows/macOS/Linux) and Mobile (Android/iOS) from day one.
</RULE>

<RULE>
---
name: Non-Destructive Bidirectional Sync
description: >
  Strict constraints on how data synchronization should be implemented across devices, forbidding automated local data erasure.
---
# Non-Destructive Bidirectional Sync
When implementing device-to-device data synchronization (e.g., between PC and Mobile):
1. **Never auto-erase**: Never implement destructive syncs that automatically overwrite or erase local data upon connection without explicit consent.
2. **Explicit Directional Control**: Always provide the user with explicit UI options to choose the sync direction (e.g., `PC -> Mobile`, `Mobile -> PC`, or `Merge`) similar to professional audio mixing consoles.
3. **Transport Agnostic**: Support multiple localized transfer protocols where possible (Wired/USB via ADB reverse, Local Wi-Fi, QR code, Bluetooth) to prevent ecosystem lock-in and ensure offline capability.
</RULE>

<RULE>
---
name: Always Learn From Failures
description: >
  Mandates immediate root-cause investigation, permanent friction logging, and rule persistence whenever any build, CI pipeline, or execution fails.
---
# Always Learn From Failures
Whenever any build, CI/CD pipeline (e.g., GitHub Actions), database migration, tool call, or test fails:
1. **Never Blindly Retry:** Do not make speculative or trial-and-error edits without examining the full failure log. Inspect the exact stack trace, compiler error, or network payload.
2. **Identify the Invariant:** Trace the failure to its foundational cause (e.g., platform scope mismatch, environment buffer EOF, local firewall drop).
3. **Persist the Learning Immediately:** Document the trap, the reason it occurred, and the verified workaround in `AGENTS.md` and `docs/AGENTS.md` before concluding the session. Never leave the campsite without making future agents immune to the same failure.
</RULE>

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
1. **Key Length Invariant (Private vs Public):** The Minisign public key is exactly 152 characters Base64, while the private key is 348 characters Base64. If the 152-character public key (`.pub`) is accidentally pasted into `TAURI_SIGNING_PRIVATE_KEY` instead of the 348-character secret key (`.key`), Minisign underflows its secret key read buffer and crashes with `failed to decode secret key: incorrect updater private key password: failed to fill whole buffer`. Always verify that `TAURI_SIGNING_PRIVATE_KEY` is the full 348-character private key.
2. **Non-Interactive CI Password Handling:** For passwordless keys generated with `tauri signer generate --ci`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""` MUST be explicitly supplied in the environment. If omitted, the CLI attempts to read a password interactively from standard input, encounters closed EOF on CI runners, and aborts with `failed to fill whole buffer`.
3. **Whitespace & Newline Sanitization:** Trailing newlines or CRLF characters in GitHub Actions secrets cause Tauri's Minisign Base64 decoder to fail with `failed to decode base64 key: Invalid symbol 10, offset <len>` (ASCII 10 is `\n`). Always strip newlines and spaces before invocation in CI: `CLEAN_KEY=$(printf "%s" "${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}" | tr -d '\r\n[:space:]')`.
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

<RULE>
---
name: Research Library Authority
description: >
  Mandates that all architectural, UI/UX, and marketing copy decisions in The Mainframe strictly consult and adhere to the research library in docs/research/.
---
# Research Library Authority
Before proposing or implementing major UI changes, notification features, or marketing copy:
1. Ground yourself in `docs/origin.md` to honor the founder's emotional intent.
2. Consult `docs/research/01_NEURO_UX_AND_COGNITIVE_PSYCHOLOGY.md` for cognitive load and working memory bounds (3–5 items).
3. Consult `docs/research/02_COMPETITIVE_MOAT_AND_POSITIONING.md` to preserve the 4-pillar defensible moat.
4. Consult `docs/research/03_SEARCH_INTENT_AND_ORGANIC_GROWTH.md` and `docs/research/search-intent-copywriting-framework.md` for search query alignment and conversion hooks.
</RULE>

