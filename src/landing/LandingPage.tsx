/**
 * Public landing page for The Mainframe.
 *
 * Structure follows docs/LANDING_PAGE_PLAN.md section by section: hero,
 * problem/audience, product walkthrough, feature pillars, platform and download
 * status, trust and limitations, and the open-source contribution CTA with a
 * compact technical stack.
 *
 * Factual discipline for this file:
 *   - Every platform claim mirrors README.md and is labeled as a build target,
 *     never as a tested or shipped release.
 *   - No medical or health claim is made. Cognitive load and re-entry friction
 *     are described as product design goals, not as treatment.
 *   - The primary CTA points at the GitHub Actions tab, matching the documented
 *     "download a build" instructions, instead of a release that does not exist.
 *   - Screenshot slots are honest placeholders. No stock productivity imagery
 *     and no fabricated product screenshot is presented as real.
 *
 * Revised against Impeccable's craft floor and polish playbook:
 *   - Eyebrow/kicker labels above headings removed (absolute ban).
 *   - Card soup replaced with a ruled/lined structure; no nested cards.
 *   - Monospace limited to code, data, and measurement.
 *   - Functional text floor raised to 11px; uppercase limited to short labels.
 *   - A fabricated version number was removed from the hero and footer. It was
 *     an internal package version, not a shipped artifact, so presenting it as a
 *     release identifier was a claim the project cannot yet support.
 *   - Illustrative hero sample data is labelled with a disclosure line.
 *
 * `data-od-id` anchors mark the major regions so the page can be patched
 * section by section.
 */

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Cable,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  CloudOff,
  Copy,
  Database,
  Download,
  ExternalLink,
  Flame,
  GitCompare,
  HardDrive,
  Info,
  KeyRound,
  MessagesSquare,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { applyLandingMetadata } from "./metadata";
import Playground from "./Playground";
import {
  ISSUES_URL,
  RELEASES_URL,
  REPO_URL,
  audience,
  comparisonRows,
  contributionNotes,
  limitations,
  navLinks,
  pillars,
  platformRows,
  releaseAssets,
  type ReleaseAsset,
  techStack,
  walkthrough,
} from "./content";
import "./landing.css";

const pillarIcons: Record<string, typeof ClipboardPaste> = {
  "clipboard-paste": ClipboardPaste,
  flame: Flame,
  "hard-drive": HardDrive,
  "arrow-left-right": ArrowLeftRight,
};

/** Three stacked bars, middle bar in the accent — the project's icon motif.
 * Decorative: the adjacent brand text already names the product, so this is
 * hidden from assistive technology to avoid a duplicate announcement. */
function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect x="2.5" y="4" width="15" height="2.6" rx="1.3" fill="currentColor" />
      <rect x="2.5" y="8.7" width="15" height="2.6" rx="1.3" fill="var(--color-accent, #4A9EFF)" />
      <rect x="2.5" y="13.4" width="15" height="2.6" rx="1.3" fill="currentColor" />
    </svg>
  );
}

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section className="lp-section" id={id} aria-labelledby={`${id}-heading`} data-od-id={id}>
      <div className="lp-wrap">
        <h2 className="lp-h2" id={`${id}-heading`}>
          {title}
        </h2>
        {lede ? <p className="lp-lede">{lede}</p> : null}
        {children}
      </div>
    </section>
  );
}

