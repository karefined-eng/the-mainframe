import { useEffect, useState } from "react";
import { getDb, domains, type DomainKey } from "../App";
import { showToast } from "./Toast";
import { Bell, Database as DbIcon, Info } from "lucide-react";

type Density = "minimal" | "balanced" | "intensive";

export default function Settings() {
  const [density, setDensity] = useState<Density>("balanced");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dbStats, setDbStats] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const db = await getDb();
        // Load Settings
        const rows = await db.select<{ key: string, value: string }[]>(
          `SELECT * FROM app_settings WHERE key IN ('notification_density', 'notifications_enabled')`,
        );
        for (const row of rows) {
          if (row.key === 'notification_density') setDensity(row.value as Density);
          if (row.key === 'notifications_enabled') setNotificationsEnabled(row.value === 'true');
        }

        // Load DB Stats
        const stats: Record<string, number> = {};
        for (const d of domains) {
          const count = await db.select<{ count: number }[]>(`SELECT COUNT(*) as count FROM ${d.key}`);
          stats[d.key] = count[0]?.count ?? 0;
        }
        setDbStats(stats);
      } catch (err) {
        console.error("Failed to load settings or stats", err);
      }
    })();
  }, []);

  const saveSetting = async (key: string, val: string) => {
    try {
      const db = await getDb();
      await db.execute(
        `INSERT OR REPLACE INTO app_settings (key, value) VALUES ($1, $2)`,
        [key, val],
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      showToast("error", "Failed to save setting");
    }
  };

  const handleDensityChange = (d: Density) => {
    setDensity(d);
    saveSetting('notification_density', d);
  };

  const handleToggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    saveSetting('notifications_enabled', String(newVal));
  };

  const testNotification = () => {
    showToast("info", "This is a test notification!");
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="m-0 text-xl font-bold flex items-center gap-2">
        Settings
        {saved && <span className="text-xs font-normal text-success bg-success/10 px-2 py-0.5 rounded-full">Saved</span>}
      </h3>

      {/* Notifications Section */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-alt p-6">
        <h4 className="m-0 text-base font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          Notifications
        </h4>
        
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Enable Notifications</label>
            <p className="text-xs text-text-muted m-0">Allow the urgency engine to show toast alerts and logs.</p>
          </div>
          <button 
            onClick={handleToggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-accent' : 'bg-surface border border-border'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'left-7' : 'left-1 bg-text-muted'}`} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Notification Density</label>
          <div className="flex gap-2">
            {(["minimal", "balanced", "intensive"] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => handleDensityChange(d)}
                className={`rounded-lg border px-4 py-2 text-sm capitalize transition-all cursor-pointer ${
                  density === d
                    ? "bg-accent text-bg border-accent"
                    : "border-border text-text-muted hover:border-accent/50 hover:text-text"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-2 mb-0">
            {density === "minimal" && "Fewer notifications — only high-urgency items."}
            {density === "balanced" && "Default — notifications for items that need attention."}
            {density === "intensive" && "More proactive — notifies earlier and more often."}
          </p>
        </div>

        <div className="pt-2">
          <button 
            onClick={testNotification}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text hover:border-accent/50 transition-colors"
          >
            Test Notification
          </button>
        </div>
      </section>

      {/* Database Section */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-alt p-6">
        <h4 className="m-0 text-base font-semibold flex items-center gap-2">
          <DbIcon className="w-5 h-5 text-accent" />
          Database Information
        </h4>
        
        <div className="flex items-start gap-3 text-sm text-text-muted bg-surface p-4 rounded-xl border border-border">
          <Info className="w-5 h-5 shrink-0 text-accent/70" />
          <div>
            <p className="m-0 mb-1 font-medium text-text">Local SQLite Database</p>
            <p className="m-0">Your data is stored locally in <code>mainframe.db</code> within your app's data directory. No data leaves your machine.</p>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-text mb-3">Record Counts</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {domains.map(d => (
              <div key={d.key} className="bg-surface border border-border rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-text-muted">{d.label}</span>
                <span className="font-mono text-sm font-semibold">{dbStats[d.key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
