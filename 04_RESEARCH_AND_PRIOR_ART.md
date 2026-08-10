# The Mainframe — Research Grounding & Prior Art

Purpose of this file: This is not implementation instruction — it's the evidence base. Section A summarizes what academic research in personal information management (PIM) and goal psychology actually establishes, so decisions in the project brief aren't just aesthetic preference. Section B is a teardown of existing tools in this space, extracting specific mechanisms worth borrowing. Section C is the "you didn't ask for this but should consider it" list — small, low-cost features surfaced by cross-referencing the research against your specific stated pain points.

Read this after `00_PROJECT_BRIEF.md`. Nothing here overrides decisions already locked in that file — this is supporting evidence and a small number of proposed additions, flagged as such.

---

## Section A: Academic Grounding

### A1. Personal Information Management (PIM) as a field

PIM is an established interdisciplinary research area spanning information science and HCI, concerned with <cite index="17-1">how people acquire, store, organize, maintain, retrieve, and use information across many forms — files, emails, notes, messages — in service of both everyday and long-term goals, and across life roles like work, family, and personal projects</cite>. This matters for The Mainframe because it confirms the core premise — unifying disparate personal information under one system — is a recognized, studied problem, not a novel or niche idea. It also frames the risk: <cite index="17-1">the field's central open question is how to integrate previously separate information without inadvertently creating new problems</cite> in the process. Translation: consolidating five domains into one dashboard is good, but if done carelessly it can just relocate the mess rather than resolve it — reinforcing why the project brief insists on progressive disclosure rather than a single undifferentiated wall of items.

A large-scale study using the Delphi method surveyed PIM researchers directly and produced <cite index="9-1">a set of 36 concrete PIM practices along with pros, cons, and recommendations for or against each</cite> — this is a genuinely useful reference document if you want to sanity-check specific organizational habits later (e.g., "should I file or pile," "should I tag now or later") against expert consensus rather than intuition alone.

Separately, PIM research distinguishes behavioral strategies along measurable axes — researchers <cite index="12-1">found that knowledge workers reliably differ in whether they manage information proactively or reactively, whether they file into categories or pile loosely, how sophisticated their classification systems are, and whether they delete or retain — and identified nine distinct behavioral clusters explaining most observed variation</cite>. Practical implication for The Mainframe: there is no single "correct" organizational scheme even in the literature. The system should not force one filing philosophy on you — which is consistent with the brief's choice to keep fields loosely typed (free-text `category` fields rather than rigid enums) and defer tagging.

### A2. PIM specifically in a student/learning context

This is the closest academic match to your actual situation. Research on PIM in learning contexts frames it precisely: <cite index="13-1">students today build a personal information archive spanning PCs, laptops, and mobiles that is directly tied to their coursework, and PIM functions as a form of digital literacy central to how students actually complete assignments</cite>. This validates treating "Studies" as a first-class domain alongside dev/business/personal goals rather than as a separate system (e.g., a school-only planner) — the research treats academic and personal information management as continuous, not separate problems, which matches your instinct to have Mainframe hold coursework and business ideas side by side.

### A3. Implementation intentions — the single most actionable research finding here

This is the strongest, most directly applicable body of evidence, and it's currently NOT reflected anywhere in the project brief. Worth reading carefully.

The psychological research on "implementation intentions" (Gollwitzer et al.) shows that <cite index="19-1">once goal pursuit is actually underway, difficulties or barriers encountered along the way tend to produce resumption of the goal rather than abandonment</cite> — meaning the hardest point in achieving anything isn't sustaining it, it's *starting* it. The mechanism that reliably closes that gap is absurdly simple: <cite index="25-1">forming an "if-then" plan that specifies exactly when, where, and how you'll act, rather than just setting the goal itself</cite>.

The effect size is not trivial. A meta-analysis of <cite index="18-1">94 studies found implementation intention formation had a medium-to-large effect on goal attainment, and the effect held across student and non-student samples, self-report and objective outcome measures, and a wide range of behaviors</cite>. It's specifically strong for exactly your use case: <cite index="25-1">implementation intentions are especially effective for difficult-to-accomplish goals</cite> — the long-term goals, business ventures, and build-ideas domains in Mainframe are precisely this category, as opposed to simple recurring chores.

