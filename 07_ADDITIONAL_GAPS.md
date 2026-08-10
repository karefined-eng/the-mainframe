# The Mainframe — Additional Pivotal Gaps (Beyond Notifications)

Purpose: notifications turned out to be one significant gap that no prior document addressed at all — this document does the same audit for other aspects of comparable importance to the project's actual success, not just its technical completeness. Each item below is something that will materially affect whether you keep using this app past week one, not just whether it compiles.

Read alongside `04_RESEARCH_AND_PRIOR_ART.md` Section D (structural/technical gaps) and `06_NOTIFICATION_ENGINE.md`. This document covers what neither of those did.

---

## 1. The "Magic Moment" Problem — First Session Design

This is arguably the single highest-leverage gap, and it's about you specifically, not a hypothetical user base. Onboarding research is consistent on one point: <cite index="69-1">the first session predicts long-term retention more reliably than any other variable — users who complete a meaningful action on day one retain at two to three times the rate of users who open an app, look around, and close it</cite>. Product teams look for a specific "magic moment" — <cite index="73-1">the specific action or combination of actions that separates users who stick around from those who don't</cite> (the canonical example being Facebook's discovery that users who added 7 friends in 10 days overwhelmingly kept using the product).

**Nobody has defined what Mainframe's magic moment is.** The current spec gets you to an empty dashboard with a paste-ingestion box (per `04_RESEARCH_AND_PRIOR_ART.md` Section D3) — but "empty dashboard, go paste your lists" is not itself a magic moment, it's just a lack of an error state.

**Proposed magic moment, for your explicit confirmation or revision:** the first time a pasted list becomes five to ten structured, browsable rows the user can immediately see organized under a domain — i.e., paste-to-structure in under 30 seconds — is very likely the actual "oh, this is useful" moment for you specifically, given how the concept originated (frustration with scattered lists). If so, this has a concrete build implication: the ingestion flow shouldn't just insert rows silently — it should visibly animate or at minimum immediately render the newly created rows in the now-expanded domain view, so the transformation from "block of pasted text" to "structured system" is visually obvious in the same moment, not something you have to click into a collapsed card to go verify. This is a small UI decision with outsized effect on whether the first five minutes feel like "it worked" or "did anything happen?"

## 2. Cross-Device Reality Check

The project brief specifies Windows desktop + Android from one Tauri codebase, and defers sync ("last-write-wins is sufficient... single user, 1–2 devices"). What's never been made explicit: **which device is authoritative when they diverge, and what actually happens when you open the Android app having last edited on Windows** (or vice versa) with no sync built yet.

Without sync, two SQLite files — one per device — will silently diverge the moment you use both. This isn't a "later" problem if you intend to use the Android build at all in v1; it's a day-one problem for anyone using two devices, which you clearly do (Windows Latitude 7390, Android phone, per your existing work patterns across other projects).

**This needs an explicit decision, not a deferral by default:**
- **Option A (recommended for genuine v1 simplicity):** Windows is the sole authoritative device for v1. The Android build is view-only, or simply not built/installed yet, until sync exists. This keeps the "no sync" decision honest instead of quietly creating two independently-diverging data stores.
- **Option B:** manual export/import between devices (reusing the D1 backup/export mechanism already specified) as a deliberate, user-triggered "sync" — no automatic reconciliation, but at least a known, repeatable way to move state from one device to the other without silent divergence.

Whichever you pick, it should be stated in `00_PROJECT_BRIEF.md`'s decisions table, not left implicit.

## 3. Search and Retrieval at Scale

Every doc so far assumes a small number of rows per domain, browsed via collapsed/expanded cards. Nothing addresses what happens once a domain has, say, 40+ rows — which, given the ingestion-from-existing-lists design, could happen on day one for `build_ideas` alone given how many projects you've already built or conceived (this conversation's memory alone references dozens). A collapsed card showing "40 build ideas" that expands into an unsorted flat list of 40 items reintroduces the exact overwhelm problem the collapsed-card design was meant to solve in the first place.

