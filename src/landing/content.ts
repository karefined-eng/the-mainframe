/**
 * Copy and data for the public landing page.
 *
 * Every factual claim in this file is mirrored from a verified source in this
 * repository, so a reviewer can check it without leaving git:
 *   - Platform support + download path + sync boundaries -> README.md
 *   - Sync ports, pairing window, transfer cap, cleartext caveat -> README.md
 *   - Product scope, domains, visual tokens -> 00_PROJECT_BRIEF.md
 *   - Release/signing limitations -> 10_ANDROID_PRODUCTION_READINESS.md
 *   - Ingestion behaviour (one line in, one row out; no inference) ->
 *     src/components/PasteIngest.tsx
 *   - Uniqueness / silent duplicate drop -> src-tauri/src/lib.rs (title UNIQUE)
 *   - Attention reason strings -> src/engine/urgencyScoring.ts
 *
 * Do not add a claim here that is not backed by one of those sources, and never
 * state a medical or health benefit.
 */

export const REPO_URL = "https://github.com/karefined-eng/the-mainframe";
export const ISSUES_URL = `${REPO_URL}/issues`;
export const ACTIONS_URL = `${REPO_URL}/actions`;

// There is deliberately no version label here. The package version (0.1.0) is an
// internal build identifier and no versioned public release exists, so showing it
// as a release number would be an unsupported claim.

export const pageMeta = {
  title: "The Mainframe — Local-First Life Management",
  description:
    "A private, offline-first life management app for courses, projects, goals, ideas, purchases, and ventures. Built with Tauri, React, Rust, and SQLite.",
  keywords: [
    "local-first productivity app",
    "offline life management",
    "private personal dashboard",
    "cross-platform desktop and Android",
    "SQLite productivity app",
  ],
};

