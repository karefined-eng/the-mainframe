import { useEffect, useState, useCallback } from "react";
import { getDb } from "../App";

interface NotifEntry {
  id: number;
  domain: string;
  row_id: number;
  message: string;
  fired_at: string;
  dismissed: number;
}

export default function NotificationLog() {
  const [entries, setEntries] = useState<NotifEntry[]>([]);

  const load = useCallback(async () => {
    const db = await getDb();
    const rows = await db.select<NotifEntry[]>(
      `SELECT * FROM notification_log ORDER BY fired_at DESC LIMIT 50`,
    );
    setEntries(rows);
  }, []);

  useEffect(() => { load(); }, [load]);

  const dismiss = async (id: number) => {
    const db = await getDb();
    await db.execute(`UPDATE notification_log SET dismissed = 1 WHERE id = $1`, [id]);
    await load();
  };

  const active = entries.filter((e) => !e.dismissed);
  const dismissed = entries.filter((e) => e.dismissed);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 text-base font-semibold">Notifications</h3>

      {active.length === 0 && dismissed.length === 0 && (
        <p className="text-sm text-text-muted">No notifications yet.</p>
      )}

      {active.length > 0 && (
        <div className="flex flex-col gap-2">
          {active.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-3 rounded-xl border border-accent/20 bg-surface-alt px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm text-text">{e.message}</p>
                <small className="text-xs text-text-muted">
                  {e.domain} · {new Date(e.fired_at).toLocaleDateString()}
                </small>
              </div>
              <button
                onClick={() => dismiss(e.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {dismissed.length > 0 && (
        <details className="text-sm">
          <summary className="text-text-muted cursor-pointer hover:text-text transition-colors">
            {dismissed.length} dismissed
          </summary>
          <div className="flex flex-col gap-1 mt-2">
            {dismissed.map((e) => (
              <div key={e.id} className="rounded-lg bg-surface-alt/50 px-3 py-2 text-text-muted/60 text-xs">
                {e.message} — {new Date(e.fired_at).toLocaleDateString()}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
