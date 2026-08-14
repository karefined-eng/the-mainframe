import { useEffect, useRef } from "react";
import { getDb, type DomainKey } from "../App";

// Safe wrapper for notifications using native Web Notification API
async function notify(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  
  if (Notification.permission === "granted") {
    try {
      new Notification(title, { body });
    } catch (e) {
      console.warn("Could not dispatch notification:", e);
    }
  }
}

const DOMAINS: DomainKey[] = [
  "certifications",
  "acquisitions",
  "goals",
  "build_ideas",
  "ventures",
  "writing",
  "skills",
  "experiences",
];

interface UnfinishedItem {
  id: number;
  domain: DomainKey;
  title: string;
  action_trigger?: string;
}

export default function NotificationEngine() {
  const isRunning = useRef(false);

  useEffect(() => {

    // Check every 30 minutes for retention hooks
    const checkAndNotify = async () => {
      if (isRunning.current) return;
      isRunning.current = true;

      try {
        if (typeof window === "undefined" || !("Notification" in window)) {
          isRunning.current = false;
          return;
        }

        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }

        if (Notification.permission !== "granted") {
          isRunning.current = false;
          return;
        }

        const db = await getDb();

        // -------------------------------------------------------------
        // TRACK 1: Calendar / Exact Date & Time Alerts (Priority 1)
        // -------------------------------------------------------------
        let calendarItem: (UnfinishedItem & { target_date?: string; target_time?: string }) | null = null;

        for (const domain of DOMAINS) {
          // Check for items scheduled for today that haven't been notified today
          const rows = await db.select<(UnfinishedItem & { target_date?: string; target_time?: string })[]>(
            `SELECT id, title, action_trigger, target_date, target_time FROM ${domain}
             WHERE status != 'done'
             AND target_date IS NOT NULL
             AND target_date <= date('now', 'localtime')
             AND (target_time IS NULL OR target_time <= time('now', 'localtime'))
             AND (last_notified_at IS NULL OR last_notified_at < date('now', 'localtime'))
             ORDER BY target_date ASC, target_time ASC
             LIMIT 1`
          );

          if (rows.length > 0) {
            calendarItem = { ...rows[0], domain };
            break;
          }
        }

        if (calendarItem) {
          const body = calendarItem.action_trigger
            ? `Scheduled for today: ${calendarItem.action_trigger}`
            : `Scheduled item due: "${calendarItem.title}".`;

          notify("Mainframe Calendar Due", body);

          await db.execute(
            `UPDATE ${calendarItem.domain} SET last_notified_at = datetime('now') WHERE id = $1`,
            [calendarItem.id]
          );

          await db.execute(
            `INSERT INTO notification_log (domain, row_id, message) VALUES ($1, $2, $3)`,
            [calendarItem.domain, calendarItem.id, body]
          );

          isRunning.current = false;
          return;
        }

        // -------------------------------------------------------------
        // TRACK 2: Continuous Round-Robin Cycle (All Dateless / Backlog items)
        // -------------------------------------------------------------
        // Cycles through EVERY item across all domains so nothing is forgotten
        let candidateItems: (UnfinishedItem & { last_notified_at?: string })[] = [];

        for (const domain of DOMAINS) {
          const rows = await db.select<(UnfinishedItem & { last_notified_at?: string })[]>(
            `SELECT id, title, action_trigger, last_notified_at FROM ${domain}
             WHERE status != 'done'
             ORDER BY COALESCE(last_notified_at, '1970-01-01 00:00:00') ASC
             LIMIT 1`
          );

          if (rows.length > 0) {
            candidateItems.push({ ...rows[0], domain });
          }
        }

        if (candidateItems.length > 0) {
          // Sort across all 8 domains to find the single oldest-notified item overall
          candidateItems.sort((a, b) => {
            const timeA = a.last_notified_at ? new Date(a.last_notified_at).getTime() : 0;
            const timeB = b.last_notified_at ? new Date(b.last_notified_at).getTime() : 0;
            return timeA - timeB;
          });

          const oldestItem = candidateItems[0];
          const lastNotifiedMs = oldestItem.last_notified_at ? new Date(oldestItem.last_notified_at).getTime() : 0;
          const hoursSinceLast = (Date.now() - lastNotifiedMs) / (1000 * 60 * 60);

          // Only nudge if it's never been notified, or at least 4 hours have passed since its last cycle
          if (!oldestItem.last_notified_at || hoursSinceLast >= 4) {
            const body = oldestItem.action_trigger
              ? `Backlog Recall: ${oldestItem.action_trigger}`
              : `Backlog Recall: "${oldestItem.title}". Ready to review?`;

            notify("Mainframe Recall Cycle", body);

            await db.execute(
              `UPDATE ${oldestItem.domain} SET last_notified_at = datetime('now') WHERE id = $1`,
              [oldestItem.id]
            );

            await db.execute(
              `INSERT INTO notification_log (domain, row_id, message) VALUES ($1, $2, $3)`,
              [oldestItem.domain, oldestItem.id, body]
            );
          }
        }
      } catch (err) {
        console.error("Error in NotificationEngine:", err);
      } finally {
        isRunning.current = false;
      }
    };

    // Run once 5 seconds after mounting, then every 30 minutes
    const initialTimer = setTimeout(checkAndNotify, 5000);
    const interval = setInterval(checkAndNotify, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return null;
}
