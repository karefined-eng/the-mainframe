# Brag Plan: The Mainframe

## What is this app?

The Mainframe is a private, local-first life-management app (Tauri v2 + React + Rust + SQLite)
for people whose work, learning, ideas, and goals do not fit in one list — you paste the messy
plain-text lists you already have, each line becomes one row, and a cross-domain "What's Hot"
dashboard surfaces what needs attention with plain-language reasons. No account, no cloud,
no telemetry: the database is a file on your own device.

## The angle

**The anti-hype launch.** Every productivity app ad promises magic: AI that reads your mind,
auto-scheduling, infinite integrations. The Mainframe's actual copy is famously, almost
aggressively honest — it brags about what it *refuses* to do ("the app does not guess which
domain a line belongs to, and it does not invent a due date for you"). The video leans into
that: deadpan, precise, engineered. The joke is that the most impressive feature on offer is
*that it doesn't lie to you*. Landing copy is the source of truth for every line; nothing is
inflated.

## Hook (first 2-3 seconds)

A chaotic wall of unstructured plain text types onto a near-black screen in JetBrains Mono —
the exact mess every viewer recognizes from their own notes app. It holds, then a small mono
caption lands: "You're already keeping these lists." (lifted from the hero headline). No
music sting, no logo first. A quiet observation.

## Key moments (the middle)

- **Paste → rows.** The wall folds into the app's paste panel (the real hero-panel vocabulary:
  1px border, panel bar with tick squares, mono text). A paste action, "11 lines detected",
  then rows materialize one per line — tick square + row title + "raw import text preserved"
  meta. The centerpiece: the product's whole transform in one shot.
- **What's Hot, with reasons.** The dashboard's cross-domain shortlist appears item by item,
  each with its real attention reason string from `src/engine/urgencyScoring.ts`:
  "Overdue by 3 days", "Due this week", "No update in 21 days". Caption: "It tells you why
  each thing surfaced."
- **The refusal list.** Deadpan beat: big sparse off-white statements, one at a time —
  "No account." / "No cloud." / "No telemetry." — snapped to strong beats.

## Outro / punchline

Logo + "THE MAINFRAME" in tracked uppercase (the brand treatment), mono CTA line
"the-mainframe-app.vercel.app" and "Read the source first." (the landing page's actual,
gloriously un-salesy secondary CTA). Ends on the accent dot. Dry logo hit, music fades.

## User flow worth showing

entry → key action → result, all real product behavior:

1. **Entry:** paste a wall of unstructured text into the paste panel; the panel reports the
   detected line count before import.
2. **Key action:** import — each non-empty line becomes one row in the open domain, with the
   original line kept alongside as raw import text. No domain inference, no invented dates.
3. **Result:** the What's Hot dashboard pulls a short cross-domain shortlist and states why
   each entry surfaced (overdue / due this week / stale).

Fictional data note: the wall-of-text lines and dashboard items are plausible fictional
stand-ins (generic personal to-dos); no real personal data. The attention-reason strings and
panel vocabulary are the app's real strings.

## Tone

- Preset: **deadpan**
- Creative direction: an anti-hype product film — a productivity app that refuses to lie to you
- Interpretation: long holds, big empty space, one thought per beat; motion is precise and
  minimal, humor comes from restraint and the product's own honest copy, never from gags.
  4 scenes.

## Format: landscape — 1920x1080
## Duration: 23 seconds — four overlapping scene windows (0–5.7 / 5.3–12.0 / 11.6–17.2 /
16.8–23.0, 0.4s crossfade overlaps). As-rendered timing; see storyboard below.

## Visual identity (from the project)

- Background: `#0E0E10` (near-black; surfaces `#1A1A1D`, alt `#141518`)
- Accent: `#4A9EFF` (electric blue — used sparingly, per the project's "accent use 1 of 3"
  discipline: one accent element per view, never decoration)
- Text: `#F2F2F0` off-white; muted `#B1B3B7`; borders `#1F2024`
- Display font: Inter 700, tight tracking (-0.02em), mixed case
- Body/data font: JetBrains Mono (reserved for code, data, measurement — the video honors
  that: mono = data and captions, Inter = statements)
- Strongest visual element: the hero paste panel (bordered surface, panel bar with tick
  squares, mono wall → clean rows); the What's Hot list with plain-language reasons; the
  rules-not-cards layout discipline (hairline dividers, no chrome)

## Share copy (draft)

"The Mainframe is a local-first life dashboard: paste the messy list you already have, get
one row per line, and a plain-language 'what needs attention' view — no account, no cloud,
no telemetry. Your database is a file on your device, not a row in someone else's service."

## Audio direction

- Role: quiet, precise bed under a dry, engineered film — polished restraint, not energy
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (bundled, 109.96 BPM,
  the deadpan-recommended track) at very low volume (0.12–0.18), fading out under the outro
- Music treatment: start near-zero at 0s and breathe up gently through scene 1; sit low
  throughout; fade to silence across the final 2s
