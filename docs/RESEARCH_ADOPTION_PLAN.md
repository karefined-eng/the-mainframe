# Research Recommendation Adoption Plan

## Objective

Turn the market and product research into a small, testable product improvement sequence without expanding The Mainframe into a generic project-management suite.

The target outcome is a product that feels like a calm, familiar home for scattered life information: fast to start, useful before it is fully organized, and trustworthy because it remains local-first and portable.

## Guardrails

- Preserve offline-first operation and SQLite as the local source of truth.
- Keep sync opt-in, local-network-only, and clearly labeled until encrypted transport exists.
- Do not market the app as a medical, therapeutic, or ADHD treatment product.
- Do not add AI categorization, collaboration, tags, graph views, or a full calendar replacement before the core workflow is validated.
- Keep capture faster than organization; optional fields are preferable to mandatory setup.
- Every data-moving feature must have an export, backup, or recovery story.

## Recommendation sequence

### Phase 1 — Make the first five minutes understandable

**Goal:** A new user can understand the model and create useful data without reading documentation.

Work:

1. Add a first-run choice: **Start with examples**, **Bring in my lists**, or **Start empty**.
2. Add a universal quick-add entry point with the prompt:
   `Add an idea, goal, course, or purchase…`
3. Rename user-facing **Paste Import** to **Bring in a list** or **Import an existing list**.
4. Prefer familiar labels in the primary navigation:
   - Today
   - Everything
   - Courses
   - Projects
   - Goals
   - Ideas
   - Purchases
   - Writing
5. Keep existing database/domain names where changing them would create migration or compatibility risk.

Acceptance criteria:

- A clean install presents an obvious next action.
- A sample workspace demonstrates at least one course, project, goal, purchase, and writing item.
- A pasted list visibly renders as newly created rows without requiring a second navigation step.
- Existing users do not lose data or need a destructive migration.

### Phase 2 — Make the home screen useful

**Goal:** The default view answers “What should I pay attention to now?”

Work:

1. Make **Today** or **What's Hot** the primary landing surface.
2. Add sections for:
   - Needs attention
   - Continue where you left off
   - Recently added
   - Pick one to restart
3. Keep domain cards collapsed by default.
4. Add search/filter inside expanded domains.
5. Sort active items first, then most recently touched.
6. Add supportive states such as **Coming up** and **Not now** without removing access to exact dates/statuses.

Acceptance criteria:

- The landing view is useful with a small dataset and does not require opening every domain.
- A user can find an item in a domain without scrolling a long unsorted list.
- Empty states direct the user to quick add or list import.

### Phase 3 — Improve re-entry and follow-through

**Goal:** Returning after time away should encourage re-entry rather than create an accusation wall.

Work:

1. Add optional snooze choices: tomorrow, next week, and custom date.
2. Add a **Not relevant anymore** or archive path separate from completion.
3. Add an optional `action_trigger` field for goals, projects, and ventures:
   “After Friday’s lecture, spend 30 minutes on the packaging bug.”
4. Keep the trigger optional and editable; do not make it a required planning ritual.
5. Define what “done” means per domain in the UI while preserving the existing flexible status model.

Acceptance criteria:

- A user can defer an item without deleting it or marking it complete.
- Re-entry surfaces a small number of meaningful actions.
- Trigger text is visible where the user decides what to do next.

### Phase 4 — Make data portable and sync understandable

**Goal:** Users can trust the local-first model and understand exactly what sync does.

Work:

1. Add plain-text/Markdown export by domain in addition to database backup.
2. Make backup-before-replacement explicit in the sync flow.
3. Show sync direction and replacement behavior before confirmation.
4. Keep device-first language in the primary flow; hide IP and port details under Advanced.
5. Test large transfers, interrupted transfers, app backgrounding, and recovery on real Android devices.
6. Replace cleartext LAN transport with encrypted transport before recommending use on untrusted networks.

Acceptance criteria:

- A user can export their information without relying on the application database format.
- A sync operation states source, destination, size, and replacement consequences.
- Interrupted or invalid transfers do not replace the active database.
- Public documentation never describes current LAN sync as cloud sync or end-to-end encrypted.

## Validation plan

Recruit 5–10 people who currently split information across Notes, Notion, messaging apps, spreadsheets, and memory. Give them real tasks:

1. Start from an empty workspace.
2. Import an existing list.
3. Add one item through quick add.
4. Return to the app after several days.
5. Find and act on one item from the home screen.
6. Export or back up the workspace.

Measure:

- Time to first useful item.
- Time from pasted text to visible structured rows.
- Whether users understand the five-domain model without explanation.
- Whether users return within three days.
- Number of items created, deferred, completed, and abandoned.
- Whether users can explain what sync does before using it.

Do not treat feature comprehension as validation by itself. The key signal is repeat use after importing real personal information.

## Suggested delivery order

1. Phase 1 first-run, quick add, and import wording.
2. Phase 2 landing dashboard and domain filtering.
3. Phase 3 snooze, re-entry, and optional action triggers.
4. Phase 4 export, sync UX, and transport hardening.

Each phase should ship as a small branch or focused pull request, with frontend build validation and a short manual acceptance checklist before the next phase begins.

## Explicitly deferred

- AI categorization.
- Tags, backlinks, graph views, and custom databases.
- Team collaboration.
- Automatic cloud sync.
- Public-network or Internet sync.
- Gamification and streaks.
- iOS implementation before desktop and Android workflows are stable.

