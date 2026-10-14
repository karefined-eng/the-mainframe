/**
 * Copy and data for the public landing page.
 *
 * Every factual claim in this file is grounded in docs/origin.md and verified
 * against active code and released artifacts:
 *   - Platform support + download path + sync boundaries -> README.md
 *   - Sync ports, pairing window, transfer cap, differential merge -> docs/handoff/2026-10-14-bidirectional-merge-sync.md
 *   - Product scope, domains, visual tokens -> 00_PROJECT_BRIEF.md
 *   - Release/signing limitations -> 10_ANDROID_PRODUCTION_READINESS.md
 *   - Search intent & cognitive psychology -> docs/research/search-intent-copywriting-framework.md
 *
 * Do not state a medical or health benefit; frame cognitive load reduction
 * as a software design principle.
 */

export const REPO_URL = "https://github.com/karefined-eng/the-mainframe";
export const RELEASES_URL = `${REPO_URL}/releases/tag/v0.1.0`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const ACTIONS_URL = `${REPO_URL}/actions`;

export const pageMeta = {
  title: "The Mainframe — Calm, Local-First Personal Operating System",
  description:
    "A private, offline-first personal operating system for courses, goals, build ideas, ventures, and purchases. Zero cloud accounts, zero subscriptions, no-shame Neuro-UX, and direct P2P LAN/USB sync.",
  keywords: [
    "to do list without guilt",
    "adhd friendly task manager",
    "how to organize multiple projects",
    "local-first productivity app",
    "offline personal dashboard",
    "personal operating system",
    "notion alternative without subscription",
    "to do list without overdue shame",
    "app for people with too many ideas",
    "sqlite productivity app",
    "p2p device sync",
    "open source task manager",
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
    body: "Several software builds, courses, and business ventures running in parallel—without needing a second job just to maintain custom Notion databases.",
  },
  {
    title: "Anyone exhausted by to-do list guilt",
    body: "Tired of opening an app to find 30 red overdue badges and broken streaks. The Mainframe welcomes you back with calm, neutral re-entry that never feels like a verdict.",
  },
  {
    title: "Builders with too many ideas",
    body: "Sparks of inspiration arrive anywhere. Dump raw, unformatted text from Notes or WhatsApp, and let the app structure it without interrupting your flow.",
  },
  {
    title: "Privacy-first & local-first advocates",
    body: "Refusing to pay monthly subscription rent or store personal life roadmaps on corporate cloud servers. 100% offline SQLite with direct LAN/USB sync.",
  },
];

export const walkthrough = [
  {
    step: "01",
    title: "Bring in your messy lists in 3 seconds",
    body: "Copy an unformatted wall of text from Apple Notes, WhatsApp, or Google Docs and paste it in. In three seconds, it becomes structured cards with zero manual data entry.",
    asset: "List ingestion",
    alt: "The paste-ingestion panel of The Mainframe accepting an unstructured block of plain text and preparing it for parsing.",
  },
  {
    step: "02",
    title: "Pre-structured homes for parallel tracks",
    body: "Each line lands in its natural domain: Goals, Build Ideas, Ventures, Courses & Certifications, or Acquisitions. The original source text is always preserved.",
    asset: "Parsed items in a domain",
    alt: "A domain list showing parsed items with status labels and target dates, each still linked to its original pasted text.",
  },
  {
    step: "03",
    title: "See what matters right now (Zero shame)",
    body: "The What's Hot dashboard strictly caps focus to 3–5 items based on cognitive working memory limits. Stepping away for two weeks shows calm re-entry cues—never an accusation wall.",
    asset: "Cross-domain attention view",
    alt: "The What's Hot dashboard showing a short list of items pulled from different domains, each with the reason it surfaced.",
  },
  {
    step: "04",
    title: "100% offline, sync across devices on your terms",
    body: "Your database is a local SQLite file with Write-Ahead Logging. Sync between PC and Android over local Wi-Fi or wired USB using non-destructive differential merge.",
    asset: "LAN sync pairing",
    alt: "The sync pairing screen with a one-time pairing code, with all network addresses and pairing values redacted.",
  },
];

