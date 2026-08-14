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