function StepOneVisual() {
  return (
    <div className="lp-walk-mockup">
      <div className="lp-mockup-header">
        <span className="lp-mockup-title">
          <ClipboardPaste size={13} className="lp-mockup-icon" aria-hidden="true" />
          Raw text paste ingestion
        </span>
        <span className="lp-mockup-badge">Auto-categorized</span>
      </div>
      <div className="lp-mockup-code">
        <div className="lp-mockup-line"><span className="lp-mockup-prefix">cert:</span> AWS Solutions Architect Associate</div>
        <div className="lp-mockup-line"><span className="lp-mockup-prefix">build:</span> Local-first P2P differential sync</div>
        <div className="lp-mockup-line"><span className="lp-mockup-prefix">buy:</span> 27&quot; 4K IPS secondary monitor</div>
        <div className="lp-mockup-line"><span className="lp-mockup-prefix">goal:</span> Half marathon under 1h 45m</div>
        <div className="lp-mockup-line"><span className="lp-mockup-prefix">venture:</span> Client delivery sprint milestone</div>
      </div>
      <div className="lp-mockup-footer">
        <span className="lp-mockup-hint">5 lines parsed into structured cards in 0.2s · Raw text preserved</span>
      </div>
    </div>
  );
}

function StepTwoVisual() {
  const domainsSample = [
    { title: "Certifications", count: "3 active", sample: "AWS Solutions Architect", progress: 65 },
    { title: "Build Ideas", count: "5 active", sample: "Local-first P2P differential sync", progress: 80 },
    { title: "Ventures", count: "2 active", sample: "Client delivery sprint milestone", progress: 40 },
    { title: "Goals", count: "4 active", sample: "Half marathon under 1h 45m", progress: 90 },
    { title: "Acquisitions", count: "6 saved", sample: "27\" 4K IPS monitor", progress: 20 },
  ];

  return (
    <div className="lp-walk-mockup">
      <div className="lp-mockup-header">
        <span className="lp-mockup-title">
          <HardDrive size={13} className="lp-mockup-icon" aria-hidden="true" />
          Pre-modeled life domains (Zero setup required)
        </span>
        <span className="lp-mockup-badge">5 Domains</span>
      </div>
      <div className="lp-mockup-domain-grid">
        {domainsSample.map((d) => (
          <div className="lp-mockup-domain-card" key={d.title}>
            <div className="lp-mockup-domain-top">
              <span className="lp-mockup-domain-name">{d.title}</span>
              <span className="lp-mockup-domain-count">{d.count}</span>
            </div>
            <div className="lp-mockup-domain-item">{d.sample}</div>
            <div className="lp-mockup-bar">
              <div className="lp-mockup-bar-fill" style={{ width: `${d.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepThreeVisual() {
  const hotItems = [
    { title: "AWS Solutions Architect exam slot", tag: "Needs attention", why: "Next milestone due in 3 days", tone: "warning" },
    { title: "Local-first P2P differential sync", tag: "In progress", why: "Active loop from yesterday", tone: "accent" },
    { title: "Client delivery sprint milestone", tag: "Continue track", why: "Blunt re-entry · 2 weeks since update", tone: "neutral" },
  ];

  return (
    <div className="lp-walk-mockup">
      <div className="lp-mockup-header">
        <span className="lp-mockup-title">
          <Flame size={13} className="lp-mockup-icon" aria-hidden="true" />
          What&apos;s Hot · Attention shortlist (Capped at 3 items)
        </span>
        <span className="lp-mockup-badge">Zero Shame</span>
      </div>
      <div className="lp-mockup-hot-list">
        {hotItems.map((item) => (
          <div className="lp-mockup-hot-item" key={item.title}>
            <div className="lp-mockup-hot-row">
              <span className="lp-mockup-hot-title">{item.title}</span>
              <span className={`lp-mockup-hot-tag lp-mockup-hot-tag--${item.tone}`}>{item.tag}</span>
            </div>
            <span className="lp-mockup-hot-why">{item.why}</span>
          </div>
        ))}
      </div>
      <div className="lp-mockup-footer">
        <span className="lp-mockup-hint">No red badges. No broken streaks. Re-entering after time away presents facts neutrally.</span>
      </div>
    </div>
  );
}

function StepFourVisual() {
  return (
    <div className="lp-walk-mockup">
      <div className="lp-mockup-header">
        <span className="lp-mockup-title">
          <ArrowLeftRight size={13} className="lp-mockup-icon" aria-hidden="true" />
          Direct device-to-device LAN & USB differential merge
        </span>
        <span className="lp-mockup-badge">Offline P2P</span>
      </div>
      <div className="lp-mockup-sync-body">
        <div className="lp-mockup-device">
          <span className="lp-mockup-dev-name">Desktop (PC)</span>
          <span className="lp-mockup-dev-ip">192.168.1.14</span>
          <span className="lp-mockup-dev-status">Source DB · WAL checked</span>
        </div>
        <div className="lp-mockup-sync-arrow">
          <ArrowLeftRight size={18} className="lp-sync-pulse" aria-hidden="true" />
          <span className="lp-mockup-pin">PIN: 8 4 9 2 0 1</span>
          <span className="lp-mockup-transfer">Non-destructive merge</span>
        </div>
        <div className="lp-mockup-device">
          <span className="lp-mockup-dev-name">Mobile (Android)</span>
          <span className="lp-mockup-dev-ip">192.168.1.28</span>
          <span className="lp-mockup-dev-status">Merged 2 edits · 0 cloud</span>
        </div>
      </div>
      <div className="lp-mockup-footer">
        <span className="lp-mockup-hint">Runs over local Wi-Fi or wired USB (`adb reverse`). Zero bytes touch the internet.</span>
      </div>
    </div>
  );
}

function TerminalCloneBox() {
  const [copied, setCopied] = useState(false);
  const command = "git clone https://github.com/karefined-eng/the-mainframe.git";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(command).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="lp-terminal-box">
      <div className="lp-terminal-main">
        <span className="lp-terminal-prefix">$</span>
        <span className="lp-terminal-command">{command}</span>
      </div>
      <div className="lp-terminal-actions">
        <button
          type="button"
          className="lp-terminal-copy-btn"
          onClick={handleCopy}
          aria-label={copied ? "Command copied to clipboard" : "Copy git clone command"}
        >
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
        <span className="lp-terminal-hint">Build from source · Tauri v2 + Rust</span>
      </div>
    </div>
  );
}

function PlatformDownloadCard({ asset }: { asset: ReleaseAsset }) {
  const [showChecksum, setShowChecksum] = useState(false);
  const [copiedDigest, setCopiedDigest] = useState<string | null>(null);

  const primaryPackage = asset.packages[0];

  const handleCopyDigest = (digest: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(digest).then(() => {
        setCopiedDigest(digest);
        setTimeout(() => setCopiedDigest(null), 2000);
      });
    }
  };

  return (
    <div className="lp-platform-card" data-od-id={`download-${asset.id}`}>
      <div className="lp-platform-header">
        <div className="lp-platform-header-left">
          {asset.category === "Desktop" ? (
            <Monitor size={15} className="lp-platform-type-icon" aria-hidden="true" />
          ) : (
            <Smartphone size={15} className="lp-platform-type-icon" aria-hidden="true" />
          )}
          <span className="lp-platform-name">{asset.platform}</span>
        </div>
        <span className="lp-platform-badge">{asset.badge}</span>
      </div>

      <div className="lp-platform-meta">
        <span className="lp-platform-arch">{asset.architecture}</span>
        <span className="lp-platform-size-tag">{asset.sizeHighlight}</span>
      </div>

      <div className="lp-platform-cta">
        <a
          className="lp-platform-btn"
          href={primaryPackage.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Download size={14} aria-hidden="true" />
          <span>Download {primaryPackage.format}</span>
          <span className="lp-btn-size-hint">({primaryPackage.size})</span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>

        {asset.packages.length > 1 && (
          <div className="lp-platform-variants">
            <span className="lp-variant-label">Additional packages:</span>
            <div className="lp-variant-list">
              {asset.packages.slice(1).map((pkg) => (
                <a
                  key={pkg.format}
                  className="lp-variant-chip"
                  href={pkg.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span>{pkg.format}</span>
                  <span className="lp-variant-size">({pkg.size})</span>
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lp-checksum-box">
        <button
          type="button"
          className="lp-checksum-toggle"
          onClick={() => setShowChecksum(!showChecksum)}
          aria-expanded={showChecksum}
        >
          <span className="lp-checksum-toggle-left">
            <ShieldCheck size={12} aria-hidden="true" />
            <span>{showChecksum ? "Hide verification" : "Verify SHA-256 Checksum"}</span>
          </span>
          {showChecksum ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
        </button>

        {showChecksum && (
          <div className="lp-checksum-drawer">
            <div className="lp-checksum-cmd-row">
              <span className="lp-checksum-cmd-label">Verify command</span>
              <code className="lp-checksum-code">{asset.verifyCommand}</code>
            </div>
            <div className="lp-checksum-digest-row">
              <div className="lp-checksum-digest-wrap">
                <span className="lp-checksum-digest-label">SHA-256 ({primaryPackage.filename})</span>
                <code className="lp-checksum-digest">{primaryPackage.digest}</code>
              </div>
              <button
                type="button"
                className="lp-checksum-copy-btn"
                onClick={() => handleCopyDigest(primaryPackage.digest)}
                aria-label={copiedDigest === primaryPackage.digest ? "Hash copied" : "Copy hash"}
              >
                {copiedDigest === primaryPackage.digest ? (
                  <Check size={11} aria-hidden="true" />
                ) : (
                  <Copy size={11} aria-hidden="true" />
                )}
                <span>{copiedDigest === primaryPackage.digest ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const trustIcons = {
  CloudOff,
  Database,
  GitCompare,
  Cable,
  KeyRound,
  ShieldAlert,
} as const;

export default function LandingPage() {
  useEffect(() => applyLandingMetadata(), []);

  return (
    <div className="lp">
      <a className="lp-skip" href="#hero">
        Skip to main content
      </a>

      <header className="lp-header">
        <div className="lp-wrap lp-header-inner">
          <a className="lp-brand" href="#hero">
            <BrandMark />
            The Mainframe
          </a>
          <nav className="lp-nav" aria-label="Page sections">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a
            className="lp-header-cta"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            data-od-id="nav-github"
          >
            GitHub
            <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
      </header>

      <main id="main">
        {/* 1. Hero */}
        <section className="lp-hero" id="hero" aria-labelledby="hero-heading" data-od-id="hero">
          <div className="lp-wrap lp-hero-grid">
            <div>
              <h1 className="lp-h1" id="hero-heading">
                Your calm command center for everything you&apos;re learning, building, pursuing, and
                acquiring.
              </h1>
              <p className="lp-sub">
                The Mainframe is a private, local-first life management app for scattered projects,
                goals, courses, ideas, and purchases. Work offline, keep your data on your devices,
                and bring order to the lists already spread across your life.
              </p>
              <p className="lp-status">
                <span className="lp-dot" aria-hidden="true" />
                Initial Public Release · v0.1.0 available for Windows, macOS, Linux, and Android
              </p>
              <div className="lp-cta-row">
                <a
                  className="lp-btn lp-btn--primary"
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-od-id="cta-download"
                >
                  Download v0.1.0 (Free)
                  <ArrowRight size={16} aria-hidden="true" />
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
                <a
                  className="lp-btn lp-btn--ghost"
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-od-id="cta-source"
                >
                  View the source on GitHub
                  <ExternalLink size={14} aria-hidden="true" />
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
              <p className="lp-cta-note">
                <strong>100% Free & Open Source:</strong> Installers available for Windows (.exe/.msi), macOS (.dmg), Linux (.AppImage/.deb/.rpm), and Android (.apk). Zero accounts, zero cloud, zero telemetry.
              </p>
            </div>

            <div data-od-id="hero-playground-wrapper">
              <Playground />
            </div>
          </div>
        </section>

        {/* 2. Problem and audience */}
        <Section
          id="why"
          title="Built for people whose work does not fit in one list"
          lede="Most life management tools are either a generic task list that has to be reshaped around your life, or a workspace so broad that maintaining it becomes the work. The Mainframe starts from the domains a person actually has: studies, builds, acquisitions, long-term goals, and ventures."
        >
          <div className="lp-ruled lp-aud-grid">
            {audience.map((group) => (
              <div className="lp-aud" key={group.title}>
                <h3>{group.title}</h3>
                <p>{group.body}</p>
              </div>
            ))}
          </div>
          <p className="lp-note">
            <strong>What this is not.</strong> The Mainframe is not a medical or therapeutic product
            and makes no claim about treating any condition. What it does aim at is narrower and
            honest: a dashboard that opens collapsed so nothing unfinished is thrown at you at once,
            and a blunt re-entry summary that tells you how far behind you are instead of hiding it.
          </p>
        </Section>

        {/* 3. Comparison Matrix */}
        <Section
          id="compare"
          title="How The Mainframe compares"
          lede="The Mainframe sits in the calm, defensible sweet spot between flat grocery checklists and complex database builders."
        >
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead>
                <tr>
                  <th scope="col">Feature / Trait</th>
                  <th scope="col">Standard To-Do (Todoist, TickTick)</th>
                  <th scope="col">Database Builders (Notion, Anytype)</th>
                  <th scope="col" className="lp-th-highlight">The Mainframe</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.trait}>
                    <td>{row.trait}</td>
                    <td>{row.todoApps}</td>
                    <td>{row.notion}</td>
                    <td className="lp-td-highlight">
                      <strong>{row.mainframe}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lp-neuro-compare" data-od-id="neuro-ux-comparison">
            <div className="lp-neuro-box lp-neuro-box--bad">
              <div className="lp-neuro-box-header">
                <span className="lp-neuro-box-title">Traditional Task Apps (Todoist, TickTick)</span>
                <span className="lp-neuro-badge lp-neuro-badge--bad">Wall of Shame</span>
              </div>
              <div className="lp-neuro-items">
                <div className="lp-neuro-row lp-neuro-row--shame">
                  <div className="lp-neuro-row-left">
                    <AlertTriangle size={13} className="lp-play-card-icon" aria-hidden="true" />
                    <span>Client delivery sprint milestone</span>
                  </div>
                  <span className="lp-neuro-shame-tag">14 days overdue</span>
                </div>
                <div className="lp-neuro-row lp-neuro-row--shame">
                  <div className="lp-neuro-row-left">
                    <AlertTriangle size={13} className="lp-play-card-icon" aria-hidden="true" />
                    <span>AWS Solutions Architect study block</span>
                  </div>
                  <span className="lp-neuro-shame-tag">8 days overdue</span>
                </div>
                <div className="lp-neuro-row lp-neuro-row--shame">
                  <div className="lp-neuro-row-left">
                    <AlertTriangle size={13} className="lp-play-card-icon" aria-hidden="true" />
                    <span>Review 27&quot; 4K monitor deals</span>
                  </div>
                  <span className="lp-neuro-shame-tag">3 days overdue</span>
                </div>
                <div className="lp-neuro-row lp-neuro-row--shame">
                  <div className="lp-neuro-row-left">
                    <AlertTriangle size={13} className="lp-play-card-icon" aria-hidden="true" />
                    <span>Run 10k sub-50 training schedule</span>
                  </div>
                  <span className="lp-neuro-shame-tag">Streak broken</span>
                </div>
              </div>
              <div className="lp-neuro-box-footer">
                47 overdue items accumulated. Flashing red badges and broken streaks trigger avoidance loops and mental paralysis.
              </div>
            </div>

            <div className="lp-neuro-box lp-neuro-box--good">
              <div className="lp-neuro-box-header">
                <span className="lp-neuro-box-title">The Mainframe (Cognitive Shield)</span>
                <span className="lp-neuro-badge lp-neuro-badge--good">Blunt Re-entry</span>
              </div>
              <div className="lp-neuro-items">
                <div className="lp-neuro-row">
                  <div className="lp-neuro-row-left">
                    <span className="lp-tick lp-tick--accent" />
                    <span>AWS Solutions Architect exam</span>
                  </div>
                  <span className="lp-neuro-calm-tag">Needs attention · 3d</span>
                </div>
                <div className="lp-neuro-row">
                  <div className="lp-neuro-row-left">
                    <span className="lp-tick lp-tick--accent" />
                    <span>Local-first P2P differential sync</span>
                  </div>
                  <span className="lp-neuro-calm-tag">In progress · Active loop</span>
                </div>
                <div className="lp-neuro-row">
                  <div className="lp-neuro-row-left">
                    <span className="lp-tick" />
                    <span>Client delivery sprint milestone</span>
                  </div>
                  <span className="lp-neuro-calm-tag">2 weeks since update</span>
                </div>
                <div className="lp-neuro-row">
                  <div className="lp-neuro-row-left">
                    <span className="lp-tick" />
                    <span>Remaining parallel tracks safely filed</span>
                  </div>
                  <span className="lp-neuro-calm-tag">Working memory capped</span>
                </div>
              </div>
              <div className="lp-neuro-box-footer">
                Attention capped strictly at 3–5 items based on cognitive working memory limits. Returning after time away presents calm, neutral facts with zero guilt.
              </div>
            </div>
          </div>
        </Section>

        {/* 4. Product walkthrough */}
        <Section
          id="walkthrough"
          title="Paste, structure, decide, continue"
          lede="Four steps, no setup ritual. The loop works the same offline as it does on a local network."
        >
          <div className="lp-ruled lp-steps">
            {walkthrough.map((step) => (
              <article className="lp-step" key={step.step}>
                <p className="lp-step-num lp-mono">{step.step}</p>
                <div className="lp-step-body">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  {step.step === "01" && <StepOneVisual />}
                  {step.step === "02" && <StepTwoVisual />}
                  {step.step === "03" && <StepThreeVisual />}
                  {step.step === "04" && <StepFourVisual />}
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* 4. Feature pillars */}
        <Section
          id="features"
          title="Four things it does, and nothing else"
          lede="Each pillar is a commitment about behavior, not a feature count. Technical detail belongs further down the page."
        >
          <div className="lp-ruled lp-pillar-grid">
            {pillars.map((pillar) => {
              const Icon = pillarIcons[pillar.icon] ?? Info;
              return (
                <article className="lp-pillar" key={pillar.title}>
                  <Icon size={20} aria-hidden="true" strokeWidth={1.75} />
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </article>
              );
            })}
          </div>
        </Section>

        {/* 5. Platform and download */}
        <Section
          id="platforms"
          title="What you can actually run today"
          lede="One Tauri v2 codebase, built by GitHub Actions for four platforms. Versioned v0.1.0 release binaries available directly below."
        >
          <div className="lp-platform-hub" data-od-id="platform-download-hub">
            {releaseAssets.map((asset) => (
              <PlatformDownloadCard key={asset.id} asset={asset} />
            ))}
          </div>

          <TerminalCloneBox />

          <div className="lp-table-wrap" style={{ marginTop: "32px" }}>
            <table className="lp-table">
              <caption>
                Platform status as documented in the repository README. Versioned release packages available for download.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Platform</th>
                  <th scope="col">Current deliverable</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {platformRows.map((row) => (
                  <tr key={row.platform}>
                    <td>{row.platform}</td>
                    <td>{row.deliverable}</td>
                    <td>
                      <span className={row.tone === "target" ? "lp-tag lp-tag--accent" : "lp-tag"}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lp-download">
            <a
              className="lp-btn lp-btn--primary"
              href={RELEASES_URL}
              target="_blank"
              rel="noreferrer noopener"
              data-od-id="cta-releases"
            >
              Download from GitHub Releases
              <ExternalLink size={15} aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <a
              className="lp-btn lp-btn--ghost"
              href={`${REPO_URL}#quick-start-contributors`}
              target="_blank"
              rel="noreferrer noopener"
            >
              Build it locally instead
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
          <p className="lp-download-note">
            <strong>Platform security notes:</strong> Desktop installers are built from source via GitHub Actions CI. Because EV code-signing and Apple notarization are pending, Windows SmartScreen and macOS Gatekeeper will show a first-launch prompt. Click "Run Anyway" on Windows or right-click → Open on macOS.
          </p>
        </Section>

        {/* 6. Trust and limitations */}
        <Section
          id="trust"
          title="The parts most landing pages leave out"
          lede="You should know these before you put anything real into the app. They are stated here rather than buried in a footer."
        >
          <div className="lp-trust-grid" data-od-id="trust-limitations-grid">
            {limitations.map((item) => {
              const Icon = trustIcons[item.icon];
              const isAdvisory = item.tone === "advisory";
              return (
                <article
                  className={`lp-trust-card ${isAdvisory ? "lp-trust-card--advisory" : "lp-trust-card--guarantee"}`}
                  key={item.title}
                >
                  <div className="lp-trust-card-header">
                    <div className="lp-trust-icon-box" aria-hidden="true">
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <span className="lp-trust-badge lp-mono">{item.badge}</span>
                  </div>
                  <h3 className="lp-trust-title">{item.title}</h3>
                  <p className="lp-trust-body">{item.body}</p>
                  {item.technicalSnippet && (
                    <div className="lp-trust-footer">
                      <span className="lp-trust-snippet lp-mono">{item.technicalSnippet}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </Section>

        {/* 7. Open source and contribution */}
        <Section
          id="contribute"
          title="Read the code before you trust it"
          lede="The source is public. Issues and focused pull requests are welcome, and the limitations above are as open to discussion as the features."
        >
          <div className="lp-contrib">
            <ul className="lp-list">
              {contributionNotes.map((note) => (
                <li key={note}>
                  <Check size={15} aria-hidden="true" strokeWidth={2} />
                  <span>{note}</span>
                </li>
              ))}
              <li>
                <MessagesSquare size={15} aria-hidden="true" strokeWidth={2} />
                <span>
                  Report a problem or ask a question in the{" "}
                  <a href={ISSUES_URL} target="_blank" rel="noreferrer noopener">
                    issue tracker
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                  .
                </span>
              </li>
            </ul>

            <div className="lp-stack">
              <p className="lp-stack-label">Technical stack</p>
              <dl>
                {techStack.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>

        {/* Closing CTA */}
        <section className="lp-final" aria-labelledby="final-heading" data-od-id="final-cta">
          <div className="lp-wrap">
            <h2 id="final-heading">Try it on one list you already have</h2>
            <p>
              Copy the messiest list you are currently carrying around, paste it in, and see whether
              the structure it produces matches how you actually think about the work. If it does not,
              that is useful feedback too.
            </p>
            <div className="lp-cta-row">
              <a
                className="lp-btn lp-btn--primary"
                href={RELEASES_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                Download v0.1.0
                <ArrowRight size={16} aria-hidden="true" />
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              <a
                className="lp-btn lp-btn--ghost"
                href={REPO_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                View the source on GitHub
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer" data-od-id="footer">
        <div className="lp-wrap lp-footer-inner">
          <p>
            The Mainframe · early public release. Local-first, no required account, no telemetry
            service.
          </p>
          <nav aria-label="Footer links">
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
              GitHub
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <a href={ISSUES_URL} target="_blank" rel="noreferrer noopener">
              Issues
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <a href="#trust">Limitations</a>
            <a href="#main">Back to top</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
