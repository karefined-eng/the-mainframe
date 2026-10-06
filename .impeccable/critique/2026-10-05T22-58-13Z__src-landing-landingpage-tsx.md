---
target_identity: "file:C:\\Users\\asamoah\\the-mainframe\\src\\landing\\LandingPage.tsx"
target_fingerprint: "sha256:71392037536112c5b06234ff314042e4954e1c3650b445aa5b8c91a0528af67f"
target_path: "C:\\Users\\asamoah\\the-mainframe\\src\\landing\\LandingPage.tsx"
timestamp: 2026-10-05T22-58-13Z
slug: src-landing-landingpage-tsx
---
# Persuade Surface Design Review — run 6a76dbac participant 0

Evidence gathered. One grounding note before the verdict: I verified the app's real ingest and urgency behavior against the page's claims, and found the hero's illustrative panel depicts capabilities that do not exist in `src/components/PasteIngest.tsx`, `src/engine/dashboardModel.ts`, or `src/engine/urgencyScoring.ts` — that drives the top-ranked issue below.

---

# Assessment A — Unanchored Design Review: "The Mainframe" landing page

**Surface:** Persuade (`/welcome`) · **Sources:** `src/landing/LandingPage.tsx`, `src/landing/content.ts`, `src/landing/landing.css`, `src/landing/metadata.ts`, `prototypes/V2 The-Mainframe-Landing.html`, `docs/LANDING_PAGE_PLAN.md` · **No detector run.**

---

## 1. DESIGN SPECIFICITY VERDICT

**Split verdict: the copy architecture is authored for this product; the visual language and identity are not.**

**What is genuinely product-specific:** the domain vocabulary (certifications, build ideas, acquisitions, goals, ventures, writing, skills, experiences), the raw-paste → structured-row transform as the hero demonstration, the four-step loop, and the decision to give "Limitations" its own top-level nav slot. Nobody else's page says *"The parts most landing pages leave out."* That is authored.

**What is swappable without a single edit:** the palette (near-black `#0e0e10`, off-white `#f2f2f0`, one electric blue `#4a9eff`), Inter + JetBrains Mono, the sticky blurred header with a bordered GitHub chip, `clamp()` display headings with `text-wrap: balance`, the ruled-grid section rhythm, and the 45–55px hero with a bordered demo card on the right. Swap the logo and headline and this is Linear, Resend, Turso, Plane, or Cal.com. The brand mark — three stacked rounded bars — is a generic "layers" glyph with no relationship to a life-management ledger. The headline *"Your calm command center for everything you're learning, building, pursuing, and acquiring"* is pure category boilerplate; "calm" is the most-used adjective in this sector and "command center" appears in dozens of dashboard products. The panel's three-tick window chrome is the macOS traffic-light trope — mildly off-key for a Windows/Android-first product.

**The deeper specificity problem is process, not taste.** `src/landing/landing.css` documents itself as a compliance log — "Revised against Impeccable's craft floor," followed by a numbered list of things it *doesn't* do (no eyebrows, no card soup, no nested cards, no gradient text, no offset shadows, no emoji) and an "intentional exceptions" appendix. A page defined by its bans has no positive identity. This shows up concretely: the hero panel is the only place where the design tries to *be* the product — and, per §6 below, it's the one place that lies about it.

**Missing product-specific character, ranked:**
1. The ledger/register idea is present (ruled rows, `lp-mono` numerals, tabular-nums) but never becomes the page's organizing metaphor — it's decoration on generic sections, not the spine.
2. "Offline" and "local" are claimed in prose and marked with a decorative lock badge, but never *shown* as a property of a system (no device diagram, no "your data never leaves this line" visual, no byte-level proof). This is the product's single most distinctive attribute and it has no visual treatment at all.
3. LAN pairing — the one interaction nobody else has — appears only as a text description inside an "Asset pending" placeholder.

---

## 2. NIELSEN HEURISTICS

