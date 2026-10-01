import { ArrowRight, Clock3, Flame, RotateCcw } from "lucide-react";
import type { DomainCounts, DomainInfo, DomainKey } from "../App";
import type { DashboardEntry, HotItem, ReentrySummary } from "../engine/dashboardModel";
import { formatTargetDate } from "../utils/dateWindow";

interface DashboardHomeProps {
  domains: readonly DomainInfo[];
  counts: DomainCounts;
  hotItems: HotItem[];
  reentry: ReentrySummary | null;
  loaded: boolean;
  onSelectDomain: (domain: DomainKey) => void;
  onOpenItem: (domain: DomainKey, itemId: number) => void;
}

const bandLabels = {
  urgent: "Urgent",
  active: "Active",
  gentle: "Worth planning",
  dormant: "Quiet",
} as const;

function EntryButton({
  entry,
  label,
  onOpenItem,
}: {
  entry: DashboardEntry;
  label?: string;
  onOpenItem: (domain: DomainKey, itemId: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenItem(entry.domain, entry.item.id)}
      className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`Open ${entry.item.title} in ${entry.domainLabel}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-text">{entry.item.title}</span>
        <span className="mt-0.5 block text-xs text-text-muted">
          {entry.domainLabel}{label ? ` · ${label}` : ""}
        </span>
      </span>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-text-muted" />
    </button>
  );
}

export default function DashboardHome({
  domains,
  counts,
  hotItems,
  reentry,
  loaded,
  onSelectDomain,
  onOpenItem,
}: DashboardHomeProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface-alt p-4 sm:p-5" aria-labelledby="whats-hot-heading">
          <div className="flex items-start gap-3">
            <Flame className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <h2 id="whats-hot-heading" className="m-0 text-base font-semibold">What&apos;s Hot</h2>
              <p className="mb-0 mt-1 text-xs leading-relaxed text-text-muted">
                A short, optional cross-domain shortlist. Each suggestion includes why it surfaced; it is not a required queue.
              </p>
            </div>
          </div>

          {!loaded ? (
            <p className="mb-0 mt-4 text-sm text-text-muted">Loading current priorities…</p>
          ) : hotItems.length === 0 ? (
            <p className="mb-0 mt-4 rounded-xl border border-border px-3 py-4 text-sm text-text-muted">
              Nothing currently meets the attention threshold. Your domains remain available below.
            </p>
          ) : (
            <ol className="mb-0 mt-3 list-none divide-y divide-border p-0">
              {hotItems.map((entry) => (
                <li key={`${entry.domain}-${entry.item.id}`}>
                  <button
                    type="button"
                    onClick={() => onOpenItem(entry.domain, entry.item.id)}
                    className="w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`Open ${entry.item.title} in ${entry.domainLabel}`}
                  >
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{entry.item.title}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-text-muted">{entry.domainLabel}</span>
                      <span className={`text-[11px] font-medium ${entry.band === "urgent" ? "text-warning" : "text-accent"}`}>
                        {bandLabels[entry.band]}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-text-muted">{entry.reasons.join(" · ")}</span>
                    {Boolean(entry.item.action_trigger) && (
                      <span className="mt-1.5 block border-l-2 border-accent/50 pl-2 text-xs text-text">
                        {String(entry.item.action_trigger)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface-alt p-4 sm:p-5" aria-labelledby="reentry-heading">
          <div className="flex items-start gap-3">
            <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <h2 id="reentry-heading" className="m-0 text-base font-semibold">Re-entry</h2>
              <p className="mb-0 mt-1 text-xs leading-relaxed text-text-muted">
                A factual snapshot of overdue work and changes since this device was last opened.
              </p>
            </div>
          </div>

          {!loaded || !reentry ? (
            <p className="mb-0 mt-4 text-sm text-text-muted">Loading recent activity…</p>
          ) : (
            <>
              {!reentry.hasPreviousVisit && (
                <p className="mb-0 mt-3 rounded-xl border border-border px-3 py-3 text-sm text-text-muted">
                  First visit recorded on this device. Future visits will show what changed since then.
                </p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-bg/40 px-3 py-2.5">
                  <span className="block text-xs text-text-muted">Overdue</span>
                  <span className="mt-0.5 block text-xl font-semibold text-text">{reentry.overdueCount}</span>
                </div>
                <div className="rounded-xl border border-border bg-bg/40 px-3 py-2.5">
                  <span className="block text-xs text-text-muted">Changed since last visit</span>
                  <span className="mt-0.5 block text-xl font-semibold text-text">{reentry.hasPreviousVisit ? reentry.changedCount : "—"}</span>
                </div>
              </div>

              {reentry.hasPreviousVisit && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <ReentryList
                    title="Overdue items"
                    icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
                    count={reentry.overdueCount}
                    entries={reentry.overdueItems}
                    emptyText="No overdue items."
                    onOpenItem={onOpenItem}
                  />
                  <ReentryList
                    title="Changed items"
                    count={reentry.changedCount}
                    entries={reentry.changedItems}
                    emptyText="No items changed since your last visit."
                    onOpenItem={onOpenItem}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3" aria-label="Your domains">
        {domains.map((domain) => (
          <button
            key={domain.key}
            type="button"
            onClick={() => onSelectDomain(domain.key)}
            className="group rounded-2xl border border-border bg-surface-alt p-3 text-left transition-all hover:border-accent/60 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="mb-2 flex flex-col gap-2">
              <domain.icon className="h-6 w-6 text-accent" aria-hidden="true" />
              <h2 className="m-0 text-sm font-semibold leading-tight">{domain.label}</h2>
            </div>
            {counts[domain.key] > 0 ? (
              <p className="m-0 text-sm text-text-muted">
                {counts[domain.key]} item{counts[domain.key] !== 1 ? "s" : ""}
              </p>
            ) : (
              <p className="m-0 text-xs text-accent/70">
                Empty <ArrowRight className="ml-0.5 inline-block h-3 w-3" aria-hidden="true" />
              </p>
            )}
          </button>
        ))}
      </section>
    </div>
  );
}

function ReentryList({
  title,
  icon,
  count,
  entries,
  emptyText,
  onOpenItem,
}: {
  title: string;
  icon?: React.ReactNode;
  count: number;
  entries: DashboardEntry[];
  emptyText: string;
  onOpenItem: (domain: DomainKey, itemId: number) => void;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-1 mt-0 flex items-center gap-1.5 text-xs font-semibold text-text-muted">
        {icon}
        {title} <span>({count})</span>
      </h3>
      {entries.length > 0 ? (
        <div className="-mx-1">
          {entries.map((entry) => (
            <EntryButton
              key={`${entry.domain}-${entry.item.id}`}
              entry={entry}
              label={entry.item.target_date ? formatTargetDate(entry.item.target_date) : entry.item.status.replace(/_/g, " ")}
              onOpenItem={onOpenItem}
            />
          ))}
          {count > entries.length && (
            <p className="mb-0 ml-3 mt-1 text-xs text-text-muted">+ {count - entries.length} more</p>
          )}
        </div>
      ) : (
        <p className="mb-0 mt-2 text-xs text-text-muted">{emptyText}</p>
      )}
    </div>
  );
}