**What this means concretely for Mainframe:** a goal or task stored merely as a title with a target date ("Launch EleViewer v2") is a *goal intention*. The research says that's the weak form. A field capturing the *when/where/how* trigger ("When I finish my Friday physics lecture, I'll spend 30 min in Antigravity on the EleViewer packaging bug") is an *implementation intention*, and it measurably outperforms the goal-only version at getting acted on. See Section C for how small this would be to add.

### A4. Cognitive load and capture friction

This directly backs the UI decisions already locked in the brief, so it's confirmation rather than new information — but it also surfaces one addition worth flagging. <cite index="36-1">Progressive disclosure — revealing information only as users need it — is a standard, evidence-based technique for minimizing initial cognitive load</cite>, and <cite index="38-1">interfaces that force users to hold too much in memory or make too many decisions at once cause people to struggle to finish what they started</cite> — which is the exact mechanism behind the demotivation problem you flagged with seeing multiple unfinished papers at once. The brief's collapsed-by-default domain cards are the correct research-backed response to this.

One nuance worth knowing: friction is not always bad. <cite index="41-1">Deliberately introduced friction, at the right moment, can improve task accuracy and satisfaction by giving users a brief pause to engage deliberate thought rather than acting automatically</cite> — this is sometimes called a "microboundary." This is relevant to exactly one design choice: whether "mark as done" should be a single tap (minimize friction, maximize speed) or require a brief confirmation for high-effort items like ventures/build-ideas (small friction, forces a real moment of reflection on what completion means). Not a recommendation to add a confirmation dialog everywhere — just noting the tradeoff exists and isn't automatically resolved in favor of "always fewer clicks."

---

## Section B: Prior Art — Existing Systems Worth Learning From

### B1. Obsidian — local-first philosophy, closest ideological match

<cite index="33-1">Obsidian is local-first, storing notes as plain-text Markdown files directly on the hard drive for full privacy and offline access, in contrast to cloud-based tools</cite>, and follows <cite index="33-1">a bottom-up organizational philosophy built around linking, rather than Notion's top-down database-and-page structure</cite>. This is close to Mainframe's own local-first SQLite approach. What's worth borrowing: Obsidian's plain-text storage means the user's data is never locked into a proprietary format — worth keeping in mind for a future "export all domains to plain text/markdown" feature, which would be nearly free to build given the existing plain-text-paste ingestion pathway already planned.

### B2. Super Productivity — the closest direct competitor to Mainframe's actual scope

This is arguably the most relevant existing tool. It's explicitly positioned as <cite index="28-1">a focused open-source alternative to Todoist, TickTick, Things 3, and Notion, built local-first with tasks, notes, and time data staying on-device unless sync is explicitly configured, and with no in-app analytics or telemetry</cite>. Feature set worth noting: <cite index="28-1">it combines timeboxing, Pomodoro, and productivity analytics alongside the task backlog itself, and includes deep GitHub/GitLab/Jira integration that keeps commits tied to time spent</cite>. The GitHub-linking idea is directly relevant to your `build_ideas` domain — see Section C.

### B3. TickTick — feature-complete but architecturally the opposite of what you want

