import type { DomainKey, BaseItem } from "../App";
import { getDb, domains } from "../App";
import { showToast } from "../components/Toast";

// Per-domain importance defaults (doc 06 §2.2)
const domainImportance: Record<DomainKey, number> = {
  courses: 1,
  acquisitions: 0,
  goals: 1,
  build_ideas: 1,
  ventures: 2,
};

// Score thresholds scaled by density setting
const bandThresholds: Record<string, { dormant: number; gentle: number; active: number; urgent: number }> = {
  minimal:   { dormant: 0, gentle: 5, active: 8, urgent: 11 },
  balanced:  { dormant: 0, gentle: 3, active: 6, urgent: 9 },
  intensive: { dormant: 0, gentle: 2, active: 4, urgent: 7 },
};

type Band = "dormant" | "gentle" | "active" | "urgent";

function computeScore(item: BaseItem, domain: DomainKey): number {
  // importance
  let importance = domainImportance[domain];
  if (domain === "acquisitions" && item.priority === "high") importance = 1;

  // days_until_target
  let daysScore = 0;
  if (item.target_date) {
    const diff = Math.ceil(
      (new Date(item.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0) daysScore = 5;       // overdue
    else if (diff <= 2) daysScore = 4;
    else if (diff <= 6) daysScore = 3;
    else if (diff <= 14) daysScore = 2;
    else if (diff <= 30) daysScore = 1;
  }

  // staleness
  const lastTouched = item.updated_at || item.created_at;
  const staleDays = Math.floor(
    (Date.now() - new Date(lastTouched).getTime()) / (1000 * 60 * 60 * 24),
  );
  let staleScore = 0;
  if (staleDays >= 21) staleScore = 2;
  else if (staleDays >= 7) staleScore = 1;

  // action_trigger discount
  const triggerDiscount = item.action_trigger ? -1 : 0;

  return importance + daysScore + staleScore + triggerDiscount;
}

function getBand(score: number, density: string): Band {
  const t = bandThresholds[density] || bandThresholds.balanced;
  if (score >= t.urgent) return "urgent";
  if (score >= t.active) return "active";
  if (score >= t.gentle) return "gentle";
  return "dormant";
}

function generateMessage(item: BaseItem, band: Band): string {
  // If action_trigger exists, quote it verbatim (doc 06 §3)
  if (item.action_trigger) return item.action_trigger as string;

  switch (band) {
    case "gentle":
      return `"${item.title}" — worth planning soon`;
    case "active":
      return `"${item.title}" needs attention`;
    case "urgent":
      return `"${item.title}" is overdue or urgent`;
    default:
      return item.title;
  }
}

/**
 * Run urgency scoring on app open.
 * Computes scores for all non-done items, fires notifications for threshold crossings.
 * Returns count of notifications fired.
 */
export async function runUrgencyCheck(): Promise<number> {
  const db = await getDb();

  // Get density setting
  const settings = await db.select<{ value: string }[]>(
    `SELECT value FROM app_settings WHERE key = 'notification_density'`,
  );
  const density = settings[0]?.value || "balanced";

  // Get today's fired count for global cap
  const todayStr = new Date().toISOString().slice(0, 10);
  const firedToday = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) AS count FROM notification_log WHERE fired_at >= $1`,
    [todayStr],
  );
  let dailyCount = firedToday[0]?.count ?? 0;
  const DAILY_CAP = 5;

  let totalFired = 0;

  for (const d of domains) {
    const items = await db.select<BaseItem[]>(
      `SELECT * FROM ${d.key} WHERE status != 'done'`,
    );

    for (const item of items) {
      if (dailyCount >= DAILY_CAP) break;

      const score = computeScore(item, d.key);
      const band = getBand(score, density);

      if (band === "dormant") continue;

      // Check if we already notified at this band level
      const lastScore = item.last_notified_score as number | null;
      const lastNotified = item.last_notified_at as string | null;

      // Don't re-fire if same band
      if (lastScore !== null) {
        const lastBand = getBand(lastScore, density);
        if (lastBand === band) {
          // Exception: active band gets a 7-day follow-up if no status change
          if (band === "active" && lastNotified) {
            const daysSinceNotified = Math.floor(
              (Date.now() - new Date(lastNotified).getTime()) / (1000 * 60 * 60 * 24),
            );
            if (daysSinceNotified < 7) continue;
          }
          // Exception: urgent gets once per 24h
          else if (band === "urgent" && lastNotified) {
            const hoursSince = (Date.now() - new Date(lastNotified).getTime()) / (1000 * 60 * 60);
            if (hoursSince < 24) continue;
          } else {
            continue;
          }
        }
      }

      // Fire notification
      const message = generateMessage(item, band);

      await db.execute(
        `INSERT INTO notification_log (domain, row_id, message) VALUES ($1, $2, $3)`,
        [d.key, item.id, message],
      );

      await db.execute(
        `UPDATE ${d.key} SET last_notified_at = datetime('now'), last_notified_score = $1 WHERE id = $2`,
        [score, item.id],
      );

      dailyCount++;
      totalFired++;
    }
  }

  if (totalFired > 0) {
    showToast(`${totalFired} notification${totalFired !== 1 ? "s" : ""} fired`, "info");
  }

  return totalFired;
}