| # | Heuristic | Score | Reasoning (evidence) |
|---|---|---|---|
| 1 | Visibility of system status | **3** | Best-in-class status disclosure for a pre-release page: the hero pill "Early public release · no versioned releases yet," the 5-row platform table with `Build target` / `Not configured` tags, and "Links to runs are not published here on purpose." Loses a point because the primary CTA (`href={ACTIONS_URL}`, `data-od-id="cta-download"`) gives the visitor no signal that it opens an empty-by-default CI list in a new tab. |
| 2 | Match between system and real world | **2** | Two hits. (a) The hero panel is the most-viewed object on the page and depicts a system that does not exist: `cert: AWS SAA - book exam slot` → domain "Certifications" (inference), `goal: run 10k under 50 min` → "Jun 02" (date extraction), "watching" (a status not in `Status = "not_started" \| "in_progress" \| "done" \| "paused"`), and "3 sessions behind schedule" (no session concept anywhere). (b) Domain nouns are excellent, but the limitations copy leaks implementation language at the widest audience: "bounded snapshot of up to 64 MiB," "atomically replaces the target," "cleartext," "port 9377 (discovery on 9378)," "notarization," "keystore material." |
| 3 | User control and freedom | **3** | Real skip link (`.lp-skip`), anchor nav, "Back to top," no dead ends, no modal traps. External links correctly `target="_blank" rel="noreferrer noopener"`. Nothing forces a branch. |
| 4 | Consistency and standards | **4** | The genuinely excellent dimension. One token set, one CTA style, one voice — and the voice never breaks: every single claim on the page is hedged to the same standard ("build target, not a tested release"), including in the footer. Semantic HTML holds (`aria-labelledby` per section, `<caption>` + `scope="col"` on the table, `aria-hidden` on decorative icons and the `BrandMark`). |
| 5 | Error prevention | **3** | The page prevents the *expectation* error repeatedly — "CI artifacts are not release downloads," "desktop builds are unsigned," "Do not attach database files... Sanitize screenshots first," "If pairing fails, start over rather than reusing a token." Deducted for the one error it does not prevent: a button labeled **"Download the latest build"** that leads to a list of workflow runs. The caveat exists *after* the button, not in it. |
| 6 | Recognition rather than recall | **2** | The strongest single finding in this review. There is **no product image anywhere on the page.** Four walkthrough steps each render `<figcaption>Asset pending: {name}</figcaption>` plus a redaction rule and a `docs/LANDING_PAGE_PLAN.md` reference. The hero panel is `aria-hidden="true"` on `.lp-panel-body`, so it is not a demonstration for assistive tech either. The visitor must *construct* the product from prose. Recognition is at zero precisely where a Persuade surface must deliver it. |
| 7 | Flexibility and efficiency | **n/a** | Persuade surface: there is no user workflow to accelerate, no shortcuts or customization to evaluate. |
| 8 | Aesthetic and minimalist design | **3** | High craft floor: ruled structure instead of card soup, exactly one card on the page, `prefers-reduced-motion` kill switch, themed selection/caret/scrollbar, real `:focus-visible` outlines. Two costs: (a) near-uniform 13.5px body text with long measures (70–78ch) makes the middle of the page read as a document, not a landing page; (b) the accent is no longer used sparingly — despite `/* Accent use 1 of 3 */` and `/* Accent use 2 of 3 */` comments, the rendered DOM shows ~14 accent elements (3 buttons, 4 step numerals, 4 "Build target" pills, status dot, 2 panel ticks, plus hovers). The accent no longer marks the action. |
| 9 | Help users recognize, diagnose, recover | **3** | Above average for a static page. "How to get a build: open the Actions tab, pick a *successful* run... download the artifact for your platform" is real recovery guidance; so is the backup-before-replace instruction. Deducted because the errors most likely to occur are unaddressed: no "what to do if you see the unsigned-publisher warning," no checksum or provenance path for a binary downloaded from a CI artifact. |
| 10 | Help and documentation | **n/a** | Persuade surface: the product's documentation is a destination (the repo), not a surface this page is scored on. |

**Total: 23 / 32 (72%)** — 8 applicable heuristics, 2 scored n/a.

Profile: internally consistent and status-transparent, but weak exactly where a Persuade surface must be strong — it shows the visitor nothing real to recognize, and its most prominent visual depicts a system that isn't the one shipping.

---

## 3. COGNITIVE LOAD

**Chunk count is within budget at the section level but breaks at the two decision points that matter.**

