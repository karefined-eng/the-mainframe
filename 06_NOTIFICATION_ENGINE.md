# The Mainframe — Notification & Reminder Engine (v1)

Source lineage: this document is an audit and augmentation of `NeuroCalendar_SKILL.md` (co-authored by the user with M365 Copilot), adapted from a static text→ICS conversion skill into a live in-app notification engine for The Mainframe. This is the document the build agent should transcribe into actual notification code — not NeuroCalendar itself, which solves a different problem (see Section 1).

---

## 1. Audit: What NeuroCalendar Gets Right, and Why It Can't Be Used As-Is

**What's genuinely good and worth keeping:** NeuroCalendar's core reminder logic already reflects real, sound principles, even without a heavy academic citation apparatus attached to the original file:

- **Prospective-memory support** — the idea that external cues reduce reliance on remembering to remember — is a legitimate, established concept in cognitive psychology (prospective memory is the specific subfield studying "remembering to do something later," as opposed to remembering something that already happened).
- **Reminder purpose progression** (Plan → Start → Review → Prepare → Act) rather than five identical nag messages is good design — it treats each reminder as carrying distinct information, not just repetition.
- **Notification-load controls** — capping alarms per event, refusing to stack alerts within 30 minutes of each other, flagging "high notification density" days — are exactly the right instinct. This matches independent research confirming <cite index="62-1">notification overload correlates with shorter sessions, lower feature adoption, and reduced value over time, and the goal isn't fewer notifications for their own sake but the right ones</cite>.
- **Habituation control** is explicitly named as a design goal, and this is empirically justified: <cite index="61-1">a controlled study on push notifications found that overly frequent alerts led to measurable user fatigue, and — more importantly — that once notifications stopped, the group that had relied on them showed a sharp decline in consistency, suggesting the reminders had created extrinsic dependency rather than durable habit</cite>. This is a real risk worth designing against directly (see Section 4).

**Why it cannot be transcribed directly into Mainframe's notification system:**

1. **Wrong object model.** NeuroCalendar operates on a static text source → one-time `.ics` export. Mainframe's items live in a SQLite database and get edited, re-prioritized, marked done, or have their dates change continuously. A reminder schedule computed once at "export time" goes stale the moment the user edits the item. Mainframe needs reminders computed live off current row state, not baked into a file.
2. **Wrong trigger model.** ICS `VALARM` triggers are relative offsets from a fixed `DTSTART` (`-P7D`, `-PT1H`). Mainframe items often don't have a fixed date at all — `acquisitions` and `build_ideas` in the current schema have no `target_date` requirement, and `status` changes (not just dates) are often the meaningful trigger (e.g., "this build idea has sat in `not_started` for 3 weeks").
3. **Wrong delivery mechanism.** NeuroCalendar's output is consumed by an external calendar app (Google Calendar) whose notification behavior it explicitly cannot control or guarantee — the source file itself warns never to promise that every imported alarm will be retained exactly. Mainframe owns its own UI and, on desktop/Android via Tauri, can own actual native notification delivery — it doesn't need to hand off to a third party and hope.
4. **No fluid-prioritization awareness.** NeuroCalendar has no concept of "this item is currently the user's active focus" vs. "this item is dormant." Mainframe's whole design premise (per `00_PROJECT_BRIEF.md`) is fluid prioritization across parallel domains — the notification engine needs to be aware of that, not just fire fixed T-minus-N-days alerts blind to what the user is actually focused on right now.

**What this document does:** keeps NeuroCalendar's genuinely good reminder-profile logic (the *purpose progression*, the *notification-load caps*, the *habituation controls*) and re-implements it against Mainframe's actual data model — live rows in five domain tables — instead of a static ICS export pipeline.

---

## 2. Core Model: Reminders as Computed State, Not Scheduled Files

Every domain row (`courses`, `acquisitions`, `goals`, `build_ideas`, `ventures`) already has `status`, `target_date` (nullable), and, per the schema addendum, `action_trigger` (nullable). The notification engine's job is to compute, on each app open and on a periodic background check, which rows currently warrant a notification — not to pre-generate a fixed schedule at creation time.

```
For each row where status != 'done':
  compute urgency_score(row)
  if urgency_score crosses a profile threshold since last check:
    emit ONE notification, and
    record last_notified_at + last_notified_score on the row
    so the same threshold never re-fires twice
```