<cite index="30-1">TickTick bundles task management, calendar, habit tracking, Pomodoro timer, an Eisenhower matrix, and a Kanban board into one app</cite>, but <cite index="29-1">stores all data in its own cloud with no local-first option</cite>. Useful as a feature-breadth reference (Eisenhower matrix and Kanban view are both cheap, well-understood UI patterns you could add to a domain's expanded view later) but not as an architecture reference — it's the system Mainframe is explicitly positioned against.

### B4. Things 3 — the design-quality benchmark

<cite index="31-1">Things 3 is Apple-only and lacks TickTick's collaboration and cross-platform reach, but is widely regarded for clean design and an intuitive interface</cite>, and <cite index="31-1">uses a simpler, less configuration-heavy approach to scheduling than TickTick's more advanced recurring-task and location-reminder system</cite>. The relevant lesson isn't a specific feature — it's restraint. Things 3's reputation is built on doing less, well, rather than doing everything. This directly supports the project brief's discipline of cutting scope aggressively for v1.

### B5. TaskForge (Obsidian-vault task layer) — the "single source of truth, other tools are views" pattern

<cite index="29-1">TaskForge treats an Obsidian vault as the single source of truth rather than a standalone silo, in contrast to TickTick which owns its own separate cloud data store</cite>, while still offering <cite index="29-1">native mobile widgets and notifications on top of that shared local data</cite>. This is precisely the relationship already specified between Mainframe and Google Calendar in the project brief (Mainframe = source of truth, Calendar = read-only mirror) — TaskForge is a working proof that this "one true store, thin app-specific views on top" architecture holds up in practice.

---

## Section C: Non-Obvious Additions Worth Considering

These are small, cheap additions surfaced by cross-referencing Section A/B against your specific stated frustrations. None of these are required — flagged individually so you can accept or reject each on its own merit. If accepted, add to `01_DATA_SCHEMA.md` before the agent builds the schema; do not let the agent add these unprompted.

1. **Optional "trigger" field on goals/build_ideas/ventures** (implementation intentions, A3). A single nullable text field — `action_trigger` — where you can optionally write the when/where/how for a specific item ("after Friday physics lecture, in Antigravity"). Given a medium-to-large effect size in the literature specifically for difficult, high-effort goals, this is likely the single highest-leverage addition available for the lowest engineering cost — it's one column and one optional input box, not a feature.

2. **Repo/commit linking for `build_ideas`** (B2, Super Productivity). The schema already has a nullable `repo_or_link` field. Worth considering, later, a lightweight "last commit date" pull from GitHub for that repo (you already have `api.github.com` in your allowed network domains) — turns a static link into a live signal of whether a project is actually active. Not v1, but cheap to bolt on once the CRUD layer exists.

3. **Plain-text export, not just import** (B1, Obsidian). Since ingestion is already "paste plain text in," the reverse — "export domain as plain text" — is nearly free to add and guarantees you're never locked into the SQLite file if you want to inspect or back up your data by hand.

4. **A deliberate (not accidental) confirmation step for marking ventures/build-ideas "done"** (A4, design friction). Not for the low-stakes domains (acquisitions, courses) where speed matters more — but for the two domains representing real effort investment, a one-tap-plus-confirm pattern may be worth the extra half-second, per the microboundary research. Flagged as optional and genuinely debatable — test it, don't assume it's correct.

5. **Nine-cluster behavioral self-check** (A1). Not a feature to build — a prompt for you personally. The PIM literature's nine behavioral clusters (file vs. pile, proactive vs. reactive, sooner vs. later) are worth a five-minute honest self-assessment before you finalize how granular the domain fields should be. If you know you're naturally a "piler," aggressively structured mandatory fields will fight your own habits and you'll abandon data entry within weeks — better to keep fields optional (which the schema already does) and let structure emerge from actual usage.

---

## Section D: Load-Bearing Gaps — Not Discussed Yet, Must Be Resolved Before Build

Everything above was additive polish. This section is different: these are structural aspects of the project that haven't been discussed at all across any prior document or conversation, and a v1 build is genuinely incomplete without a decision on each. These aren't optional the way Section C is — pick an answer for each before the agent starts, even if the answer is deliberately minimal.

### D1. Backup and data-loss strategy — the single biggest unaddressed risk

This project has no server. That's a deliberate, correct decision for v1 (see project brief). But it has a direct consequence that hasn't been named anywhere yet: for a normal local-first app, <cite index="53-1">if local data is lost, the app recovers by pulling from the server again — the server effectively acts as the backup</cite>. Mainframe has no server. That means **there is currently no backup mechanism for your data at all** — if the SQLite file is corrupted, the device is wiped, lost, or stolen, or a bad migration mangles the schema, everything in five domains of life-tracking is gone with no recovery path.

This must be resolved before build, not after. Minimum viable answer for v1: an explicit "Export All / Backup Now" action that dumps the full SQLite DB (or a plain-text export per domain, per Section C item 3) to a user-chosen location — which the user can then manually copy to a USB drive, cloud folder, or wherever. This does not need to be automatic or scheduled in v1. It needs to *exist* as a button, and the agent should be instructed not to treat "local-first" as synonymous with "no backup needed" — those are different problems.

### D2. Schema versioning and migration

The schema in `01_DATA_SCHEMA.md` will change. You will want to add a field, rename something, or realize a domain needs restructuring within weeks of first using this. The standard, low-effort pattern for this in SQLite is well-established: <cite index="45-1">SQLite has a built-in `user_version` pragma specifically for tracking schema version — on connection, the app checks the current version and runs any migration steps needed to bring it up to the latest, bumping the version number after each</cite>. Critically, <cite index="49-1">one migration should correspond to one logical change — a migration that bundles three unrelated column additions is harder to review and harder to revert than three separate migrations</cite>, and <cite index="49-1">a quick backup or file copy before any non-trivial migration is cheap insurance</cite> that directly ties back to D1. The agent must build this in from the first migration, not retrofit it after the schema has already changed once by hand.

### D3. First-run / empty-state experience

Every screen in the UI structure doc assumes data already exists ("3 courses in progress"). Nobody has specified what the dashboard looks like the very first time it opens, with zero rows in every table. This matters more than it sounds like — an empty dashboard with five cards all reading "0 items" and no guidance is a common reason people abandon a personal tool in the first five minutes. Minimum resolution: each domain's collapsed card, when empty, should show a one-line prompt pointing at the paste-ingestion box rather than just "0," so the first action is obvious without instructions.

### D4. Error and failure states

Not discussed anywhere: what happens when the plain-text paste ingestion receives something malformed, when a Tauri SQL command fails, when the Android build can't reach the SQLite file due to a permissions issue, or when a migration fails partway through. Per D2/D1, a failed migration without a backup is unrecoverable. The agent should implement at minimum: (a) migrations wrapped in transactions so a failure rolls back cleanly rather than leaving a half-migrated schema, and (b) visible (not silent) error feedback in the UI for any failed CRUD operation — a failed save that fails silently is worse than one that visibly fails, because the user believes their data is saved when it isn't.

### D5. Android permissions and file access

The tech stack doc specifies Tauri's Android target but does not address that Android's scoped storage rules (Android 10+) restrict where an app can read/write files outside its own sandbox. This is directly relevant to D1 (backup/export) — an "Export to a location of your choice" action on Android needs to go through the Storage Access Framework, not a raw file path, or it will simply fail on-device despite working fine in a desktop build. Flag this explicitly to the agent so it isn't discovered only after Android build attempts fail.

### D6. What "done" build order actually means

The build order in `02_TECH_STACK_AND_SETUP.md` is sequential (schema → backend → shell → ingestion → detail views → Windows build → Android build) but doesn't specify a testing checkpoint between steps. Recommend the agent treat each build-order step as gated: manually verify CRUD + at least one full ingest-then-view cycle works correctly on desktop *before* attempting the Android target, since debugging a broken data layer is materially harder once two platform build pipelines are both in play.

---

## Section E: Sourcing and Context Recommendation

On whether to also place the original two concept documents (`The_Mainframe__Technical_Architecture_and_Implemen.md` and `The_Mainframe__A_Comprehensive_Conceptual_Framewor.md`) and this conversation's transcript into the root directory alongside the five numbered docs: **do not add them as-is.**

Reasoning: those two original documents contain scope that was explicitly cut in `00_PROJECT_BRIEF.md` — CRDTs, WebRTC P2P mesh, DIDs/Passkeys, a separate Expo mobile app, full multi-format file parsing. If the agent reads five files that say "v1 is lean" and two files that describe a six-person startup's roadmap, with no annotation distinguishing "superseded" from "current," there is a real risk of scope leaking back in exactly the way `00_PROJECT_BRIEF.md` section 3 was written to prevent. An agent doing its own context-gathering across a folder of markdown files will generally not reliably infer document precedence on its own.

If you want them preserved for your own reference (e.g. mining them later for the deferred features — sync, tagging, encryption — once v1 is stable), the safer approach is a subfolder: `the-mainframe/archive/`, clearly separated from the root-level numbered docs the agent is instructed to treat as current. Same recommendation applies to the raw audio transcript — it's already been fully distilled into the five numbered docs; keeping the raw transcript in `archive/` preserves it without risking it being read as an independent, possibly-contradictory source of requirements.

The full source list for this document (Section A/B citations) does not need to be added to the root dir — the citations are already inline above and the agent has no use for the raw search results; only the synthesized conclusions matter for the build.