- **First viewport (the actual decision point):** desktop shows a sticky header (**brand + 5 nav links + GitHub chip = 7 targets**) above **2 hero CTAs**, plus a 4-sentence bolded "Read this first" caveat paragraph, plus a 3-block illustrative panel containing **11 discrete data elements** (5 raw lines, 4 parsed rows, 2 hot items). That is well past 7 chunks, and past the >4-options threshold: **9 interactive targets in the first viewport.**
- **The hierarchy bug that makes it worse:** the secondary action **"View the source on GitHub"** appears **twice** above the fold (header chip + hero ghost button) while the primary action appears **once**. Both hero buttons share `min-height: 46px`, `font-size: 15px`, `font-weight: 600`, `padding: 0 20px` — they differ only in fill and border. The duplicated button is also the only one that works today. The visitor's eye is being pulled to the fallback.
- **Nav chunks:** 5 labels (`Why`, `How it works`, `Features`, `Platforms`, `Limitations`) — within budget, but "Limitations" in the primary nav is a pre-emptive risk chunk competing with the value proposition.
- **Below the fold:** the platforms table is a 3-column × 5-row matrix where every cell in column 3 is a tag plus a qualifying sentence, and the trust grid is 7 items each with a title, an amber icon, and a body paragraph — 21 chunks in one section. This is the section most likely to be skimmed, and it is the page's entire credibility payload.

**Flag:** first viewport, 9 interactive targets, >4 options at the decision point, with the primary and secondary visually indistinguishable.

---

## 4. EMOTIONAL JOURNEY

**Peak (strong):** the entry. Dark, calm, generous space, a confident headline, and a panel that shows a satisfying raw → structured transform. For about four seconds the page delivers exactly the feeling the product promises.

**Valley 1 — immediate brake, same fold.** Directly under the primary button sits a bolded four-sentence disclaimer ("there are no versioned public releases yet... CI artifacts are not release downloads... Android ships a signed release APK or an unsigned debug APK; desktop builds are unsigned until platform signing is configured"). Desire and alarm are delivered simultaneously. A visitor who was reaching for the button now reads a paragraph. The same facts are restated twice more (the platforms `lp-download-note`, the table caption and status column) — three restatements of the same anxiety signal reads as the page arguing with itself.

**Valley 2 — defending a claim nobody made.** The `lp-note` block in the "Why" section opens "**What this is not.** The Mainframe is not a medical or therapeutic product and makes no claim about treating any condition." This is the plan's ethical constraint rendered as *visible marketing copy*, and it lands before any desire has been built. Worse: for the reader who actually has ADHD and is looking for this exact product, the sentence introduces the possibility and then denies it — a net-negative interaction. It also sits above the walkthrough, i.e., in the space where excitement should be compounding.

**Valley 3 — the page shows you its own to-do list.** The four walkthrough steps each end with `Asset pending: List ingestion` / `Parsed items in a domain` / `Cross-domain attention view` / `LAN sync pairing`, followed by "Capture from sample data only. Never include a real database, a pairing code, a LAN address, or keystore material. See `docs/LANDING_PAGE_PLAN.md`." A public visitor is being shown the marketing page's unfinished checklist and a path to an internal planning document. This is the lowest point on the page and the single largest missed opportunity: the plan explicitly says the page must "demonstrate something only this product can prove," and this is the section where nothing is demonstrated.

**Valley 4 — cumulative deficit at the platform table.** Five rows, every one `Build target` or `Not configured`, one accent-tinted pill repeated four times. By the end of this section the visitor has absorbed: no release, no signing, no store, no iOS, no tested platform. That's a lot of "no" before the trust section has had a chance to reframe it as integrity.

**Trust section — alarm-shaped reassurance.** Seven consecutive items, each led by an amber `AlertTriangle`. So "**No required account or cloud service**" and "**Data is local to each device by default**" — the two strongest positive guarantees in the entire product — render in the same hazard register as "**The current LAN transport is cleartext**." The section's concept is excellent; its visual treatment argues against its own content.