This is a live recompute, not a static alarm list — it naturally handles the case NeuroCalendar can't: the user editing a `target_date`, changing `status`, or adding an `action_trigger` after creation, all just change future compute results with zero extra logic needed.

### 2.1 Urgency scoring (adapted from NeuroCalendar Section 8.4)

Reuse the same additive scoring shape NeuroCalendar already validated, substituting Mainframe's actual fields:

```
importance:        derived from domain (see 2.2) + user-set priority where present (acquisitions.priority)
days_until_target:  null=0, >30=0, 15-30=1, 7-14=2, 3-6=3, 0-2=4, overdue=5
staleness:          days since created_at or updated_at with no status change: <7=0, 7-20=1, 21+=2
has_action_trigger: 0 if null, -1 if present (an item with a concrete if-then plan needs less nagging — see Section 3)

score = importance + days_until_target + staleness + has_action_trigger
```

### 2.2 Per-domain importance defaults

Not every domain deserves equal notification weight by default — this wasn't discussed anywhere in prior docs and needed a decision:

| Domain | Default importance | Rationale |
|---|---|---|
| courses | 1 | Steady progress tracking, rarely a hard deadline |
| acquisitions | 0 (unless priority=high, then 1) | Low-stakes by nature; the `priority` field already lets the user override this per-item |
| goals | 1 | Long-horizon by design; over-notifying long-term goals defeats their purpose |
| build_ideas | 1 | Same reasoning as goals |
| ventures | 2 | Business-relevant, closer to your actual livelihood (Elevon Prospera work) — reasonable default to weight slightly higher, but user-overridable per item later if this proves wrong in practice |

### 2.3 Profile assignment from score (reuses NeuroCalendar's banding, Section 8.4)

| Score | Profile | Behavior |
|---|---|---|
| 0–2 | `dormant` | No proactive notification. Visible only if the user opens that domain. |
| 3–5 | `gentle` | One notification when the item first crosses this band. Purpose-progression language ("worth planning soon"), not urgency language. |
| 6–8 | `active` | Notification on band entry, plus a single follow-up if the item is still in this band after 7 days with no status change (staleness catching up). |
| 9+ | `urgent` | Notification on band entry. This is the only band allowed a same-day repeat, capped at once per 24h, per NeuroCalendar's own "do not create alarms less than 30 minutes apart" instinct extended to a daily cap here since Mainframe has no fixed single event-day the way a calendar entry does. |

---

## 3. Implementation-Intention Integration (ties to `04_RESEARCH_AND_PRIOR_ART.md` Section A3)

This is the one piece that has no NeuroCalendar equivalent at all, because ICS alarms have no concept of a user-authored "when/where/how" plan — and it's arguably the most important addition given the earlier research finding that implementation intentions carry a medium-to-large effect on actually finishing difficult goals.

**Rule:** if a row has a non-null `action_trigger`, the notification for that row should quote it back verbatim rather than generating a generic "this is due soon" message. This is deliberate: research on notification design confirms <cite index="65-1">notifications are inherently distractions by nature, existing to bring attention to something a user might otherwise miss</cite> — the most useful thing a Mainframe notification can do, when the user has already written their own plan, is surface that plan back to them at the right moment rather than invent generic urgency language. This directly operationalizes NeuroCalendar's own "implementation cues" principle (Section 8.1, point 3) — "reminders should state the next useful action, not merely repeat the title" — using the user's own words instead of a template.

Example: a `build_ideas` row with `action_trigger = "after Friday physics lecture, in Antigravity"` should notify, on the relevant day, with that text directly — not a generic "EleViewer packaging bug is due soon."

This also explains why `has_action_trigger` subtracts from the urgency score in 2.1: an item with a concrete plan already attached needs comparatively less anxious nagging, because the psychological literature suggests the hard part (getting started) has already been pre-solved by the act of writing the plan.

---

## 4. Habituation and Dependency Safeguards

Directly addressing the risk surfaced in Section 1 above — the finding that reliance on external reminders can suppress intrinsic habit formation rather than build it:

