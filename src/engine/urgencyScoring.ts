import type { BaseItem, DomainKey } from "../App";
import { daysSinceTimestamp, daysUntilDate } from "../utils/dateWindow.ts";

const domainImportance: Record<DomainKey, number> = {
  certifications: 1,
  acquisitions: 0,
  goals: 1,
  build_ideas: 1,
  ventures: 2,
  writing: 0,
  skills: 1,
  experiences: 0,
  journal: 0,
};

const bandThresholds: Record<string, { dormant: number; gentle: number; active: number; urgent: number }> = {
  minimal: { dormant: 0, gentle: 5, active: 8, urgent: 11 },
  balanced: { dormant: 0, gentle: 3, active: 6, urgent: 9 },
  intensive: { dormant: 0, gentle: 2, active: 4, urgent: 7 },
};

export type UrgencyBand = "dormant" | "gentle" | "active" | "urgent";

export function computeUrgencyScore(item: BaseItem, domain: DomainKey, now = new Date()): number {
  let importance = domainImportance[domain];
  if (domain === "acquisitions" && item.priority === "high") importance = 1;

  const daysUntilTarget = daysUntilDate(item.target_date, now);
  let daysScore = 0;
  if (daysUntilTarget !== null) {
    if (daysUntilTarget < 0) daysScore = 5;
    else if (daysUntilTarget <= 2) daysScore = 4;
    else if (daysUntilTarget <= 6) daysScore = 3;
    else if (daysUntilTarget <= 14) daysScore = 2;
    else if (daysUntilTarget <= 30) daysScore = 1;
  }

  const staleDays = daysSinceTimestamp(item.updated_at || item.created_at, now);
  let staleScore = 0;
  if (staleDays >= 21) staleScore = 2;
  else if (staleDays >= 7) staleScore = 1;

  const triggerDiscount = item.action_trigger ? -1 : 0;
  return importance + daysScore + staleScore + triggerDiscount;
}

export function getUrgencyBand(score: number, density = "balanced"): UrgencyBand {
  const thresholds = bandThresholds[density] || bandThresholds.balanced;
  if (score >= thresholds.urgent) return "urgent";
  if (score >= thresholds.active) return "active";
  if (score >= thresholds.gentle) return "gentle";
  return "dormant";
}

export function getUrgencyReasons(
  item: BaseItem,
  domain: DomainKey,
  now = new Date(),
): string[] {
  const reasons: string[] = [];
  const daysUntilTarget = daysUntilDate(item.target_date, now);
  if (daysUntilTarget !== null) {
    if (daysUntilTarget < 0) {
      const days = Math.abs(daysUntilTarget);
      reasons.push(`Overdue by ${days} day${days === 1 ? "" : "s"}`);
    } else if (daysUntilTarget === 0) {
      reasons.push("Due today");
    } else if (daysUntilTarget <= 2) {
      reasons.push(`Due in ${daysUntilTarget} day${daysUntilTarget === 1 ? "" : "s"}`);
    } else if (daysUntilTarget <= 6) {
      reasons.push("Due this week");
    } else if (daysUntilTarget <= 14) {
      reasons.push("Due within two weeks");
    } else if (daysUntilTarget <= 30) {
      reasons.push("Due within 30 days");
    }
  }

  const staleDays = daysSinceTimestamp(item.updated_at || item.created_at, now);
  if (staleDays >= 7) reasons.push(`No update in ${staleDays} days`);
  if (item.status === "in_progress") reasons.push("Also marked in progress");
  if (domain === "acquisitions" && item.priority === "high") reasons.push("High priority");
  if (reasons.length === 0) reasons.push("Included by the current urgency profile");
  return reasons;
}