**End (good copy, empty payoff).** "Try it on one list you already have... If it does not, that is useful feedback too" is the best-written moment on the page — it converts evaluation into a small reversible experiment and explicitly de-risks failure. But it closes with **"Download the latest build"** pointing at the Actions tab, so the last action available repeats the page's only empty promise. Peak-end: strong start, decent verbal ending, and a final action that cannot be completed.

**Reassurance at high-stakes moment 1 — putting real life data in the app: handled well.** Local DB, no account, no telemetry, backup warning, pairing token expiry, cleartext warning. This is genuinely careful.

**Reassurance at high-stakes moment 2 — running an unsigned binary from a CI artifact: absent.** The page tells the visitor the build is unsigned and *will* trigger an OS warning, then offers no next step: no checksum, no "verify the artifact came from this workflow," no build-provenance link, no "here's what that warning looks like and why it's expected." For a page whose closing section is titled **"Read the code before you trust it,"** instructing a reader to execute an unverified unsigned binary is the sharpest unresolved tension on the page.

---

## 5. STRENGTHS

1. **The limitations section exists, is named in the primary nav, and refuses to hedge into vagueness.** `content.ts` states things competitors would never print: "A snapshot transfer replaces the target database. Export a backup first if the device holds anything you have not duplicated elsewhere," and "Use HTTP on the local network, restricted to private addresses on port 9377 (discovery on 9378). Do not expose it to the public internet." These are *operational* sentences with consequences, not legal boilerplate. The section title — "The parts most landing pages leave out" — is the page's actual differentiator, and it is correctly placed above the fold of the information hierarchy rather than in the footer.

2. **Craft discipline that is measurably above the v0-landing-page norm.** Documented in `src/landing/landing.css`: a ruled grid instead of repeated same-size icon+heading+text cards (a real and rare restraint), exactly one bordered surface on the whole page, one authored motion moment (`lp-rise`, 620ms, staggered 0/90/180ms) fully disabled under `prefers-reduced-motion`, themed `::selection` / caret / scrollbar instead of vendor defaults, real `:focus-visible` outlines at 2px with 2px offset, skip link, `aria-hidden` on decorative marks, and a `<caption>` on the status table. The visual result is calm and legible, and it does not look like a template — it looks like a discipline.

3. **The closing CTA copy.** "Try it on one list you already have. Copy the messiest list you are currently carrying around, paste it in, and see whether the structure it produces matches how you actually think about the work. If it does not, that is useful feedback too." This is the correct closing move for a pre-release product: it asks for a 30-second, fully reversible experiment instead of a commitment, and it explicitly pre-authorizes failure. Paired with the `contribute` section's "Ideas and limitations are equally welcome," it makes an early-stage product feel confident rather than needy.

---

## 6. PRIORITY ISSUES (ranked by impact)

### P0 — The hero panel demonstrates capabilities the product does not have

**Problem.** `LandingPage.tsx` renders `rawPasteSample` → `parsedSample` → `hotSample` as the page's only product depiction. The real ingest path, `src/components/PasteIngest.tsx`, does exactly this:

```ts
const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
for (const line of lines) {
  await db.execute(
    `INSERT OR IGNORE INTO ${domain} (title, raw_import_text) VALUES ($1, $2)`,
    [line, line],
  );
}
```

No prefix parsing, no domain inference, no date extraction, no status inference, no session tracking. The panel claims all five:

| Panel shows | Reality |
|---|---|
| `cert: AWS SAA - book exam slot` → title "AWS SAA", domain "Certifications" | Title would be the literal line `cert: AWS SAA - book exam slot`; the row goes into whichever domain the user already had open |
| `goal: run 10k under 50 min` → "Jun 02" | No date exists in the input; `target_date` is not written by the insert |
| `27" 4K monitor` → status "watching" | `Status = "not_started" \| "in_progress" \| "done" \| "paused"` — "watching" is not a value |
| "AWS SAA study block — **3 sessions behind schedule**" | `getUrgencyReasons()` can only emit: "Overdue by N days," "Due today," "Due in N days," "Due this week," "Due within two weeks," "Due within 30 days," "No update in N days," "Also marked in progress," "High priority," "Included by the current urgency profile." There is no session or schedule model anywhere in the codebase. |

