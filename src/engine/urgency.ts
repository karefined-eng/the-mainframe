import type { BaseItem } from "../App";
import { getDb, domains } from "../App";
import { showToast } from "../components/Toast";
import {
  computeUrgencyScore,
  getUrgencyBand,
} from "./urgencyScoring";

export { computeUrgencyScore, getUrgencyBand, getUrgencyReasons } from "./urgencyScoring";

function generateMessage(item: BaseItem, band: "dormant" | "gentle" | "active" | "urgent"): string {
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

      const score = computeUrgencyScore(item, d.key);
      const band = getUrgencyBand(score, density);

      if (band === "dormant") continue;

      // Check if we already notified at this band level
      const lastScore = item.last_notified_score as number | null;
      const lastNotified = item.last_notified_at as string | null;

      // Don't re-fire if same band
      if (lastScore !== null) {
        const lastBand = getUrgencyBand(lastScore, density);
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
