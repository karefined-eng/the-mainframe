# Hyperframes Composition Brief: The Mainframe

## Objective
Create a short launch-style brag video for The Mainframe — a deadpan, anti-hype product film.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 22 seconds

## Source Material
- Project root: `C:\Users\asamoah\the-mainframe`
- Primary files read: `src/landing/content.ts`, `src/landing/LandingPage.tsx`,
  `src/landing/landing.css`, `src/index.css` (design tokens), `README.md`,
  `src/engine/urgencyScoring.ts`, `public/logo.svg`
- Product name: The Mainframe
- Tagline / strongest claim: "A local-first home for every list you are already keeping."
- Key UI or visual moment to recreate: the hero paste panel (raw mono wall of text →
  one row per line, tick squares, "raw text kept" meta) and the What's Hot list with
  plain-language attention reasons
- Copy that must appear verbatim (all grounded in the repo):
  - "You're already keeping these lists." (adapted from the hero headline "A local-first
    home for every list you are already keeping.")
  - "11 lines detected" (the paste panel reports detected line count before import —
    behavior from src/components/PasteIngest.tsx)
  - "raw text kept" (the walkthrough states the original line is kept alongside each row)
  - "One line. One row. Nothing else inferred." (grounded: "one row per non-empty line …
    no domain inference, no date extraction, no status inference")
  - "Overdue by 3 days" / "Due this week" / "No update in 21 days" (real strings from
    src/engine/urgencyScoring.ts)
  - "It tells you why each thing surfaced." (grounded in walkthrough step 03)
  - "No account." / "No cloud." / "No telemetry." (grounded in the guarantees section:
    "No required account or cloud service", "no telemetry service in the loop")
  - "THE MAINFRAME" (brand treatment), "the-mainframe-app.vercel.app" (live URL),
    "Read the source first." (the landing page's actual secondary CTA)
- Fictional stand-ins: the wall-of-text lines and dashboard item titles are plausible
  fictional personal to-dos ("renew passport", "standing desk — compare prices",
  "CS50 week 3 problem set", "email landlord about the leak", "mom's birthday gift",
  "draft stopper but for sound", …). No real personal data.

## Creative Direction
- Tone preset: deadpan
- Creative direction: an anti-hype product film — a productivity app that refuses to lie to you
- Interpretation: long holds, big empty space, one thought per beat; motion is precise and
  minimal; humor comes from restraint and the product's own honest copy, never from gags.
  4 scenes, slow crossfades, generous negative space.
- Angle: every productivity ad promises magic; The Mainframe's most impressive feature is
  that it doesn't lie to you. The video shows the whole product honestly — paste, rows,
  plain-language attention reasons — and lets the refusal list be the punchline.
- Hook: a chaotic wall of unstructured plain text types onto a near-black screen, holds,
  then a small mono caption: "You're already keeping these lists."
- Outro / punchline: "No account." / "No cloud." / "No telemetry." on strong beats, then
  logo + THE MAINFRAME + "the-mainframe-app.vercel.app" + "Read the source first."
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Risers, whoosh stings, or anything that announces the audio

## Visual Identity
- Background: `#0E0E10` (surfaces `#1A1A1D`, alt `#141518`)
- Text: `#F2F2F0` off-white; muted `#B1B3B7`; borders `#1F2024`
- Accent: `#4A9EFF` — used sparingly, one accent element per view (the project's own
  "accent use 1 of 3" discipline)
- Display font: Inter (700 for statements, tight tracking); local woff2 files are provided
  from the project's own `@fontsource` packages in `assets/fonts/` — use @font-face, no CDN
- Body/data font: JetBrains Mono (mono = data and captions; Inter = statements)
- Visual references from the project: the hero paste panel (bordered surface, panel bar
  with two tick squares, mono content), rows with tick squares + right-aligned mono meta,
  hairline divider rules instead of card chrome, the What's Hot list, and the logo mark
  (three rounded dashboard rows, middle one accented) — provided at `assets/logo.svg`

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The wall — 5.5s — messy mono text wall types in fast (~1.2s), holds; mono caption
   "You're already keeping these lists." fades in below.
2. Paste becomes rows — 5.5s — the wall folds into the paste panel; "11 lines detected";
   rows materialize one per line (beat grid), full set holds; caption "One line. One row.
   Nothing else inferred."
3. What needs attention — 5.5s — WHAT'S HOT header; three items arrive one by one (every
   other beat), each with its real mono reason in accent; caption "It tells you why each
   thing surfaced."
4. The refusal list / outro — 5.5s — "No account." / "No cloud." / "No telemetry." land on
   strong beats ≈17.47 / ≈18.56 / ≈19.66; logo + THE MAINFRAME + URL + "Read the source
   first." land ≈20.75; hold to 22s.

Beat/cue source: `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`
(109.96 BPM; strong cues in window at 8.74, 13.11, 17.47, 18.56, 19.66). Mark beat-locked
and beat-grid timings as comments in the composition.

## Audio
- Audio role: quiet, precise bed under a dry, engineered film — sparse professional accents
- Audio arc: near-silent start → low bed under scenes 1–3 with motion-matched soft ticks →
  statements land silently on strong beats → one dry logo hit → music fades to silence
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (copied
  locally; deadpan-recommended track)
- Music treatment: data-volume 0.12–0.18, gentle fade-in (~1.5s), fade-out (~2s) ending in
  silence by 22s
- Music cue guidance: bundled preset JSON (path above). 1–3 strong-cue locks: the three
  outro statements at ≈17.47 / ≈18.56 / ≈19.66 (±0.15s); logo at ≈20.75 (beat grid).
  Sequential row reveals in scene 2 may snap to consecutive beats (~0.55s apart) — rows are
  short labels and the full set holds afterward. Scene 3 items snap to every other beat.
  Restraint: cues are rare and quiet; if a snap hurts readability, use natural timing.
- Audio-reactive treatment: near-threshold subtle at most (logo/accent-dot glow with RMS);
  however, the `hyperframes-creative` skill and its extraction helper are not installed in
  this environment, so audio-reactive extraction is unavailable — skip it and keep the
  stillness. Documented per the brief requirement; do not block the render on it.
- Audio-coupled moments:
  - Scene 1 wall type-in — light randomized keyboard keypress ticks (assets/sfx/keyboard/),
    low volume; silence on the hold
  - Scene 2 paste action — one click cue (ui or interface click family)
  - Scene 2 row materialization — one soft drop cue per row (interface/drop family)
  - Scene 3 item arrivals — one soft selection tick per item (interface/select family)
  - Scene 4 logo landing — one dry soft-impact hit (impactSoft_medium family); no hit on
    the three statements — their silence is the joke
- SFX selection guidance: read `C:\Users\asamoah\.zcode\cli\plugins\cache\brag\brag\0.4.0\skills\brag\assets\sfx\sfx-analysis.md`
  and prefer low high-frequency-risk files; deadpan = very sparse, quiet (SFX volume
  ~0.35–0.55), coherent palette
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume
  based on the implemented animation. Copy chosen files into `assets/sfx/`.
- Audio files: copy the music into `assets/music/` and chosen SFX into `assets/sfx/` before
  rendering; reference all audio with relative paths from the composition directory.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core`,
`hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`.
They are not installed in this environment; use `npx hyperframes docs <topic>`
(data-attributes, compositions, rendering, gsap, troubleshooting) as the authoritative
contract instead. /brag is its own workflow: do not enter the `hyperframes` entry-point
intent interview and do not route into its generic promo / launch-video workflow. Prefer
native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project (the paste
  panel + rows and the What's Hot list are the showpieces).
- Keep all text readable in the final render; honor reading-time floors (short label
  ~0.8s settled; sentence ~0.3s/word) — sequential text reveals hold the full set afterward.
- Keep the video within 15-25 seconds (22s target).
- Include the planned music/SFX layer.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual
  animation exists.
- Treat music cue metadata as optional timing hints; ignore cues that hurt readability,
  scene pacing, or the product story.
- Major reveals may move toward nearby strong cues within about 0.15s. Smaller entrances may
  align to nearby beat points within about 0.10s. Use only 1-3 strong cue locks.
- Honor the planned music treatment (fade-in, low volume, fade-out to silence).
- Audio-reactive extraction is unavailable (see above) — skip it, keep the stillness.
- Use local assets for audio and fonts (provided under `assets/`); no CDN dependencies.
- Run `npx hyperframes check` before render — it is brag's single gate; fix every error
  including WCAG contrast failures.
- Keep creation and rendering local. Remote or publishing workflows require a separate
  explicit user request.
