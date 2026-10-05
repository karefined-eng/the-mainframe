# Public Landing Page Plan

## Objective

Create a public-facing landing page that explains The Mainframe in under one minute, drives people to a real build or download path, and sets accurate expectations about its early-release status.

The landing page should be developed on a separate branch from product work, but it can live in this repository. A separate repository is not needed unless the page later becomes an independently deployed marketing site.

## Recommended implementation path

### Stage 1 — Repository-native public page

Use the existing React/Vite frontend and add a public route or presentation mode for a landing page. This keeps:

- Product claims close to the implementation.
- Screenshots and feature examples versioned with the app.
- CI and deployment configuration in one repository.
- The option to reuse the page later as an in-app About or onboarding surface.

Do not replace the main application route. Use a separate route such as `/welcome` or a static marketing entry point so the app remains the primary product.

### Stage 2 — Separate deployment branch

Create a focused branch such as `public-landing-page` from the current `main` commit. Keep the branch limited to:

- Landing-page components and styles.
- Public assets and screenshots.
- SEO metadata.
- Deployment configuration.
- Any small shared UI primitives needed by the page.

Merge only after the page has been tested on mobile and desktop widths. If deployment needs a different build system later, extract the page into a separate repository at that point rather than pre-optimizing for a second repo now.

## Page structure

### 1. Hero

Headline:

> Your calm command center for everything you’re learning, building, pursuing, and acquiring.

Supporting copy:

> The Mainframe is a private, local-first life management app for scattered projects, goals, courses, ideas, and purchases. Work offline, keep your data on your devices, and bring order to the lists already spread across your life.

Primary CTA:

- **Download the latest build**

Secondary CTA:

- **View the source on GitHub**

The hero must state that the project is an early public release until versioned public releases exist.

### 2. Problem and audience

Explain the target user without over-narrowing:

- Developers and solo builders.
- Students and career switchers.
- Freelancers and creators.
- People whose personal information is split across notes, messages, spreadsheets, and memory.

Avoid claiming that the app treats ADHD or any medical condition. It is appropriate to mention reduced cognitive load and easier re-entry.

### 3. Product walkthrough

Show the core loop in three or four steps:

1. Paste an existing list.
2. Turn it into structured items.
3. See what needs attention across domains.
4. Continue offline and optionally transfer a snapshot across a trusted LAN.

Use one annotated screenshot or short recording per step. Do not use stock productivity imagery.

### 4. Feature pillars

Use outcome-oriented labels:

- **Bring in a list** — paste messy text and start with structure.
- **See what matters now** — resurface work across parallel tracks.
- **Keep it local** — offline SQLite storage with no required account.
- **Move a snapshot when you choose** — opt-in LAN transfer with one-time pairing.

Technical details such as Tauri, Rust, and SQLite belong in a lower technical section, not the hero.

### 5. Platform and download section

Show a status table matching the repository:

- Windows desktop: CI build target.
- macOS desktop: CI build target; signing/notarization pending.
- Linux desktop: CI build target; distribution testing pending.
- Android: signed or debug APK artifact; store bundle and device testing pending.
- iOS: not currently configured.

Link to successful GitHub Actions artifacts or versioned GitHub Releases. Do not link users to a workflow until a successful run has produced an artifact.

### 6. Trust and limitations

State plainly:

- No required account or cloud service.
- Data is local to each device by default.
- LAN sync is not cloud sync.
- Current LAN transport is cleartext and only suitable for trusted private networks.
- Users should back up before replacing a local database.
- Desktop builds are unsigned until platform signing is configured.

This section is essential for public credibility and should not be hidden in a footer.

### 7. Open-source and contribution CTA

Include:

- GitHub repository link.
- Issue link.
- Contribution expectations.
- A request not to upload private database files in issues.

Add a compact technical stack section for developers:

- Tauri v2.
- Rust.
- React/TypeScript/Vite.
- SQLite.

## SEO and metadata

Set page metadata for one clear search intent:

- Title: `The Mainframe — Local-First Life Management`
- Description: `A private, offline-first life management app for courses, projects, goals, ideas, purchases, and ventures. Built with Tauri, React, Rust, and SQLite.`
- Canonical URL once a stable public URL exists.
- Open Graph title, description, and social preview image.
- Twitter/X card metadata if the distribution channel requires it.
- `SoftwareApplication` structured data only when download URLs and platform claims are stable.

Use natural phrases in visible copy rather than keyword stuffing:

- local-first productivity app
- offline life management
- private personal dashboard
- cross-platform desktop and Android
- SQLite productivity app

## Assets required before publishing

- Final app icon and social preview image.
- One desktop screenshot showing the dashboard.
- One screenshot of list ingestion.
- One screenshot of the cross-domain attention view.
- One screenshot of the sync pairing flow with all private addresses and tokens removed.
- Platform badges or download cards only for artifacts that are actually available.

Never publish a screenshot containing a real database, pairing PIN, LAN address, keystore detail, or personal task content.

## Acceptance checklist

- A first-time visitor can explain what The Mainframe is after reading only the hero and first feature section.
- The primary CTA reaches a working artifact or clearly says that builds are not yet published.
- Every platform claim matches a successful CI build or is labeled as a target.
- Mobile layout works at narrow widths.
- Keyboard navigation, visible focus states, alt text, and sufficient color contrast are present.
- Page metadata renders correctly in link previews.
- No secrets, private data, or unsupported security claims appear in source or screenshots.
- Lighthouse or equivalent performance checks pass for the public page.

## Publishing sequence

1. Create `public-landing-page` from `main`.
2. Build the page with placeholder-safe assets and accurate early-release copy.
3. Run the Android and desktop workflows and link only to successful artifacts.
4. Add screenshots captured from sanitized sample data.
5. Configure a stable public URL and canonical metadata.
6. Publish the page.
7. Replace CI artifact links with versioned GitHub Release links when release signing, versioning, and platform testing are complete.