The `aria-hidden` panel and the "Illustrative sample data, not a recorded session" disclosure do not repair this — illustrative data may be *fictional*, but it may not assert a *capability*. This is the exact failure mode the file headers and `docs/LANDING_PAGE_PLAN.md` were written to prevent, occurring in the single most-viewed element on the page. It also has a secondary effect: the skeptical developer the page is aimed at will check, discover the fake, and discount every honest claim the page makes — including the truthful ones.

**Why it matters.** The page's entire persuasion strategy *is* factual discipline. The hero panel is the only place where the page can outperform competitors, and it is currently the only place where the page's credibility collapses on inspection.

**Fix.** Rebuild the panel from output the engine can actually produce, and keep the visual design unchanged. Concretely: open on a domain list labeled "Certifications"; show four pasted lines verbatim (`AWS SAA - book exam slot`, `LAN snapshot diff viewer`, `27" 4K monitor`, `Run 10k under 50 min`); show them as rows with title in verbatim form, status `Not started`, meta `no date`; and make the What's Hot entries use real reason strings from `getUrgencyReasons()` — e.g. "LAN snapshot diff viewer — *No update in 21 days*" and "AWS SAA — *Due this week*". This is *more* compelling, not less: it shows a real product being honestly mediocre at guessing, which is precisely the anti-magic promise the rest of the copy makes. Fix the walkthrough step 02 copy at the same time — "Each pasted line becomes an item with a status, an optional target date, and the original text preserved alongside it" reads as if the paste produces a target date, and the insert writes only `title` and `raw_import_text`.

---

### P0 — "Download the latest build" labels a destination that cannot download anything, and the fallback action is duplicated

**Problem.** All three primary CTAs (`data-od-id="cta-download"`, `cta-actions`, and the closing band) carry the label **"Download the latest build"** and point at `ACTIONS_URL` — the GitHub Actions tab, which on load shows a list of workflow runs, not releases. The plan's own acceptance criterion reads: *"The primary CTA reaches a working artifact or clearly says that builds are not yet published."* The page satisfies the second clause in prose and violates the first in its button label. Meanwhile the secondary — **"View the source on GitHub"** — is rendered twice above the fold (header `.lp-header-cta` chip with `margin-left: auto`, and the hero `.lp-btn--ghost`) at identical type size, weight, height, and padding to the primary. The page's most-repeated, most-available action is the one that isn't the offer.

**Why it matters.** For a Persuade surface, the primary action must be both the most prominent and the most reliably satisfiable. Right now the most prominent action is the least satisfiable, and the visitor who clicks in good faith lands on a developer tool they may not read.

**Fix.** Two changes, both small. (a) Relabel to something a click can honor: **"Get a build from CI"** (with the `ExternalLink` icon already present) or **"See build artifacts,"** and cut the hero caveat from four sentences to one — "No versioned releases yet — builds live as CI artifacts" — moving the rest into the platforms section where it belongs. (b) Demote or remove the header GitHub chip, and restyle the hero secondary to a lower-emphasis text link so the primary is unique and unambiguous above the fold. When a release eventually exists, "Download the latest build" becomes legitimate and should be restored.

---

### P1 — The page demonstrates nothing, and shows the visitor its own unfinished work

**Problem.** All four walkthrough steps in `LandingPage.tsx` render `<ScreenshotSlot>`, producing four consecutive `figcaption`s reading "Asset pending: List ingestion," "Asset pending: Parsed items in a domain," "Asset pending: Cross-domain attention view," "Asset pending: LAN sync pairing" — each followed by an alt-text sentence and then the internal production rule with a path into `docs/LANDING_PAGE_PLAN.md`. The hero panel — the only thing resembling a product visual — is `aria-hidden="true"`. Combined with `metadata.ts` pointing `og:image` at a URL that can't resolve (see P1 below), the result is a landing page for a graphical desktop **and Android application** that contains **zero images**.

**Why it matters.** Two audiences are lost at once. A visual visitor cannot evaluate a product they cannot see and cannot picture what "paste a list" produces. And a non-visual user gets no demonstration at all. Meanwhile the "Asset pending" notices tell every visitor that the page is unfinished — an internal status that should never be public.