export const navLinks = [
  { href: "#why", label: "Why" },
  { href: "#walkthrough", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#platforms", label: "Platforms" },
  { href: "#trust", label: "Limitations" },
];

export const audience = [
  {
    title: "Developers and solo builders",
    body: "Several builds, courses, and side projects running in parallel with no single place that shows all of them.",
  },
  {
    title: "Students and career switchers",
    body: "Certification tracks, study material, and application deadlines spread across notes, browsers, and messages.",
  },
  {
    title: "Freelancers and creators",
    body: "Client deliverables that recur, personal work that keeps getting postponed, and ideas that need somewhere to land.",
  },
  {
    title: "Anyone whose lists are everywhere",
    body: "Task content split across note apps, chat threads, spreadsheets, and memory. The Mainframe is built to be the one place those lists come to rest.",
  },
];

/**
 * The ingestion claim is deliberately narrow. The app splits input on newlines
 * and writes one row per non-empty line into whichever domain the user already
 * opened: there is no domain inference, no date extraction, and no status
 * inference. Any copy here that implies otherwise is false.
 */
export const walkthrough = [
  {
    step: "01",
    title: "Paste the list you already have",
    body: "Copy a wall of unstructured text from wherever it currently lives and paste it in. Plain text is the only input path — there is no file-upload workflow and no format-specific parser to satisfy.",
    asset: "Paste panel with a real list",
    alt: "The paste panel accepting an unstructured block of plain text, with the detected line count shown before import.",
  },
  {
    step: "02",
    title: "Watch it become rows",
    body: "Each non-empty line becomes one item, with the original line kept alongside it as raw import text. That is the whole transform: the app does not guess which domain a line belongs to, and it does not invent a due date for you.",
    asset: "Rows in a domain list",
    alt: "A domain list showing one row per pasted line, each with its status and its original text preserved.",
  },
  {
    step: "03",
    title: "See what needs attention",
    body: "The dashboard pulls a short cross-domain shortlist and says why each entry surfaced, using plain reasons such as being overdue, being due this week, or not having been touched in a while.",
    asset: "Cross-domain attention view",
    alt: "The What's Hot dashboard showing a few items pulled from different domains, each with the plain reason it surfaced.",
  },
  {
    step: "04",
    title: "Stay offline, sync only when you choose",
    body: "The app reads and writes a local SQLite database on each device. When you want the same snapshot on a second device, pair once on a trusted local network and transfer a validated snapshot.",
    asset: "LAN sync pairing",
    alt: "The sync pairing screen with a one-time pairing code, with all network addresses and pairing values redacted.",
  },
];

export const pillars = [
  {
    icon: "clipboard-paste",
    title: "Bring in a list",
    body: "Paste messy plain text and start with structure. No template to fill in, no import wizard, and the source line stays attached to the row it produced.",
  },
  {
    icon: "flame",
    title: "See what matters now",
    body: "One combined view across every domain so parallel tracks stop competing for attention in your head. Each suggestion explains why it appeared.",
  },
  {
    icon: "hard-drive",
    title: "Keep it local",
    body: "Offline-first SQLite storage with no required account. Your database is a file on your own device, not a row in someone else's service.",
  },
  {
    icon: "arrow-left-right",
    title: "Move a snapshot when you choose",
    body: "Opt-in transfer between your own trusted devices with one-time pairing, bounded to a validated snapshot rather than continuous background sync.",
  },
];

export const platformRows = [
  {
    platform: "Windows 10/11",
    deliverable: "Desktop installer artifacts from GitHub Actions",
    status: "Build target",
    tone: "target" as const,
  },
  {
    platform: "macOS",
    deliverable: ".app / .dmg artifacts from GitHub Actions",
    status: "Build target; signing and notarization still required for distribution",
    tone: "target" as const,
  },
  {
    platform: "Linux",
    deliverable: "AppImage / deb artifacts from GitHub Actions",
    status: "Build target; test on target distributions before release",
    tone: "target" as const,
  },
  {
    platform: "Android",
    deliverable: "Signed release APK or unsigned debug APK artifact",
    status: "Build target; Play Store bundle and device testing remain",
    tone: "target" as const,
  },
  {
    platform: "iOS",
    deliverable: "Not currently configured",
    status: "Planned evaluation",
    tone: "pending" as const,
  },
];

/**
 * Split into two registers, because these are not the same kind of claim.
 * `guarantees` are things the product will not do to you. `cautions` are real
 * limitations you should weigh. Rendering both as hazards made the page's
 * strongest selling points read as warnings.
 */
export const guarantees = [
  {
    title: "No required account or cloud service",
    body: "The core workflow never calls a hosted backend. There is no sign-up, no subscription, and no telemetry service in the loop.",
  },
  {
    title: "Data stays on the device by default",
    body: "Every device holds its own SQLite database and works with no network connection.",
  },
  {
    title: "No background sync",
    body: "Nothing moves between your devices unless you start a transfer yourself and pair once to authorise it.",
  },
  {
    title: "Nothing is uploaded to build this page",
    body: "This is a static page with no third-party scripts and no external fonts. The only measurement is the host's own cookie-free page-view counter — no accounts, no cross-site tracking, no personal data.",
  },
];

export const cautions = [
  {
    title: "Devices do not merge automatically",
    body: "Installing the app on a second machine does not combine the two databases. A snapshot transfer copies one device's database over the other's — it is not a merge.",
  },
  {
    title: "The current LAN transport is cleartext",
    body: "Sync is HTTP on the local network, restricted to private addresses on port 9377 (discovery on 9378). Do not expose it to the public internet, use it on an untrusted network, or treat it as a backup.",
  },
  {
    title: "Pairing is short-lived by design",
    body: "Pairing uses a one-time six-digit token that expires after 10 minutes. If pairing fails, start over rather than reusing a token.",
  },
  {
    title: "Back up before replacing a local database",
    body: "A snapshot transfer replaces the target database. Export a backup first if the device holds anything you have not duplicated elsewhere.",
  },
  {
    title: "Desktop builds are unsigned",
    body: "Until platform signing is configured, desktop artifacts are unsigned and will trigger an operating-system warning on first launch. Only run a build you downloaded from this repository's own Actions tab.",
  },
];

export const contributionNotes = [
  "Include the platform, the app version or commit, reproduction steps, and relevant logs.",
  "Keep reports specific — a narrow bug with clear steps is more useful than a broad feature wish.",
  "Do not attach database files or other private data to an issue. Sanitize screenshots first.",
  "Ideas and limitations are equally welcome. This is an early public release and the roadmap is still open.",
];

export const techStack = [
  { label: "Shell and native core", value: "Tauri v2 with Rust" },
  { label: "Interface", value: "React, TypeScript, Vite, Tailwind CSS" },
  { label: "Storage", value: "SQLite through tauri-plugin-sql" },
  { label: "Device transfer", value: "Local-network sync implemented in Rust" },
];
