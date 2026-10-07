# Handoff: two launch videos from /brag (2026-10-07)

Session span: one sitting. Two finished launch films for the repo, produced
with the `/brag` and `/brag-slim` skills (Hyperframes), then saved to the
`brag-videos` branch. Written so the next agent can re-render, re-cut, or
extend either video without re-deriving anything.

## Where the deliverables live

Both films are **not on main** — they are committed on the `brag-videos`
branch (commit `6641a81`, based on `public-landing-page` at `0008f65`),
because ~16 MB of video/audio assets do not belong in the mainline tree:

- `brag-output/` — film 1, **the app** (23 s, 1920×1080): a wall of messy
  text is pasted, becomes one row per line ("Nothing else inferred."), the
  What's Hot dashboard explains why each item surfaced (real strings from
  `src/engine/urgencyScoring.ts`), and the refusal list lands as the
  punchline: "No account. / No cloud. / No telemetry."
- `brag-output-2026-10-07-150801/` — film 2, **the landing page** (20.5 s):
  "most landing pages oversell." → hard cut to the page's real section
  "What it will not do, and what you should know", then the page's own
  headings as kinetic type, ending on "Read the code / before you trust it."
  and the status pill "Early public release · no versioned releases yet."

Each directory is self-documented: `brag-plan.md` (storyboard, synced to the
final edit), poster (`brag.jpg`, also baked as frame 0 of `brag.mp4` so every
platform's idle thumbnail shows it), `share-copy.txt`, and the complete
Hyperframes composition (`composition/` or `work/composition/`) with local
fonts/music/SFX — no CDN dependencies, fully re-renderable offline.

## How to re-render either film

```bash
git checkout brag-videos
cd <film-dir>/composition        # or work/composition for film 2
npx hyperframes check            # the pre-render gate (0 errors required)
npx hyperframes render --quality delivery --output ../../brag.mp4
```

Then re-pick the poster (ffmpeg `-ss <settled-beat>` to `brag.jpg`) and bake
it as frame 0 (overlay filter with `enable='eq(n,0)'`, `-c:a copy`). Film 2's
page slices came from `npx hyperframes capture http://localhost:1420/#/welcome`
with the Vite dev server running — the capture ran at a 1920×1080 viewport, so
its screenshots drop straight into a 1080p composition full-bleed.

## Creative laws that made these work (keep for film 3)

- **Deadpan is the house voice.** Both films sell by refusing to: the copy is
  the repo's own, including its disclaimers. Never inflate a claim for the
  video; the honesty IS the angle (`src/landing/content.ts` enforces this for
  the page — the videos inherit it).
- **Hard cuts between busy layouts, crossfades between quiet ones.** A 0.2 s
  crossfade from kinetic type onto a full-bleed page screenshot produced a
  muddy double exposure; switching that one transition to a hard cut fixed it.
- **Text at video scale.** Web sizes (13–17 px) are invisible at 1080p; the
  smallest on-screen text in either film is 24 px, statements run 76–120 px.
- **Reading floors:** a short label holds ~0.8 s settled; a sentence ~0.3 s
  per word. Beat-snapped reveals only when the full set then holds on screen.
- **Beat locks are a budget:** at most 3 strong-cue locks per film (film 2
  spends all three on the closing trio 17.47 / 18.56 / 19.66).

## Environment traps hit (2026-10-07, Windows)

- **`*:visual-judge` subagents cannot launch here** — any spawn fails with
  `Provider unavailable / provider-not-found` for the subagent model even
  though the session model works. Inspect rendered frames yourself with the
  Read tool instead.
- **`npx hyperframes init` skills probe:** use `HYPERFRAMES_SKIP_SKILLS=1 ...
  init --non-interactive` for the quiet path. The hyperframes domain skills
  are not preinstalled; `npx hyperframes skills update` installs them to
  `~/.agents/skills/`, and `npx hyperframes docs <topic>` is the fallback.
- **Seek-safe GSAP rules that `check` enforces:** never tween `display`/
  `visibility`/`autoAlpha` on a `.clip` element (animate an inner wrapper);
  every later `fromTo` on the same element/property needs
  `immediateRender: false`; every `<audio>` needs an `id`; named fonts need
  in-file `@font-face` to a shipped file.
- **SFX durations:** `check` warns when a clip's `data-duration` exceeds the
  media's real length — set exact values (drops are 0.11/0.19 s, the dry logo
  hit 0.12 s).

## Known divergence (for whoever merges next)

`main` still has the old docs layout (`docs/LANDING_PAGE_PLAN.md`,
`docs/RESEARCH_ADOPTION_PLAN.md`, root `origin.md`). The restructured docs
(`docs/AGENTS.md` manual, `docs/origin.md`, `docs/handoff/`, `docs/research/`)
live on `public-landing-page` and are included in `brag-videos`. This file is
written to stand alone so it works in either layout. The project's own manual
(`docs/AGENTS.md` on those branches) has the same traps under "Environment
traps (project-specific)".