**Fix.** In priority order: (1) capture the four screenshots from sanitized sample data — the plan already defines exactly which four, and the redaction rule ("never include a real database, a pairing code, a LAN address, or keystore material") is already written; (2) if captures are genuinely blocked, replace each slot with a small **real DOM vignette built from the app's own components** — the hero panel already proves the page can do this credibly, and a real 3-row table from a real domain beats a screenshot claim; (3) under no circumstances keep the `docs/LANDING_PAGE_PLAN.md` reference in public copy — the redaction rule belongs in the plan, not the marketing surface. If a placeholder must ship, it should read "Screenshot coming with the first release" and nothing more.

---

### P1 — The share preview is broken, so the page's main distribution channel delivers a blank card

**Problem.** `src/landing/metadata.ts` sets `const SITE_ORIGIN = ""` and then builds `og:url`, `og:image`, `twitter:image`, and the canonical link from it. The emitted tags are therefore `og:image = "/landing/social-preview.svg"` — a **relative** URL — and the canonical is `/welcome`. Open Graph consumers (Slack, Discord, X, iMessage, LinkedIn) require absolute URLs and will render no image; separately, **SVG is not an accepted OG image format** on the major platforms even when the URL resolves. The asset itself does exist at `public/landing/social-preview.svg`, and `applyLandingMetadata()` is otherwise well-built (it cleans up the tags it creates on unmount). The plan's acceptance checklist explicitly requires *"Page metadata renders correctly in link previews."*

**Why it matters.** For a pre-release project with no store presence, the primary acquisition path is somebody pasting the repo or page link into a chat. That path currently produces a bare URL with no title card and no image — in the same message where a competitor's link shows a full preview card.

**Fix.** Set `SITE_ORIGIN` to the real deployed origin, add a rasterized `social-preview.png` at 1200×630 alongside the SVG, and point `og:image` / `twitter:image` at the PNG. Until a stable public URL exists, either drop the OG image tags entirely (a clean title+description card beats a broken one) or hard-code an absolute `raw.githubusercontent.com` URL — but do not ship a relative `og:image`.

---

### P2 — The trust section renders its four strongest guarantees as hazards

**Problem.** `limitations` contains seven items, and every one renders identically: `<AlertTriangle size={18}>` in `--lp-warning` amber, title, body. So "**No required account or cloud service**" — the product's headline privacy guarantee — is visually indistinguishable from "**The current LAN transport is cleartext**." Seven amber triangles in a two-column ruled grid read as a wall of alarms at exactly the moment the page should be resolving the anxiety it has spent six sections building.

**Why it matters.** The trust section is the page's differentiator and its best content. Rendering reassurance in the same visual register as hazard actively suppresses the section's persuasive power — visitors skim amber icons as "problems" and move on.

**Fix.** Split the section into two registers and two headings. **"What it will never do"** — no account, no cloud, no telemetry, data stays local — with a neutral or padlock treatment. **"What you must know before trusting it"** — cleartext LAN transport, snapshot replaces the target DB (back up first), short-lived pairing token, unsigned desktop builds — keeping the amber `AlertTriangle`. Same seven facts, zero deletions, and the section's first impression becomes confidence instead of caution. Also change `.lp-dot`'s use in the hero status pill: an accent-blue dot conventionally signals "live/healthy," and "no versioned releases yet" is neither.

---

## 7. PERSONA RED FLAGS

**A. The skeptical privacy-minded developer** (primary ICP per the audience section)

- **"Keep it local" and "no telemetry service in the loop" are asserted in prose and never proved.** The page's own closing section is titled "Read the code before you trust it," yet it offers no architecture link, no sync-protocol reference, no threat model, and no verification affordance. There is an obvious free win sitting unused: a line like "this page loads no third-party scripts and makes no network requests" — which appears to be *true* (the CSS names Inter and JetBrains Mono with system fallbacks and the page includes no external resources) and would be a provable, one-sentence demonstration of the product's whole thesis. Not claimed.
- **The `cert:` → "Certifications" and "3 sessions behind schedule" panel is an immediate tell.** This persona opens devtools and reads `PasteIngest.tsx` before installing anything. Finding a fabricated capability in the hero costs the page every honest claim it makes elsewhere.
- **The download path is a non-starter on its own terms.** "Download the latest build" → Actions tab → pick a successful run → download a zip artifact → unzip → run an **unsigned** binary. No checksum, no checksum file, no build-provenance attestation, no signature. This persona will not do it, and the page gives them nothing that would let them justify doing it.
- The `contribute` section reads as contribution etiquette ("include logs," "don't attach database files," "sanitize screenshots") rather than as an invitation to audit the thing whose whole value proposition is auditability.