export const pillars = [
  {
    icon: "clipboard-paste",
    title: "3-Second Plaintext Capture",
    body: "Paste messy brain dumps and get structured cards immediately. No blank-canvas paralysis, no database schema design, and zero retyping.",
  },
  {
    icon: "flame",
    title: "Calm Attention, Never a Guilt Backlog",
    body: "High-priority queues strictly capped at 3–5 items. Overdue items are framed neutrally as opportunities to continue—never punitive red text or broken streaks.",
  },
  {
    icon: "hard-drive",
    title: "100% Offline SQLite Sovereignty",
    body: "Your database lives strictly on your device. Zero cloud dependencies, zero mandatory accounts, zero telemetry, and zero monthly subscriptions.",
  },
  {
    icon: "arrow-left-right",
    title: "P2P LAN / USB Bidirectional Sync",
    body: "Non-destructive differential exchange across PC and Android over local Wi-Fi or USB reverse proxy. Both devices stay current without any cloud middleman.",
  },
];

export const platformRows = [
  {
    platform: "Windows 10/11",
    deliverable: "NSIS Installer (.exe) and MSI Package (.msi)",
    status: "Released — v0.1.0",
    tone: "target" as const,
  },
  {
    platform: "macOS",
    deliverable: "Apple Silicon Disk Image (.dmg)",
    status: "Released — v0.1.0 · notarization pending",
    tone: "target" as const,
  },
  {
    platform: "Linux",
    deliverable: "AppImage (.AppImage), Debian package (.deb), RPM (.rpm)",
    status: "Released — v0.1.0",
    tone: "target" as const,
  },
  {
    platform: "Android",
    deliverable: "Signed Release APK (universal aarch64)",
    status: "Released — v0.1.0 · Play Store pending",
    tone: "target" as const,
  },
  {
    platform: "iOS",
    deliverable: "Single Tauri v2 codebase evaluation",
    status: "Planned evaluation",
    tone: "pending" as const,
  },
];

export const limitations = [
  {
    title: "No required account or cloud service",
    body: "The core workflow never calls a hosted backend. There is no sign-up, no monthly subscription fee, and zero telemetry tracking.",
  },
  {
    title: "Data is local to each device by default",
    body: "Every device holds its own SQLite database. Installing the app twice does not automatically connect two devices until you initiate sync.",
  },
  {
    title: "Non-destructive bidirectional differential sync",
    body: "P2P sync exchanges only newer items and modifications between paired devices. Alternatively, one-way mirror snapshot is available with automatic pre-merge backup.",
  },
  {
    title: "Local network and wired USB transfer",
    body: "Sync operates over your private Wi-Fi (port 9377) or wired USB via adb reverse. Do not expose sync ports to the public internet.",
  },
  {
    title: "Pairing is short-lived by design",
    body: "Pairing uses a one-time six-digit PIN token that expires after 10 minutes. If pairing fails, start over rather than reusing a token.",
  },
  {
    title: "Desktop builds are unsigned for initial release",
    body: "Windows and macOS will display a first-launch security prompt (SmartScreen / Gatekeeper). Click 'Run Anyway' on Windows or right-click 'Open' on macOS.",
  },
];

export const contributionNotes = [
  "Include the platform, the app version (v0.1.0) or commit, reproduction steps, and relevant logs.",
  "Keep reports specific — a narrow bug with clear reproduction steps is more useful than a broad feature wish.",
  "Do not attach database files or other private data to an issue. Sanitize screenshots first.",
  "Contributions and feedback are welcome. Check GitHub Discussions or open an issue.",
];

export const techStack = [
  { label: "Shell and native core", value: "Tauri v2 with Rust" },
  { label: "Interface", value: "React 19, TypeScript, Vite, Tailwind CSS" },
  { label: "Storage", value: "Local SQLite with WAL via tauri-plugin-sql" },
  { label: "Device transfer", value: "Local P2P differential sync implemented in Rust" },
];