**Minimum viable answer for v1:** a plain text search/filter box within each expanded domain view (client-side filter over `title` and `notes`, trivial to implement against SQLite with a `LIKE` query, no need for full-text search indexing at this scale) plus a default sort by `status` (in-progress first) and `updated_at` (most recently touched first) rather than insertion order. This is a small addition but prevents the "structured but still unusable at scale" failure mode.

## 4. Conflict Between "Fluid Prioritization" and Actually Structured Data

This is a genuine, unresolved tension worth naming rather than quietly picking a side. The core design philosophy (per `00_PROJECT_BRIEF.md`) is fluid prioritization — deliberately not a rigid queue. But everything built so far (status enums, target dates, urgency scoring in the notification engine) is inherently structured, ranked, scored data. These aren't necessarily contradictory, but nothing has addressed how they coexist in the actual UI.

**Open question for you to resolve, not a silent agent decision:** does "fluid" mean the dashboard should ever show a literal ranked list ("here's what's most urgent right now, across domains"), or does fluid strictly mean domain-siloed, with you doing the fluid cross-domain judgment call yourself by eye? The notification engine in `06_NOTIFICATION_ENGINE.md` computes urgency scores per row — if you want a literal cross-domain "what's hot right now" view surfaced in the UI (not just as notification triggers), that's a small additional view to design (a sixth "virtual" section, not a sixth domain table — just a query across the other five sorted by score) but it needs to be an explicit yes/no rather than something the agent guesses at.

## 5. What Counts as "Done" for Ambiguous Domains

The schema's `status` enum (`not_started`/`in_progress`/`done`/`paused`) works cleanly for `courses` (finished the course) and `acquisitions` (bought the thing). It's genuinely ambiguous for `goals` and `ventures` — what does "done" mean for a bucket-list item that's ongoing by nature ("travel more"), or a business idea that's "done" being an idea because it's now an active operating business (a state change that arguably deserves to promote the row into a different kind of tracking entirely, not just flip a status flag)? This wasn't discussed anywhere, and an agent building CRUD screens will need some default behavior for a case that was never actually specified. Recommend: for v1, leave this loose — `done` simply means "no longer needs your attention in this system," full stop, no attempt to model the richer real-world semantics of what completion means per domain. Revisit only if it proves actively confusing in practice.

## 6. Recurring vs. One-Time Items

Every domain and every prior document implicitly assumes one-time items — a course finishes, a purchase gets made, a goal is achieved. Nothing addresses recurring commitments (a weekly deliverable for a client like Very Nice Concepts, a recurring personal habit, a semester-long standing coursework commitment that isn't well modeled as a single row with a single `target_date`). If any of your actual current lists contain recurring items, the plain-text paste ingestion will flatten them into a single non-recurring row with no way to represent "this repeats." Flagging as explicitly out of scope for v1 rather than silently unhandled — if you have recurring items you want tracked now, they need a manual workaround (e.g., re-entering weekly) until a `recurrence` field is deliberately added in a later version.

## 7. What Happens When You Stop Using It For a While

Directly related to the habituation-risk research already cited in `06_NOTIFICATION_ENGINE.md` Section 1 — reminder-dependent systems can see a sharp drop-off in follow-through once notifications stop landing or get ignored for a stretch. Nothing addresses the "re-entry" experience: opening Mainframe after two weeks away to find a wall of stale `active`/`urgent` items and a backlog of unread notification-log entries. This is a realistic scenario for anyone with your workload (coursework + freelance + personal builds in parallel) and deserves a small, deliberate design response rather than just letting the dashboard look accusatory. Minimal proposal: no punitive language, no red-everywhere urgency wall — a neutral "here's what's changed since you were last here" framing on the notification log (Section 6 schema addition in `06_NOTIFICATION_ENGINE.md`) rather than a live re-fire of every missed notification at once, which would itself violate the daily notification cap already specified.

---

## Open Decisions (Resolved)

The seven gaps have been directly answered via a `/grill-me` session. The answers have been folded back into `00_PROJECT_BRIEF.md`'s core decisions table, and the schema and notification engine docs have been updated to reflect them.
