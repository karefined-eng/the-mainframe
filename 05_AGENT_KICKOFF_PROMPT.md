# The Mainframe — Agent Kickoff Prompt

Copy everything below the line into Antigravity's agent chat to start the build. This assumes all five numbered docs (00–04) are present in the project root directory alongside this file, and that `archive/` (if used) is a separate subfolder the agent should not treat as current requirements.

---

You are building "The Mainframe," a personal local-first life-management desktop + Android app. Before writing any code, read every file in this root directory in this order:

1. `00_PROJECT_BRIEF.md` — the master spec. Contains locked decisions, visual identity, UI structure, and explicit out-of-scope items. Treat every decision in this file as final unless I tell you otherwise in this conversation — do not revisit or re-propose alternatives to anything listed as "already decided."
2. `01_DATA_SCHEMA.md` — the five domain tables, their fields, ingestion parsing rules, and required addenda (schema versioning approach, the `action_trigger` field, and the backup/export requirement). Build the database layer from this file exactly as specified, including the addenda — they are not optional extras, they're part of the schema.
3. `02_TECH_STACK_AND_SETUP.md` — the Tauri v2 + React + Tailwind + SQLite stack, setup steps, build order, and an explicit "do not do" list. Follow the build order as written; do not skip ahead to the Android target before the desktop build is verified working, per the testing-checkpoint guidance in `04_RESEARCH_AND_PRIOR_ART.md` Section D6.
4. `03_UX_RESEARCH_NOTES.md` — why the UI is structured the way it is (sidebar, collapsed-by-default domain cards, progressive disclosure, period switcher placement). Use this as the reasoning behind layout decisions if you need to make a judgment call I haven't specified explicitly.
5. `04_RESEARCH_AND_PRIOR_ART.md` — academic grounding and competitive research. Section D of this file lists structural gaps that are REQUIRED, not optional (backup strategy, schema migration approach, first-run empty states, error/failure handling, Android storage permissions). Do not treat these as nice-to-haves — a build that skips Section D is incomplete even if every domain's CRUD works, because there is currently no server and no other safety net for this app's data.

If any subfolder named `archive/` exists in this directory, do not read it as a requirements source — it contains superseded earlier drafts kept for reference only. If you find contradictions between anything in `archive/` and the numbered docs 00–04, the numbered docs are always correct.

Context volume note: you have a large amount of concept-development context available across these five files, produced over several rounds of deliberation. This is intentional and should be used fully — do not default to a generic task-app scaffold and lightly reference the docs. Specific things I expect you to actually apply, not just acknowledge:

- The exact five-domain schema (courses, acquisitions, goals, build_ideas, ventures) with their specific fields, not a generic single "tasks" table.
- The specific color values given (#0E0E10 background, #F2F2F0 text, #4A9EFF accent), not a default Tailwind dark theme.
- Plain-text-paste as the ONLY ingestion method — if you find yourself building a file upload dialog, stop, you've deviated from the spec.
- Collapsed-by-default domain cards with count summaries, expanding on click — not a flat list of everything at once.
- The migration/versioning and backup mechanisms from Section D of the research doc, built in from the first schema version, not retrofitted later.

Confirm you've read all five files and briefly state back the five domain names and the core stack choice (proving you've actually ingested the specifics, not just skimmed) before starting the scaffold. Then proceed with step 1 of the build order in `02_TECH_STACK_AND_SETUP.md`.