1. **No profile may notify more than once per 24 hours per row**, even `urgent`. Matches NeuroCalendar's own instinct (max 6 alarms, minimum 30-minute spacing) scaled to a system with no fixed single event day.
2. **Global daily cap**: if the computed notification queue across all five domains would exceed 5 notifications in a single day, only the top 5 by score fire; the rest are silently deferred to the next compute cycle rather than all firing at once. This is a direct implementation of NeuroCalendar's "flag high notification density and reduce low-priority alarms" rule (Section 8.5, point 6), generalized from "one calendar day" to "the whole cross-domain system."
3. **A visible in-dashboard "Notifications" log**, not just fire-and-forget push notifications — so if the user is deep in focused work and dismisses/ignores a notification, the underlying item isn't lost, it's still visible next time they open the app. This avoids the failure mode where a missed notification silently equals a forgotten task.
4. **User-adjustable global density**, mirroring NeuroCalendar Section 8.5 point 8 (`minimal` / `balanced` / `intensive`) — implement as a single app-wide setting that scales the score thresholds in 2.3, not a per-item setting in v1 (keeps it simple; per-item override can come later if the global setting proves too blunt).

---

## 5. Delivery Mechanism (Tauri-specific — has no NeuroCalendar equivalent)

Since Mainframe owns its own app rather than exporting to a third-party calendar, use Tauri's native notification plugin (`tauri-plugin-notification`) for actual OS-level push on both Windows and Android, rather than in-app-only banners. Two things flagged here that weren't addressed anywhere else in the project docs:

- **Android notification permissions**: Android 13+ requires runtime notification permission (`POST_NOTIFICATIONS`) to be explicitly requested, not just declared in the manifest — the agent must prompt for this on first Android launch, or every notification computed by this engine will silently fail to display on-device with no error surfaced to the user.
- **Background compute on Android**: since v1 has no server, the urgency-score recompute described in Section 2 needs to run either on app open, or via a lightweight scheduled background task (Android `WorkManager` equivalent via Tauri, if available in the plugin ecosystem at build time) — flag this to the agent as a known open question rather than a settled decision, since Tauri's Android background-task support may be less mature than its foreground capabilities. If reliable background scheduling isn't readily available, v1 can fall back to "recompute and catch up on every app open" — less ideal, but functionally acceptable for a single-user tool where the user opens the app daily anyway.

---

## 6. Schema Additions Required

Append to `01_DATA_SCHEMA.md`'s common fields (all five domain tables):

| Field | Type | Notes |
|---|---|---|
| last_notified_at | TEXT | nullable, ISO 8601. Timestamp of the most recent notification fired for this row. |
| last_notified_score | INTEGER | nullable. The urgency score at the time of the last notification, so the engine can detect "crossed a new threshold" vs. "same band, don't re-fire." |

New table:

```sql
CREATE TABLE notification_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,        -- 'courses' | 'acquisitions' | 'goals' | 'build_ideas' | 'ventures'
  row_id INTEGER NOT NULL,     -- FK to the relevant domain table, not enforced cross-table in SQLite
  message TEXT NOT NULL,
  fired_at TEXT NOT NULL,      -- ISO 8601
  dismissed BOOLEAN DEFAULT 0
);
```

New app-level setting (single row config table or key-value store, agent's choice):

```
notification_density: 'minimal' | 'balanced' | 'intensive'  -- default 'balanced'
```

## 7. Dashboard Views: What's Hot & Re-entry

Per recent design decisions:
- **What's Hot View**: A single combined dashboard view showing the most urgent items across ALL domains together, powered by the `urgency_score` computed above. 
- **Re-entry Experience**: When the user returns after an extended time away, they will see a blunt, unfiltered view showing exactly how behind they are. The notification engine should NOT try to sugar-coat this or hide overdue items. The discomfort serves as motivation.

---

## 8. What's Explicitly Not Carried Over From NeuroCalendar

Kept out deliberately, since it belongs to a different problem:

- ICS file generation, RFC 5545 syntax, VALARM serialization, line folding — none of this applies; Mainframe never exports a calendar file as its primary notification path. (Section D3 export-to-plain-text remains a separate, already-decided feature — unrelated to this engine.)
- Ambiguity classification for parsed dates (`confirmed`/`inferred_safe`/`ambiguous`/`incomplete`) — this solved a text-extraction problem specific to parsing messy source documents. Mainframe's dates come from direct user entry into structured fields, so this class of ambiguity doesn't arise the same way.
- Google Calendar import instructions — not relevant unless/until the future one-way Calendar mirror (already deferred per `00_PROJECT_BRIEF.md`) is built.
