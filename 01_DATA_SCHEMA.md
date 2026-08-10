# The Mainframe — Data Schema (v1)

This is the resolved schema. Five domains, each its own table, sharing a common shape where possible so the ingestion parser and dashboard components can stay generic.

## Common fields (every domain table has these)

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `title` TEXT NOT NULL
- `notes` TEXT — free text, nullable
- `status` TEXT — e.g., `not_started`, `in_progress`, `done`, `paused`, `Operating`, `Failed`. This is NOT a strict enum; the user can type in a custom status string. (default `not_started`)
- `recurrence` TEXT — nullable. Handles recurring items (e.g. "weekly", "daily", "monthly").
- `created_at` TEXT (ISO 8601)
- `updated_at` TEXT (ISO 8601)
- `target_date` TEXT — nullable, ISO 8601 date. Powers the daily/weekly/monthly view.
- `raw_import_text` TEXT — nullable. Stores the original pasted line this row was parsed from, for traceability/debugging the parser.

## Domain 1: `courses`

| Field | Type | Notes |
|---|---|---|
| platform | TEXT | e.g. Coursera, Udemy, YouTube |
| url | TEXT | nullable |
| progress_percent | INTEGER | 0–100, default 0 |
| (+ common fields) | | |

## Domain 2: `acquisitions`

Purchases / gear / apparel / equipment to buy.

| Field | Type | Notes |
|---|---|---|
| category | TEXT | free text, e.g. "gear", "apparel", "electronics" — no fixed enum in v1 |
| estimated_cost | REAL | nullable |
| priority | TEXT | one of `low`, `medium`, `high`, default `medium` |
| (+ common fields) | | |

## Domain 3: `goals`

Long-term goals, bucket-list items.

| Field | Type | Notes |
|---|---|---|
| timeframe | TEXT | free text, e.g. "this year", "before 25", nullable |
| (+ common fields) | | |

## Domain 4: `build_ideas`

Dev projects, app ideas, "the core mainframe of things to pursue."

| Field | Type | Notes |
|---|---|---|
| category | TEXT | e.g. "dev", "security tool", "client work" |
| repo_or_link | TEXT | nullable — GitHub repo, live URL, etc. |
| (+ common fields) | | |

## Domain 5: `ventures`

Business ideas, freelance/agency-adjacent concepts.

| Field | Type | Notes |
|---|---|---|
| stage | TEXT | e.g. "idea", "validating", "building", default "idea" |
| (+ common fields) | | |

## Domain 6: `skills`

Ongoing capabilities, practices, and physical/mental proficiencies to master.

| Field | Type | Notes |
|---|---|---|
| (+ common fields) | | |

## Domain 7: `experiences`

One-time bucket list events, travel, or experiences to enjoy.

| Field | Type | Notes |
|---|---|---|
| (+ common fields) | | |


## Ingestion parsing rules (plain text paste → rows)

1. Input is a single multi-line plain text block, pasted by the user into a text box (one per domain, or one universal box with a domain selector — decide at build time, default to per-domain box for v1 simplicity).
2. Each non-empty line becomes one row's `title`, with `raw_import_text` storing the original line.
3. No attempt to auto-detect fields (platform, cost, etc.) from the pasted text in v1 — user fills those in after import if needed, directly in the dashboard. This keeps the parser trivial: split on newlines, trim, insert.
4. Empty lines and lines that are only whitespace are skipped.
5. Strict deduplication logic at the database level — all domain tables MUST have a `UNIQUE(title)` constraint. Ingestion scripts and frontend code MUST use `INSERT OR IGNORE` to gracefully handle duplicates when the user pastes the same list twice.

## Explicitly deferred (do not build into schema now)

- `tags` table / many-to-many tagging — deferred per project brief.
- `synced_to_calendar` flag — not needed until calendar mirror is built.
- Any encryption-at-rest columns — handled at the file level (SQLCipher) later if needed, not per-row.

---

## Addendum: Schema versioning table (required — see 04_RESEARCH_AND_PRIOR_ART.md, Section D2)

Every domain table above needs schema-change tracking from the first migration, not retrofitted later. Use SQLite's built-in `user_version` pragma rather than a hand-rolled table:

```sql
-- On app startup, check current version:
PRAGMA user_version;

-- Example migration structure (Rust/Tauri side pseudocode):
-- if user_version == 0:
--     CREATE TABLE courses (...);
--     CREATE TABLE acquisitions (...);
--     CREATE TABLE goals (...);
--     CREATE TABLE build_ideas (...);
--     CREATE TABLE ventures (...);
--     PRAGMA user_version = 1;
```

Rules for the agent:
- One migration = one logical change (e.g. "add `action_trigger` column to goals" is its own migration, not bundled with an unrelated change).
- Wrap every migration in a transaction so a failure rolls back cleanly rather than leaving a half-migrated schema.
- Before any non-trivial migration runs, copy the existing `.db` file to a timestamped backup path first. This is cheap and is the only safety net this app has (see Section D1 — there is no server to fall back on).

## Addendum: `action_trigger` field (accepted from Section C recommendation 1)

Add to `goals`, `build_ideas`, and `ventures` tables:

| Field | Type | Notes |
|---|---|---|
| action_trigger | TEXT | nullable. Optional if-then plan: when/where/how the user intends to act on this item (e.g. "after Friday physics lecture, in Antigravity"). Backed by implementation-intention research — see 04_RESEARCH_AND_PRIOR_ART.md Section A3. Purely optional field, never required at entry time. |

## Addendum: Backup/export requirement (required — see 04_RESEARCH_AND_PRIOR_ART.md, Section D1)

Not a new table — a required UI action. The dashboard needs one explicit "Export / Backup Now" control that:
1. On desktop: copies the full `.db` file to a user-chosen location via native file dialog.
2. On Android: must go through the Storage Access Framework (SAF) rather than a raw file path, due to Android 10+ scoped storage restrictions — a raw path export that works on desktop will silently fail on Android if not handled this way. Flagged explicitly so this isn't discovered only after an Android build attempt fails.
3. Optionally also supports a plain-text-per-domain export (title + notes + status, one line per row) as a lightweight human-readable alternative to the raw `.db` file, per Section C recommendation 3.
