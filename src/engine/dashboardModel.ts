import type { BaseItem, DomainCounts, DomainKey } from "../App";
import { daysUntilDate, isTimestampAfter, parseUtcTimestamp } from "../utils/dateWindow.ts";
import {
  computeUrgencyScore,
  getUrgencyBand,
  getUrgencyReasons,
  type UrgencyBand,
} from "./urgencyScoring.ts";

export interface DomainSnapshot {
  key: DomainKey;
  label: string;
  items: BaseItem[];
}

export interface DashboardEntry {
  item: BaseItem;
  domain: DomainKey;
  domainLabel: string;
}

export interface HotItem extends DashboardEntry {
  score: number;
  band: UrgencyBand;
  reasons: string[];
}

export interface ReentrySummary {
  hasPreviousVisit: boolean;
  overdueCount: number;
  changedCount: number;
  overdueItems: DashboardEntry[];
  changedItems: DashboardEntry[];
}

export interface DashboardModel {
  counts: DomainCounts;
  hotItems: HotItem[];
  reentry: ReentrySummary;
}

function compareUpdatedDescending(a: DashboardEntry, b: DashboardEntry): number {
  const aTime = parseUtcTimestamp(a.item.updated_at) ?? 0;
  const bTime = parseUtcTimestamp(b.item.updated_at) ?? 0;
  return bTime - aTime;
}

function compareOverdueAscending(a: DashboardEntry, b: DashboardEntry): number {
  return (a.item.target_date ?? "").localeCompare(b.item.target_date ?? "");
}

export function buildDashboardModel(
  snapshots: DomainSnapshot[],
  previousVisitAt: string | null,
  density = "balanced",
  now = new Date(),
): DashboardModel {
  const counts = {} as DomainCounts;
  const allEntries = snapshots.flatMap((snapshot) => {
    counts[snapshot.key] = snapshot.items.length;
    return snapshot.items.map((item) => ({
      item,
      domain: snapshot.key,
      domainLabel: snapshot.label,
    }));
  });
  const activeEntries = allEntries.filter((entry) => entry.item.status !== "done");

  const hotItems = activeEntries
    .map((entry) => {
      const score = computeUrgencyScore(entry.item, entry.domain, now);
      return {
        ...entry,
        score,
        band: getUrgencyBand(score, density),
        reasons: getUrgencyReasons(entry.item, entry.domain, now),
      };
    })
    .filter((entry) => entry.band !== "dormant" || entry.item.status === "in_progress")
    .sort((a, b) => {
      const scoreDifference = b.score - a.score;
      if (scoreDifference !== 0) return scoreDifference;
      const progressDifference = Number(b.item.status === "in_progress") - Number(a.item.status === "in_progress");
      if (progressDifference !== 0) return progressDifference;
      const dateDifference = (a.item.target_date ?? "9999-12-31").localeCompare(b.item.target_date ?? "9999-12-31");
      return dateDifference || compareUpdatedDescending(a, b);
    })
    .slice(0, 5);

  const overdueItems = activeEntries
    .filter((entry) => (daysUntilDate(entry.item.target_date, now) ?? 0) < 0)
    .sort(compareOverdueAscending);
  const changedItems = previousVisitAt
    ? allEntries
        .filter((entry) => isTimestampAfter(entry.item.updated_at, previousVisitAt))
        .sort(compareUpdatedDescending)
    : [];

  return {
    counts,
    hotItems,
    reentry: {
      hasPreviousVisit: Boolean(previousVisitAt),
      overdueCount: overdueItems.length,
      changedCount: changedItems.length,
      overdueItems: overdueItems.slice(0, 3),
      changedItems: changedItems.slice(0, 3),
    },
  };
}