**B. First-time visitor arriving from a shared link**

- **The link they clicked had no preview card** (relative `og:image`, SVG format) and the page they landed on **contains no image**. There is nothing photographic, illustrative, or diagrammatic anywhere — only text and placeholder notices.
- **The headline does not say what the product is.** "Your calm command center for everything you're learning, building, pursuing, and acquiring" could describe a task app, a notes app, a goals app, or a habit tracker. The subhead does the real work, but it demands ~40 words of reading before the visitor knows this is not another to-do list. The H1 is the one place a visitor will not forgive genericness.
- **The nav item "Limitations" is a first-impression risk chunk.** Encountering "Limitations" as a top-level navigation destination before any desire has been established primes the visitor to expect a broken product — bailing on it before they discover that this is the page's integrity signal. Consider surfacing it as "What's honest about it" or moving it adjacent to "Platforms."
- **"Download the latest build" leads to a CI workflow list.** "Pick a successful run of the desktop or Android workflow and download the artifact" assumes GitHub fluency that this visitor does not have. The primary action fails, then the recovery instructions fail, in the same fold.

**C. A non-technical person managing life admin** (the page explicitly recruits this persona as "Anyone whose lists are everywhere")

- **This persona has no path to the product, and the page recruits them anyway.** Every route to installation runs through GitHub Actions artifacts, a ZIP extraction, and an unsigned-binary warning. Recruiting an audience that cannot complete the only available action is worse than not recruiting them — it produces a bounce with a bad memory.
- **The limitations section — written for exactly this reader — is written in engineer.** "Bounded snapshot of up to 64 MiB," "validated before it atomically replaces the target," "cleartext," "port 9377 (discovery on 9378)," "notarization," "keystore material." The section that is supposed to build their trust is the section most likely to convince them the product is not for them.
- **"Desktop builds are unsigned and will trigger an operating-system warning on first launch" is a stop sign with no next step.** Stated plainly and correctly — but with no "here's what that looks like, here's why, here's what to click," this sentence ends the journey for anyone who has been trained to fear that dialog.
- **"Not a medical or therapeutic product and makes no claim about treating any condition"** is the one line in the page written specifically at a reader who struggles with life admin — and it tells them the product is not for them, before they have been given a reason to want it.

---

## 8. MINOR OBSERVATIONS

