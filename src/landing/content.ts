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
  { href: "#compare", label: "Comparison" },
  { href: "#walkthrough", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#platforms", label: "Platforms" },
  { href: "#trust", label: "Limitations" },
];

export const comparisonRows = [
  {
    trait: "Data Storage",
    todoApps: "Proprietary Cloud",
    notion: "Proprietary Cloud / Hybrid",
    mainframe: "100% Local SQLite (Offline)",
  },
  {
    trait: "Pricing Model",
    todoApps: "Monthly Subscription ($4–$10/mo)",
    notion: "Free tier with paid barriers",
    mainframe: "100% Free & Open Source (FOSS)",
  },
  {
    trait: "Setup Time",
    todoApps: "Instant (flat checklists)",
    notion: "Hours of relational schema design",
    mainframe: "Instant (5 pre-modeled domains)",
  },
  {
    trait: "Overdue Handling",
    todoApps: "Punitive red badges & broken streaks",
    notion: "Manual formula / user-built",
    mainframe: "Neuro-UX: Neutral re-entry (Zero shame)",
  },
  {
    trait: "Cross-Device Sync",
    todoApps: "Centralized cloud server",
    notion: "Cloud server sync",
    mainframe: "Direct LAN / USB P2P Differential Merge",
  },
  {
    trait: "Scope of Life",
    todoApps: "Flat chores & simple checklists",
    notion: "Requires relational database modeling",
    mainframe: "Courses, Goals, Ideas, Ventures, Purchases",
  },
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

export interface TrustItem {
  id: string;
  category: string;
  badge: string;
  title: string;
  body: string;
  tone: "guarantee" | "advisory";
  icon: "CloudOff" | "Database" | "GitCompare" | "Cable" | "KeyRound" | "ShieldAlert";
  technicalSnippet?: string;
}

export const limitations: TrustItem[] = [
  {
    id: "zero-cloud",
    category: "Architecture",
    badge: "ZERO-CLOUD ARCHITECTURE",
    title: "No required account or cloud service",
    body: "The core workflow never calls a hosted backend. There is no sign-up, no monthly subscription fee, and zero telemetry tracking.",
    tone: "guarantee",
    icon: "CloudOff",
    technicalSnippet: "0 hosted servers · 0 telemetry endpoints",
  },
  {
    id: "local-storage",
    category: "Storage",
    badge: "LOCAL SQLITE STORAGE",
    title: "Data is local to each device by default",
    body: "Every device holds its own SQLite database. Installing the app twice does not automatically connect two devices until you initiate sync.",
    tone: "guarantee",
    icon: "Database",
    technicalSnippet: "SQLite with WAL · 100% offline",
  },
  {
    id: "bidirectional-sync",
    category: "Data Integrity",
    badge: "DIFFERENTIAL MERGE",
    title: "Non-destructive bidirectional differential sync",
    body: "P2P sync exchanges only newer items and modifications between paired devices. Alternatively, one-way mirror snapshot is available with automatic pre-merge backup.",
    tone: "guarantee",
    icon: "GitCompare",
    technicalSnippet: "Pre-merge automatic backup snapshot",
  },
  {
    id: "local-transport",
    category: "Transport",
    badge: "PRIVATE SUBNET & USB",
    title: "Local network and wired USB transfer",
    body: "Sync operates over your private Wi-Fi (port 9377) or wired USB via adb reverse. Do not expose sync ports to the public internet.",
    tone: "guarantee",
    icon: "Cable",
    technicalSnippet: "Port 9377 · adb reverse tcp:9377",
  },
  {
    id: "pairing-token",
    category: "Authentication",
    badge: "10-MINUTE PIN TOKEN",
    title: "Pairing is short-lived by design",
    body: "Pairing uses a one-time six-digit PIN token that expires after 10 minutes. If pairing fails, start over rather than reusing a token.",
    tone: "guarantee",
    icon: "KeyRound",
    technicalSnippet: "One-time 6-digit PIN · 10m TTL",
  },
  {
    id: "unsigned-builds",
    category: "Packaging",
    badge: "RELEASE ADVISORY",
    title: "Desktop builds are unsigned for initial release",
    body: "Windows and macOS will display a first-launch security prompt (SmartScreen / Gatekeeper). Click 'Run Anyway' on Windows or right-click 'Open' on macOS.",
    tone: "advisory",
    icon: "ShieldAlert",
    technicalSnippet: "CI-built binary · EV signing pending",
  },
];


export const contributionNotes = [
  "Include the platform, the app version (v0.1.0) or commit, reproduction steps, and relevant logs.",
  "Keep reports specific — a narrow bug with clear reproduction steps is more useful than a broad feature wish.",
  "Do not attach database files or other private data to an issue. Sanitize screenshots first.",
  "Contributions and feedback are welcome. Check GitHub Discussions or open an issue.",
];

export const playgroundPresets = [
  {
    id: "developer",
    title: "Developer Tracks",
    description: "Multi-track parallel projects parsed into distinct domains",
    rawText: [
      "cert: AWS Solutions Architect - book exam block",
      "build: Local-first P2P differential sync engine",
      'buy: 27" 4K IPS secondary monitor for dual workspace',
      "goal: Run half marathon under 1h 45m",
      "venture: Client Q4 delivery sprint milestone",
    ].join("\n"),
    items: [
      { title: "AWS Solutions Architect", domain: "Certifications", tag: "Needs attention", note: "Milestone due in 3 days", tone: "warning" as const },
      { title: "Local-first P2P differential sync engine", domain: "Build Ideas", tag: "In progress", note: "Active loop from yesterday", tone: "accent" as const },
      { title: '27" 4K IPS secondary monitor', domain: "Acquisitions", tag: "Watching", note: "Price tracker active", tone: "neutral" as const },
      { title: "Run half marathon under 1h 45m", domain: "Goals", tag: "Tracked", note: "4 weeks remaining", tone: "neutral" as const },
      { title: "Client Q4 delivery sprint milestone", domain: "Ventures", tag: "Continue", note: "Blunt re-entry · 0 guilt", tone: "neutral" as const },
    ],
  },
  {
    id: "adhd",
    title: "ADHD Brain Dump",
    description: "Messy unstructured stream parsed with working memory limits",
    rawText: [
      "fix broken ssh keys on staging server",
      "research mechanical keyboard switches",
      "finish typescript 5.8 migration",
      "call dentist about Tuesday appointment",
      "pay quarterly hosting invoice",
    ].join("\n"),
    items: [
      { title: "Fix broken SSH keys on staging server", domain: "Build Ideas", tag: "In progress", note: "Surfaced to focus queue", tone: "accent" as const },
      { title: "Finish TypeScript 5.8 migration", domain: "Build Ideas", tag: "Next up", note: "Working memory slot 2", tone: "warning" as const },
      { title: "Pay quarterly hosting invoice", domain: "Ventures", tag: "Due soon", note: "Preserved from paste", tone: "neutral" as const },
      { title: "Call dentist about Tuesday appointment", domain: "Goals", tag: "Queued", note: "Capped to prevent overload", tone: "neutral" as const },
      { title: "Research mechanical keyboard switches", domain: "Acquisitions", tag: "Saved", note: "Zero cognitive debt", tone: "neutral" as const },
    ],
  },
  {
    id: "learning",
    title: "Career & Learning",
    description: "Deep skill acquisition alongside prototype builds",
    rawText: [
      "cert: CKA Kubernetes Administrator exam",
      "build: Rust CLI for database backups",
      "goal: Publish 6 technical deep-dives",
      "buy: Ergo chair lumbar support",
      "venture: Launch developer tools newsletter",
    ].join("\n"),
    items: [
      { title: "CKA Kubernetes Administrator exam", domain: "Certifications", tag: "Focus item", note: "Target: Nov 15", tone: "warning" as const },
      { title: "Rust CLI for database backups", domain: "Build Ideas", tag: "Active build", note: "Zero external deps", tone: "accent" as const },
      { title: "Publish 6 technical deep-dives", domain: "Goals", tag: "Progressing", note: "2 of 6 published", tone: "neutral" as const },
      { title: "Launch developer tools newsletter", domain: "Ventures", tag: "Ideation", note: "Audience validated", tone: "neutral" as const },
      { title: "Ergo chair lumbar support", domain: "Acquisitions", tag: "Research", note: "Budget allocated", tone: "neutral" as const },
    ],
  },
];

export const releaseAssets = [
  {
    platform: "Windows",
    badge: "Windows 10 / 11 (x64)",
    filename: "The-Mainframe_0.1.0_x64-setup.exe",
    format: "NSIS Installer (.exe)",
    url: "https://github.com/karefined-eng/the-mainframe/releases/download/v0.1.0/The-Mainframe_0.1.0_x64-setup.exe",
    secondary: {
      format: "MSI (.msi)",
      url: "https://github.com/karefined-eng/the-mainframe/releases/download/v0.1.0/The-Mainframe_0.1.0_x64_en-US.msi",
    },
  },
  {
    platform: "macOS",
    badge: "Apple Silicon (aarch64)",
    filename: "The-Mainframe_0.1.0_aarch64.dmg",
    format: "Disk Image (.dmg)",
    url: "https://github.com/karefined-eng/the-mainframe/releases/download/v0.1.0/The-Mainframe_0.1.0_aarch64.dmg",
  },
  {
    platform: "Linux",
    badge: "x86_64 / amd64",
    filename: "the-mainframe_0.1.0_amd64.AppImage",
    format: "AppImage (.AppImage)",
    url: "https://github.com/karefined-eng/the-mainframe/releases/download/v0.1.0/the-mainframe_0.1.0_amd64.AppImage",
    secondary: {
      format: "Debian (.deb)",
      url: "https://github.com/karefined-eng/the-mainframe/releases/download/v0.1.0/the-mainframe_0.1.0_amd64.deb",
    },
  },
  {
    platform: "Android",
    badge: "Universal APK",
    filename: "app-universal-release.apk",
    format: "Signed Release APK (.apk)",
    url: "https://github.com/karefined-eng/the-mainframe/releases/download/v0.1.0/app-universal-release.apk",
  },
];

export const techStack = [
  { label: "Shell and native core", value: "Tauri v2 with Rust" },
  { label: "Interface", value: "React 19, TypeScript, Vite, Tailwind CSS" },
  { label: "Storage", value: "Local SQLite with WAL via tauri-plugin-sql" },
  { label: "Device transfer", value: "Local P2P differential sync implemented in Rust" },
];
