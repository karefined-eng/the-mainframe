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
  title: "The Mainframe — Calm, Local-First Personal Operating System",
  description:
    "A private, offline-first personal operating system for courses, goals, build ideas, ventures, and purchases. Zero cloud accounts, zero subscriptions, no-shame Neuro-UX, and direct P2P LAN/USB sync.",
  keywords: [
    "local-first productivity app",
    "offline personal dashboard",
    "personal operating system",
    "adhd friendly task manager",
    "to do list without guilt",
    "notion alternative offline",
    "sqlite productivity app",
    "cross-platform desktop and android",
    "p2p device sync",
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
    body: "Several builds, courses, and ventures running in parallel with no single place that shows all of them without infinite setup.",
  },
  {
    title: "Students and career switchers",
    body: "Certification paths, study material, and skill roadmaps spread across notes, browsers, and messages without a calm home base.",
  },
  {
    title: "Freelancers and creators",
    body: "Personal projects that keep getting postponed, ideas that need somewhere to land, and zero desire to manage complex databases.",
  },
  {
    title: "Anyone overwhelmed by to-do list guilt",
    body: "Tired of apps greeting you with walls of red overdue badges and broken streaks. The Mainframe welcomes you back with calm, chunked re-entry.",
  },
];

export const walkthrough = [
  {
    step: "01",
    title: "Paste the list you already have",
    body: "Copy a wall of unstructured text from Notes, WhatsApp, or Google Docs and paste it in. In 3 seconds, it becomes structured items with zero manual data entry.",
    asset: "List ingestion",
    alt: "The paste-ingestion panel of The Mainframe accepting an unstructured block of plain text and preparing it for parsing.",
  },
  {
    step: "02",
    title: "Watch it become structured items",
    body: "Each line becomes an actionable card across your 5 domains: Goals, Build Ideas, Ventures, Courses, or Acquisitions. The original source text is always preserved.",
    asset: "Parsed items in a domain",
    alt: "A domain list showing parsed items with status labels and target dates, each still linked to its original pasted text.",
  },
  {
    step: "03",
    title: "See what matters right now (No shame)",
    body: "The What's Hot dashboard strictly caps focus to 3–5 items based on cognitive working memory. Returning after time away presents calm re-entry, not an accusation.",
    asset: "Cross-domain attention view",
    alt: "The What's Hot dashboard showing a short list of items pulled from different domains, each with the reason it surfaced.",
  },
  {
    step: "04",
    title: "Stay offline, sync across devices on your terms",
    body: "Your data lives strictly in a local SQLite database. Seamlessly sync between your PC and Android phone over your local Wi-Fi or USB cable using bidirectional differential merge.",
    asset: "LAN sync pairing",
    alt: "The sync pairing screen with a one-time pairing code, with all network addresses and pairing values redacted.",
  },
];

export const pillars = [
  {
    icon: "clipboard-paste",
    title: "Bring in a list in 3 seconds",
    body: "Paste messy plain text and get structured cards immediately. No blank-canvas fatigue, no database schema design, and no retyping.",
  },
  {
    icon: "flame",
    title: "Calm focus, zero shame",
    body: "High-priority queues strictly capped at 3–5 items. Overdue tasks are framed neutrally as opportunities to restart—never punitive red text or broken streaks.",
  },
  {
    icon: "hard-drive",
    title: "100% Offline & Sovereign",
    body: "Your database is a local SQLite file on your device. Zero cloud dependencies, zero mandatory accounts, zero telemetry, and zero monthly subscriptions.",
  },
  {
    icon: "arrow-left-right",
    title: "Direct Device-to-Device Sync",
    body: "Non-destructive bidirectional differential merge across PC and Android over local Wi-Fi or wired USB. Both devices stay up to date without any cloud middleman.",
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