- **"Nothing is silently dropped in the transform" is a stronger promise than the code can make.** `PasteIngest.tsx` reports `` `${lines.length} item${...} imported` `` — counted from **input lines**, not from rows actually inserted — and uses `INSERT OR IGNORE`. If any uniqueness constraint exists on `title`, duplicate lines are dropped with no message *and* the success count over-reports. **Inference, not confirmed defect:** I could not locate the table schema (no `CREATE TABLE` in the TypeScript sources I searched; I did not search the Rust side). Either way, the count is derived from input length and cannot detect a skipped row.
- **The safety valve for a bad snapshot is mispromised.** "Validated before it atomically replaces the target" reads as *"you can't lose data."* The next item contradicts it — the transfer **replaces** the target and you should export a backup first. Consider a single sentence that says plainly: *sync copies one device's database over the other's; it is not a merge.*
- **Caveat triplication.** "No versioned releases / unsigned builds / CI artifacts are not downloads" appears in the hero `lp-cta-note`, the platforms `lp-download-note`, and the table caption+status column. One statement, well-placed, is confidence; three is anxiety.
- **The CSS comments are a compliance log, not a description.** "Accent use 1 of 3" and "Accent use 2 of 3" are annotated for only two of ~14 accent elements in the rendered DOM. The "intentional exceptions" appendix, the craft-floor revision notes, and the `.lp-final` note explaining what "the detector" reports all describe a review process rather than the page. Worth separating: keep the reasoning, drop the self-audit narration.
- **No mobile navigation below 900px.** `.lp-nav { display: none }` with `display: flex` only at `min-width: 900px` — so on a phone the visitor gets the brand and a GitHub chip, and the five sections are unreachable except by scrolling.
- **The platform table becomes a horizontal scroller on a phone.** `min-width: 640px` inside `overflow-x: auto`, with `td:first-child { white-space: nowrap }`. Below ~640px this is a scroll-region table; a stacked definition list would serve better.
- **`.lp-step-block:first-child` is declared twice** (once for `border-top: 0`, once for the animation) — harmless today, easy to lose on the next edit.
- **Three near-duplicate body-text treatments**: `.lp-cta-note`, `.lp-download-note`, `.lp-note` differ by one to two properties (`max-width`, `margin`) and could be one utility plus a modifier.
- **Two hardcoded colors exist, both in the primary button** — `color: #071018` and `:hover { background: #6bb0ff }` — outside the token set, in the one element where the accent must stay legible.
- **`.lp-tick` and `.lp-dot` are both 6–7px decorative accent squares/circles** used for the panel bar, the parsed rows, the status pill, and the brand mark's middle bar — the "three stacked bars" motif is reused four different ways for four different meanings, so it reads as ornament rather than signal.
- **`--lp-warning` is defined and used only for the trust-section icons.** Correctly scoped, but see the P2 above.
- **The brand uses `letter-spacing: 0.16em; text-transform: uppercase`** while every other surface is sentence case. It reads slightly "product-y/template" against the otherwise-authored voice.
- **Footer "Back to top" points at `#main`**, which is the top of `<main>`, not the page top — it lands *below* the sticky header. `#hero` (as used by the skip link) would be better.

---

## 9. PROVOCATIVE QUESTIONS

1. **If the honest statement of the situation is "there is nothing to download," why does the button still say "Download the latest build"?** The page's strongest asset is that it refuses to oversell. Yet its most prominent element is a promise the project cannot keep, defended by a paragraph underneath. What would this page look like if the *primary* action were the one that actually works today — `git clone` and `npm run tauri dev`, or "read the ingestion code, it's 40 lines" — with the CI artifact path demoted to a developer-only secondary? Would conversion really be worse, or would the page finally be the thing it claims to be?

2. **The page's thesis is "read the code before you trust it." So why is the only demonstration a hand-built mock of a capability the app doesn't have?** There's a version of this hero where the panel *is* the proof: a live textarea where the visitor pastes their own list, and the page shows them exactly what would be inserted — the literal `INSERT INTO ... (title, raw_import_text) VALUES ('<their line>', '<their line>')` — plus an honest "we don't guess your domain; we put it in whatever list you were looking at." That's a demonstration no competitor can copy, it's completely truthful, and it costs less design work than the current fake. Why wasn't that the page?

3. **Swap the logo, the headline, and the accent hex — is anything left that says "Mainframe"?** Right now the answer is: the domain vocabulary, and a ruled grid. The ruled/ledger structure is the only visual idea here with a real relationship to the product (a local, structured, list-shaped life-admin system). If the single distinctive interaction in the whole product is pairing two of your own devices on your own network, why is that idea invisible on the page that has to sell it — and what would this page look like if the ruled ledger *were* the layout, with every section a register you could read down rather than a band you scroll past?

---

### Evidence notes

**Verified by reading source:** all quotes and code above; `PasteIngest.tsx` ingest behavior; `getUrgencyReasons()` output strings in `src/engine/urgencyScoring.ts`; `Status` union in `src/App.tsx`; `SITE_ORIGIN = ""` in `metadata.ts`; `public/landing/social-preview.svg` exists; README contains `## Quick start for contributors` (the anchor `#quick-start-for-contributors` in the "Build it locally instead" link resolves).

**Inferred, not confirmed:** the `INSERT OR IGNORE` duplicate-suppression behavior of the "nothing is silently dropped" claim depends on a schema constraint I could not locate.

**Not checked:** the 64 MiB snapshot cap, ports 9377/9378, the 10-minute pairing window, and the per-platform build claims in `content.ts` — these are stated as mirrored from README.md and `10_ANDROID_PRODUCTION_READINESS.md`, which I did not read. Treat their accuracy as unverified in this review.
