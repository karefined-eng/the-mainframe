# The Mainframe — Market and Product Research

_Date: 2026-10-05_

## Executive thesis

The Mainframe should not compete as a generic to-do list or as another configurable "second brain." Its strongest wedge is a **calm, local-first personal operating dashboard** for people whose life is spread across many parallel tracks: learning, building, writing, buying, pursuing goals, and starting ventures.

The product promise is:

> The calm command center for everything you are trying to become, build, learn, and acquire — local-first, offline, and without forcing your life into one task list.

## Target market

### Primary wedge: solo builders with scattered commitments

Developers, freelancers, creators, students, career switchers, and early-stage founders often manage courses, projects, purchases, goals, and ideas across Notes, Notion, spreadsheets, messaging apps, and memory. Their problem is not a lack of task-entry tools; it is the absence of one calm, trusted home base for parallel life tracks.

### Secondary audiences

| Audience | Pain | Why Mainframe fits |
|---|---|---|
| ADHD and executive-function users | Overwhelm, task initiation difficulty, time blindness, and abandonment of complex systems | Progressive disclosure, low-friction paste import, visual resurfacing, and configurable nudges |
| Privacy/local-first users | Cloud dependence, vendor lock-in, and unreliable offline access | Local SQLite, offline-first behavior, LAN sync, and no required account |
| Solo operators | Work and personal priorities compete in one mental queue | Cross-domain attention view without imposing a rigid project-management system |
| Students and career switchers | Courses, skills, applications, projects, and purchases live in separate lists | Domains map to a personal development journey |

Do not market Mainframe as a medical or therapeutic ADHD product. Use inclusive language about cognitive load and executive function instead.

## Market landscape and points of resonance

- **Notion:** flexible and broad, but cloud-heavy and setup-intensive.
- **Obsidian and Logseq:** strong local ownership, but users must design their own system.
- **TickTick and Todoist:** polished task execution, but primarily task-centric.
- **Anytype:** privacy/local-first and broad, but more complex for users who want immediate utility.
- **LocalSend:** a useful interaction precedent for no-account, same-network, direct device-to-device transfer.

The opportunity is between familiar notes/list apps and powerful build-your-own systems: Mainframe should feel familiar enough to start immediately while providing a stronger cross-domain home screen.

### Relevant research sources

- [Zapier — task lists that work with ADHD](https://zapier.com/blog/adhd-to-do-list/)
- [Tiimo — planning and focus apps in 2025](https://www.tiimoapp.com/resource-hub/best-adhd-apps-2025)
- [Upbase — productivity apps for ADHD](https://upbase.io/blog/best-productivity-apps-for-adhd/)
- [LocalSend](https://localsend.org/)
- [LocalSend GitHub repository](https://github.com/localsend/localsend)

Research themes across these sources include simple interfaces, visual cues, low-friction capture, external reminders, micro-chunking, offline reliability, privacy, and avoiding unnecessary setup.

## Differentiation and moat

The moat is not Tauri, SQLite, or LAN sync individually; each is replicable. The defensible combination is:

1. **Distinct domain model:** courses, skills, builds, ventures, acquisitions, experiences, writing, and goals.
2. **Instant migration:** paste a messy wall of text and get usable structure immediately.
3. **Cross-domain resurfacing:** help users decide what deserves attention without creating one rigid queue.
4. **Local-first trust:** full offline utility without an account or cloud subscription.
5. **Personal history loop:** over time, the system accumulates what the user revisits, completes, postpones, abandons, and returns to.

The durable advantage is accumulated personal context and habit, not a single feature. Once Mainframe contains a user's courses, projects, aspirations, purchases, and reflections, replacing it becomes inconvenient in a way a generic task list is not.

## Familiarity improvements with small implementation cost

### 1. Use familiar navigation labels

Keep the internal domain model, but use plain labels where they reduce explanation:

- Today
- Everything
- Courses
- Projects
- Goals
- Ideas
- Purchases
- Writing
- Skills
- Experiences

"Ventures" and "Acquisitions" can remain database/domain names while the first-run UI presents "Projects" and "Purchases."

### 2. Make the home screen answer one question

The default screen should emphasize:

- Today
- Continue where you left off
- What needs attention
- Recently added

Do not present all domains as equal-weight choices on first launch. The existing What’s Hot and re-entry models are good foundations for the primary surface.

### 3. Add a universal quick-add field

Use a familiar prompt such as **“Add an idea, goal, course, or purchase…”** and let the user choose a domain afterward, or default to an Inbox. Capture should not require understanding the full domain taxonomy first.

### 4. Rename “Paste Import”

Use **“Bring in a list”** or **“Import an existing list.”** Explain that users can paste content from Notes, Notion, WhatsApp, or a document and turn each line into an item.

### 5. Prefer supportive urgency language

Use:

- “Needs attention” instead of “Urgent” where possible.
- “Coming up” instead of “Overdue” when the softer language is more useful.
- “You’ve been away for 12 days” instead of “You are behind.”
- “Pick one to restart” instead of “You missed these.”

Keep blunt detail available behind an explicit “Show all” action for users who prefer it.

### 6. Add Snooze and Not now

Users need an alternative to deleting or marking an item done:

- Snooze until tomorrow.
- Snooze for one week.
- Not relevant anymore.
- Keep visible.

This is especially important for users who abandon systems when every old item remains an accusation.

### 7. Make sync feel like LocalSend

Use a familiar three-step flow:

1. Make available.
2. Choose a nearby device.
3. Confirm transfer.

Keep IP addresses and ports under an Advanced connection option. The main interaction should be device-first, not network-configuration-first.

### 8. Add a first-run sample workspace

Offer three choices:

- Start with examples.
- Import my lists.
- Start empty.

The sample workspace should show a course, project, goal, purchase, and writing item so the model is understandable within one minute.

## What not to build yet

Avoid diluting the first release with:

- AI categorization before the basic workflow is loved.
- Tags, backlinks, graph views, or complex custom databases.
- A full calendar replacement.
- Team collaboration.
- Gamification and streaks.
- Many competing sync modes.
- A long onboarding tutorial.

The ideal first version feels like **a familiar notes/list app with a smarter home screen**, not like learning a new productivity philosophy.

## Recommended release priorities

1. Ship the Windows/Android local-first foundation.
2. Add Today and universal quick add.
3. Simplify first-run navigation and labels.
4. Improve paste import wording and add a preview.
5. Make sync device-first instead of IP-first.
6. Add Snooze and Not now behavior.
7. Test with 5–10 people who currently split life information across Notes, Notion, WhatsApp, spreadsheets, and memory.

The most meaningful validation metric is not whether users understand the concept. It is whether, after importing real lists, they return three days later without being reminded.

## Product guardrails

- Preserve local-first and offline operation.
- Keep sync opt-in and visibly local-network-only until encrypted transport is available.
- Do not require accounts or cloud storage for the core workflow.
- Keep capture faster than organization.
- Prefer progressive disclosure over a dense command center.
- Treat user data as personal and portable; maintain export and backup paths.
