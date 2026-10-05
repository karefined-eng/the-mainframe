# The Mainframe — Open Decisions: Your Answers Needed

Purpose: this document turns the seven unresolved gaps identified in `07_ADDITIONAL_GAPS.md` into direct questions, asked one at a time with enough context to answer confidently. Nothing here should be decided by the build agent on its own — these are judgment calls about your actual vision, not technical implementation details.

How to use this: answer each question in your own words, in whatever length feels right — a sentence is fine, a paragraph is fine. Once you've answered all seven, I'll fold your answers back into `00_PROJECT_BRIEF.md`'s decisions table and update any downstream docs (schema, notification engine) that depend on the outcome.

> **Status note:** This file contains the original product questions and is partly superseded by implementation. LAN sync now exists as an opt-in, one-time-paired local snapshot transfer. The questions below remain useful for product behavior and UX, but should not be read as evidence that sync is absent.

---

## Question 1 — What's the "it worked" moment?

**Context:** The whole reason Mainframe exists is the frustration of scattered lists across phone and laptop. The first time you actually use it for real, something needs to happen that makes you go "okay, this is genuinely better than what I had before" — otherwise the app quietly joins the pile of tools you built and stopped opening.

**My proposal, for you to accept or replace:** the moment you paste one of your real existing lists (say, your build-ideas list or your course list) and watch it become organized, browsable, structured rows in under 30 seconds — that transformation from "wall of text" to "system" is the actual payoff moment, and the UI should make it visually obvious in that instant rather than something you have to click around to confirm happened.

**Your answer:** Is that the right moment, or is the real payoff something else for you — e.g., seeing everything collapsed and calm for the first time, or something else entirely? Describe what you picture happening in your head the first time you actually feel "this was worth building."

---

## Question 2 — When Windows and Android disagree, which one is right?

**Context:** You're building for both Windows desktop and Android from one Tauri codebase, with deliberate local snapshot transfers between devices. The current flow does not provide automatic reconciliation: if you edit something on your phone and later transfer a desktop snapshot, you must understand the direction and replacement behavior.

**Your two real options:**
- **Option A — Windows is boss.** For v1, only the Windows desktop app is where you actually add/edit things. The Android app either isn't built yet, or is view-only (you can look, but not change anything from your phone).
- **Option B — Manual handoff.** Both apps can be edited, but you're responsible for manually exporting from one and importing into the other when you switch devices — no automatic reconciliation, just a deliberate action you take yourself.

**Your answer:** Which one matches how you'd actually use this day to day? Be honest about whether you'd actually remember to do a manual export/import (Option B) or whether that's the kind of thing that quietly never happens in practice.

---

## Question 3 — What happens when a domain gets big?

**Context:** Once you've pasted in your real lists, a domain like `build_ideas` could easily hold 30-40+ items on day one, given how many projects and ideas you've already built or conceived. A collapsed card that just expands into one long unsorted list of 40 items brings back the exact overwhelmed feeling the collapsed-card design was meant to solve.

**My proposal:** a simple search/filter box inside each expanded domain (type to filter by title/notes), plus items sorted with in-progress-first, then most-recently-touched-first — so the things you're actually working on float to the top automatically.

**Your answer:** Does that match how you'd want to find things again, or do you picture browsing/sorting differently — e.g., by date added, by a manual priority ranking you set yourself, by category tags (even though tagging is deferred)?

---

## Question 4 — Should there be one single "what's hot right now" view across everything?

**Context:** This is the most philosophically important question in this whole list, because it touches the core design principle of the app. "Fluid prioritization, not rigid scheduling" was the founding idea — Mainframe shouldn't force your life into one linear queue. But the notification engine already computes an urgency score for every single item across all five domains, which means the *data* to build a single cross-domain ranked view already exists, whether or not you ever see it as a screen.

**The actual choice:**
- **Domain-siloed** — you look at Studies, then separately look at Ventures, then separately look at Build Ideas, and *you* are the one doing the mental work of deciding what matters most across all of them, by eye, the way you naturally would.
- **One combined view** — a screen (maybe the default landing screen, maybe a separate tab) that says, in effect, "here's what's most urgent across your entire life right now," blending items from all five domains into one ranked list.

**Your answer:** Does a single blended "what's hot" view feel like the tool doing something genuinely useful for you, or does it feel like exactly the kind of rigid, anxiety-inducing prioritization Mainframe was built to avoid? There's no wrong answer here — this is entirely about what would actually help vs. stress you out.

---

## Question 5 — What does "done" actually mean for a goal or a business idea?

**Context:** Marking a course "done" is obvious — you finished it. Marking a purchase "done" is obvious — you bought it. But what does "done" mean for something like a long-term goal ("travel more") that doesn't really have a finish line, or a business venture that transitions from "an idea" into "an actual operating business" rather than simply completing?

**My proposal:** keep it deliberately loose for v1 — "done" just means "this no longer needs my attention in this system," full stop, without trying to model the deeper real-world meaning of what completion looks like for every domain.

**Your answer:** Is that loose definition good enough, or are there specific cases in your own goals/ventures list right now where you already know "done" would feel wrong or unsatisfying if it just meant "archived"?

---

## Question 6 — Do any of your real lists have things that repeat?

**Context:** Every domain and every document so far has quietly assumed everything is a one-time item — a course finishes once, a purchase happens once. Nothing currently handles recurring commitments: a weekly deliverable for a client (Very Nice Concepts, Immaculate Vintage Collections, Linah Asante OTC), a recurring personal habit, a standing weekly obligation. If you paste in a list containing something recurring, it'll just become a single flat row with no way to represent "this happens every week."

**Your answer:** Looking at your actual current lists — courses, purchases, goals, build ideas, ventures — is there anything genuinely recurring you'd want tracked as *recurring* (not just re-typed manually each time it comes around), or is everything you have in mind actually one-time/finite in nature? If there is something recurring, name it so I know what shape it needs.

---

## Question 7 — What should it feel like coming back after two weeks away?

**Context:** Given your actual workload (coursework, freelance client work, personal builds all running in parallel), there will be stretches where you don't open Mainframe for a while. When you come back, you could be greeted by a wall of overdue, red, "URGENT" items — which feels punishing and is exactly the kind of thing that makes people quietly abandon a tool rather than re-engage with it.

**My proposal:** a calm, neutral "here's what's changed since you were last here" summary instead of a re-fired flood of every notification you missed — no red-everywhere urgency wall, no accusatory tone.

**Your answer:** Does that match the feeling you want, or would you actually prefer the honest, slightly uncomfortable version — seeing exactly how behind you are, because that discomfort is itself useful motivation for you? Some people are genuinely better served by the tool being blunt with them; only you know which one you are.

---

## Next Step

Once you've answered these seven, send them back (in this doc, inline, or just as plain text — whatever's easiest) and I'll:
1. Update `00_PROJECT_BRIEF.md`'s decisions table with the final calls.
2. Patch `01_DATA_SCHEMA.md` if any answer requires a new field (e.g., a recurrence field for Q6, a priority/sort field for Q3).
3. Patch `06_NOTIFICATION_ENGINE.md` if Q4 or Q7 change how the urgency view or re-entry experience should behave.
4. Remove the now-resolved "Decisions Still Needed" table from `07_ADDITIONAL_GAPS.md` and replace it with a pointer to this document's answers, so there's no duplicate or stale open-questions list floating between two files.