- Music cue guidance: preset read from
  `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.md` —
  strong cues in window at 8.74s, 13.11s, 17.47s, 18.56s, 19.66s. Target the three outro
  statements ("No account." / "No cloud." / "No telemetry.") on strong beats ≈17.47s,
  ≈18.56s, ≈19.66s (±0.15s), logo landing ≈20.75s (beat grid). Sequential row reveals in
  scene 2 may ride the beat grid (~0.55s apart) since rows are short accents and the full
  set holds afterward.
- Audio-reactive treatment: near-threshold subtle — deadpan stillness is the joke, so at
  most the logo/accent dot gains a barely-perceptible glow with RMS; nothing pulses
- SFX posture: sparse; motion-matched; quiet
- Audio-coupled moments: typing ticks under the scene-1 wall (fast, light keyboard), a
  paste "thunk" + one soft tick per materializing row (scene 2), a soft tick per dashboard
  item (scene 3), one dry logo hit at the outro
- Restraint rule: audio must never announce itself — no risers, no whoosh stings, nothing
  upbeat-happy in feel; if a cue draws attention to the sound, it's wrong for deadpan

## Storyboard

### Scene 1 — The wall — 5.7s
Near-black screen. A wall of 10–12 messy, realistic plain-text lines (fictional: "renew
passport", "standing desk — compare prices", "CS50 week 3 problem set", "email landlord
about the leak", "idea: draft stopper but for sound", "mom's birthday gift", …) types in
fast (~1.2s) in JetBrains Mono, muted gray `#B1B3B7`. It holds. A small mono caption fades
in below: "You're already keeping these lists." (Inter would be wrong here — keep it mono,
data-register). The wall is the only thing on screen; lots of empty space.
Sequential/interaction: yes — the wall types character-groups in; caption fades in after.
Audio intent: hushed anticipation; keys under the type-in, then near-silence on the hold.
Audio-coupled idea: light keyboard ticks during the type-in, none after.
Music: quiet bed barely rising.
Transition mood: soft morph → Scene 2 (the wall travels into the panel).

### Scene 2 — Paste becomes rows — 6.7s
The wall folds into the app's paste panel: bordered surface `#1A1A1D`, hairline border
`#1F2024`, panel bar (two tick squares + mono title "PASTE IMPORT", later joined on the
right by the accent status line "11 lines detected"). Mono raw text appears inside, then
fades as rows materialize one per line — tick square (muted; first one accent `#4A9EFF`)
+ row title (Inter, off-white) + right-aligned mono meta "raw text kept". Six rows shown
plus a "+5 more" line. Rows arrive on consecutive beats (7.09 / 7.64 / 8.19 / 8.74 / 9.29 /
9.83), then the full set holds (sequential short-label reveal with a post-sequence hold —
reading floor satisfied by the hold, not the spacing). Captions land in two stages below
the panel: "One line. One row." then "Nothing else inferred."
Sequential/interaction: yes — paste action simulated, then rows appear one by one.
Audio intent: the product starts doing the quiet work; soft, precise ticks.
Audio-coupled idea: paste click, one soft drop per row.
Music: low bed, steady.
Transition mood: clean crossfade → Scene 3.

### Scene 3 — What needs attention — 5.6s
The What's Hot dashboard: header "WHAT'S HOT" (mono, uppercase, tracked) over a hairline
rule, and three items appearing one by one (every other beat: 12.55 / 13.64 / 14.73), each
held: item title (Inter, off-white) + right-aligned mono domain tag (ACQUISITIONS /
STUDIES / GOALS) over a mono reason in accent blue — "Overdue by 3 days", "Due this week",
"No update in 21 days" (the app's real reason strings). Caption after the set: "Says why
each thing surfaced." Hairline dividers between items; no card chrome.
Sequential/interaction: yes — three dashboard items arrive one by one and hold as a set.
Audio intent: quiet comprehension; three soft ticks, then rest.
Audio-coupled idea: one soft tick per item arrival.
Music: low bed.
Transition mood: slow crossfade → Scene 4.

### Scene 4 — The refusal list / outro — 6.2s
Big sparse Inter statements on pure background, one at a time, snapped to strong beats
(17.47s / 18.56s / 19.66s, each ~0.8–1s settled): "No account." → "No cloud." → "No
telemetry." Each line replaces the last (fast in, held long enough — 2-word labels, 0.8s
floor met). Then the logo lockup at 20.75s (beat grid): the real logo mark (three rounded
dashboard rows, middle one accented) + "THE MAINFRAME" in tracked uppercase, mono lines
"the-mainframe-app.vercel.app" and "Read the source first." Holds; music fades out.
Sequential/interaction: yes — three statements land one per strong beat.
Audio intent: dry, flat, final; then one dry logo hit and silence.
Audio-coupled idea: beat-snapped text entrances, dry soft-impact logo hit.
Music: fades to silence across the last ~2.2s.
Transition mood: end — long hold on the lockup.

**Music mood for this video:** deadpan (bundled track used as a barely-there bed)
**Audio summary:** a quiet, low-mixed beat bed with sparse motion-matched ticks and one dry
logo hit, fading to silence before the end.
