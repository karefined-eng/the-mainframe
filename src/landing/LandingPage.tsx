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
 *   - No medical or health claim is made, and the page does not pre-argue
 *     against one either: the plan forbids claiming treatment, not defending
 *     against a claim nobody made.
 *   - No product depiction asserts a capability the app does not have. The hero
 *     panel is built from the real ingestion contract (src/components/PasteIngest.tsx):
 *     split on newlines, one row per non-empty line into the open domain,
 *     original line preserved, nothing else inferred. Attention reasons are the
 *     strings src/engine/urgencyScoring.ts can actually emit.
 *   - Walkthrough figures are honest placeholders; internal capture checklists
 *     stay in the plan document, not in public copy.
 *
 * `data-od-id` anchors mark the major regions so the page can be patched
 * section by section.
 */

import { useEffect, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  ClipboardPaste,
  ExternalLink,
  Flame,
  HardDrive,
  Info,
  Lock,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { applyLandingMetadata } from "./metadata";
import {
  ACTIONS_URL,
  ISSUES_URL,
  REPO_URL,
  audience,
  cautions,
  contributionNotes,
  guarantees,
  navLinks,
  pillars,
  platformRows,
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

/**
 * Hero demo data, constrained to what the real ingestion path produces.
 * Titles are the literal pasted lines (no prefix parsing, no title inference),
 * every row carries the same honest meta, and the attention reasons are quoted
 * from the string set in src/engine/urgencyScoring.ts.
 */
const pastedLines = [
  "AWS SAA - book exam slot",
  "LAN snapshot diff viewer",
  '27" 4K monitor',
  "Run 10k under 50 min",
];

const insertedRows = pastedLines.map((line) => ({
  title: line,
  meta: "Not started · no date",
}));

const attentionRows = [
  { title: "AWS SAA - book exam slot", why: "Due this week" },
  { title: "LAN snapshot diff viewer", why: "No update in 21 days" },
];

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

/**
 * Honest placeholder for a product screenshot: says the capture is coming
 * rather than showing a stand-in image or exposing the internal checklist.
 */
function ScreenshotSlot({ name }: { name: string }) {
  return (
    <figure className="lp-figure">
      <figcaption className="lp-figure-tag">{name}</figcaption>
      <p className="lp-figure-note">Screenshot coming with the first release.</p>
    </figure>
  );
}

export default function LandingPage() {
  useEffect(() => applyLandingMetadata(), []);

  return (
    <div className="lp">
      {/* First-party, cookie-free page-view counting, served from this site's
       * own origin. Mounted only here — the packaged app renders no landing
       * page and collects no telemetry. */}
      <Analytics />
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
            className="lp-textlink lp-header-cta"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main id="main">
        {/* 1. Hero */}
        <section className="lp-hero" id="hero" aria-labelledby="hero-heading" data-od-id="hero">
          <div className="lp-wrap lp-hero-grid">
            <div>
              <h1 className="lp-h1" id="hero-heading">
                A local-first home for every list you are already keeping.
              </h1>
              <p className="lp-sub">
                The Mainframe is a private, offline life-management app for scattered projects,
                goals, courses, ideas, and purchases. Paste the lists you already have, keep the
                database on your own devices, and bring some order to what is currently spread
                across notes, messages, and memory.
              </p>
              <p className="lp-status">
                <span className="lp-dot" aria-hidden="true" />
                Early public release · no versioned releases yet
              </p>
              <div className="lp-cta-row">
                <a
                  className="lp-btn lp-btn--primary"
                  href={ACTIONS_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-od-id="cta-download"
                >
                  Get a build from CI
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
                <a
                  className="lp-textlink"
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-od-id="cta-source"
                >
                  Read the source first
                </a>
              </div>
              <p className="lp-cta-note">
                Builds are unsigned CI artifacts, not releases — no accounts, no downloads page.{" "}
                <a href="#platforms">See platform status</a>.
              </p>
            </div>

            <div className="lp-panel" data-od-id="hero-panel">
              <div className="lp-panel-bar">
                <span className="lp-tick" />
                <span className="lp-tick" />
                <span className="lp-tick lp-tick--accent" />
                <span className="lp-panel-title">mainframe · local</span>
                <span className="lp-panel-live">
                  <Lock size={12} aria-hidden="true" />
                  offline
                </span>
              </div>
              <div className="lp-panel-body">
                <div className="lp-step-block">
                  <p className="lp-panel-label">
                    <span className="lp-panel-num lp-mono">01</span>
                    You paste 4 lines
                  </p>
                  <pre className="lp-raw">{pastedLines.join("\n")}</pre>
                </div>
                <div className="lp-step-block">
                  <p className="lp-panel-label">
                    <span className="lp-panel-num lp-mono">02</span>
                    You get 4 rows
                  </p>
                  <div className="lp-rows">
                    {insertedRows.map((row) => (
                      <div className="lp-row" key={row.title}>
                        <span className="lp-tick" />
                        <span className="lp-row-title">{row.title}</span>
                        <span className="lp-row-meta">{row.meta}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lp-step-block">
                  <p className="lp-panel-label">
                    <span className="lp-panel-num lp-mono">03</span>
                    Which need attention
                  </p>
                  <ul className="lp-hot">
                    {attentionRows.map((item) => (
                      <li key={item.title}>
                        <strong>{item.title}</strong>
                        <span>{item.why}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="lp-panel-disclosure">
                This is the whole transform. The app splits on newlines and files each line in the
                list you had open — it does not guess a domain or invent a due date.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Problem and audience */}
        <Section
          id="why"
          title="Built for people whose work does not fit in one list"
          lede="Most life tools are either a generic task list you have to reshape around your life, or a workspace so broad that maintaining it becomes the work. The Mainframe starts from the lists a person actually keeps: studies, builds, acquisitions, long-term goals, and ventures."
        >
          <div className="lp-ruled lp-aud-grid">
            {audience.map((group) => (
              <div className="lp-aud" key={group.title}>
                <h3>{group.title}</h3>
                <p>{group.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 3. Product walkthrough */}
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
                  <ScreenshotSlot name={step.asset} />
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
          lede="One Tauri v2 codebase, built by GitHub Actions for four platforms. Everything below is a build target, not a tested release."
        >
          <div className="lp-table-wrap">
            <table className="lp-table">
              <caption>
                Platform status as documented in the repository README. No platform is marked as
                tested or released.
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
                        {row.tone === "target" ? "Build target" : "Not configured"}
                      </span>
                      <span className="lp-table-status">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lp-download">
            <a
              className="lp-btn lp-btn--primary"
              href={ACTIONS_URL}
              target="_blank"
              rel="noreferrer noopener"
              data-od-id="cta-actions"
            >
              Open the Actions tab
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <a
              className="lp-btn lp-btn--ghost"
              href={`${REPO_URL}#quick-start-for-contributors`}
              target="_blank"
              rel="noreferrer noopener"
            >
              Build it locally instead
            </a>
          </div>
          <p className="lp-download-note">
            <strong>How to get a build:</strong> open the Actions tab, pick a <em>successful</em> run
            of the desktop or Android workflow, and download the artifact for your platform. Links to
            runs are not published here on purpose — an artifact only exists after a successful build,
            and this page will not point you at a build that failed. When versioning, signing, and
            device testing are done, these become versioned GitHub Releases.
          </p>
        </Section>

        {/* 6. Trust: two registers, because these are not the same kind of claim */}
        <Section
          id="trust"
          title="What it will not do, and what you should know"
          lede="Two different lists. The first is what the app will never do to you. The second is what is genuinely limited today — stated plainly, because you should know it before you put real work in."
        >
          <h3 className="lp-subhead" id="guarantees-heading">
            What it will not do
          </h3>
          <div className="lp-ruled lp-trust-grid" aria-labelledby="guarantees-heading">
            {guarantees.map((item) => (
              <article className="lp-trust lp-trust--good" key={item.title}>
                <ShieldCheck size={18} aria-hidden="true" strokeWidth={1.75} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>

          <h3 className="lp-subhead lp-subhead--spaced" id="cautions-heading">
            What you should know before trusting it
          </h3>
          <div className="lp-ruled lp-trust-grid" aria-labelledby="cautions-heading">
            {cautions.map((item) => (
              <article className="lp-trust" key={item.title}>
                <AlertTriangle size={18} aria-hidden="true" strokeWidth={1.75} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* 7. Open source and contribution */}
        <Section
          id="contribute"
          title="Read the code before you trust it"
          lede="The source is public, and the claims above are checkable in it. Issues and focused pull requests are welcome — the limitations are as open to discussion as the features."
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
              the rows it produces match how you actually think about the work. If they do not, that
              is useful feedback too.
            </p>
            <div className="lp-cta-row">
              <a
                className="lp-btn lp-btn--primary"
                href={ACTIONS_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                Get a build from CI
                <ExternalLink size={15} aria-hidden="true" />
              </a>
              <a
                className="lp-btn lp-btn--ghost"
                href={REPO_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                Read the source first
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
            </a>
            <a href={ISSUES_URL} target="_blank" rel="noreferrer noopener">
              Issues
            </a>
            <a href="#trust">Limitations</a>
            <a href="#hero">Back to top</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
