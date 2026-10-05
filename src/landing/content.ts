/**
 * Copy and data for the public landing page.
 *
 * Every factual claim in this file is mirrored from a verified source in this
 * repository, so a reviewer can check it without leaving git:
 *   - Platform support + download path + sync boundaries -> README.md
 *   - Sync ports, pairing window, transfer cap, cleartext caveat -> README.md
 *   - Product scope, domains, visual tokens -> 00_PROJECT_BRIEF.md
 *   - Release/signing limitations -> 10_ANDROID_PRODUCTION_READINESS.md
 *
 * Do not add a claim here that is not backed by one of those sources, and
 * never state a medical or health benefit.
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

export const walkthrough = [
  {
    step: "01",
    title: "Paste the list you already have",
    body: "Copy a wall of unstructured text from wherever it currently lives and paste it in. Plain text is the only input path — there is no file-upload workflow and no format-specific parser to satisfy.",
    asset: "List ingestion",
    alt: "The paste-ingestion panel of The Mainframe accepting an unstructured block of plain text and preparing it for parsing.",
  },
  {
    step: "02",
    title: "Watch it become structured items",
    body: "Each pasted line becomes an item with a status, an optional target date, and the original text preserved alongside it. The raw paste stays attached, so nothing is silently dropped in the transform.",
    asset: "Parsed items in a domain",
    alt: "A domain list showing parsed items with status labels and target dates, each still linked to its original pasted text.",
  },
  {
    step: "03",
    title: "See what matters right now",
    body: "The dashboard surfaces a short cross-domain shortlist and states why each entry surfaced. It is a suggestion you can ignore, not a queue you are failing to clear.",
    asset: "Cross-domain attention view",
    alt: "The What's Hot dashboard showing a short list of items pulled from different domains, each with the reason it surfaced.",
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
    body: "Paste messy plain text and start with structure. No template to fill in, no import wizard, and the source text stays attached to the items it produced.",
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

export const limitations = [
  {
    title: "No required account or cloud service",
    body: "The core workflow never calls a hosted backend. There is no sign-up, no subscription, and no telemetry service in the loop.",
  },
  {
    title: "Data is local to each device by default",
    body: "Every device holds its own SQLite database. Installing the app twice does not automatically merge two sets of data.",
  },
  {
    title: "LAN sync is not cloud sync",
    body: "It moves a bounded snapshot of up to 64 MiB between your own devices, validated before it atomically replaces the target.",
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
    body: "Until platform signing is configured, desktop artifacts are unsigned and will trigger an operating-system warning on first launch.",
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
