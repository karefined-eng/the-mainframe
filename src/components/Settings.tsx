import { useEffect, useState } from "react";
import { getDb, domains } from "../App";
import { showToast } from "./Toast";
import { Bell, Database as DbIcon, Info, Sparkles, Download, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { check } from "@tauri-apps/plugin-updater";

type Density = "minimal" | "balanced" | "intensive";
const validSettingKeys = new Set(["notification_density", "notifications_enabled"]);

export default function Settings() {
  const [density, setDensity] = useState<Density>("balanced");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dbStats, setDbStats] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  // Auto-updater state
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"idle" | "available" | "up_to_date" | "downloading" | "downloaded" | "error">("idle");
  const [updateInfo, setUpdateInfo] = useState<{ version: string; body?: string } | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleCheckForUpdates = async () => {
    setCheckingUpdate(true);
    setUpdateError(null);
    try {
      const isTauri = typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
      if (!isTauri) {
        setUpdateStatus("up_to_date");
        setCheckingUpdate(false);
        return;
      }
      const update = await check();
      if (update && update.available) {
        setUpdateInfo({ version: update.version, body: update.body });
        setUpdateStatus("available");
      } else {
        setUpdateStatus("up_to_date");
      }
    } catch (err) {
      console.error("Update check failed", err);
      setUpdateError(String(err));
      setUpdateStatus("error");
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleInstallUpdate = async () => {
    setUpdateStatus("downloading");
    setDownloadProgress(0);
    try {
      const update = await check();
      if (!update) throw new Error("No update found");
      let downloaded = 0;
      let total = 0;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength || 0;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (total > 0) {
            setDownloadProgress(Math.round((downloaded / total) * 100));
          }
        } else if (event.event === "Finished") {
          setUpdateStatus("downloaded");
        }
      });
      setUpdateStatus("downloaded");
    } catch (err) {
      console.error("Update install failed", err);
      setUpdateError(String(err));
      setUpdateStatus("error");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const db = await getDb();
        // Load Settings
        const rows = await db.select<{ key: string, value: string }[]>(
          `SELECT key, value FROM app_settings WHERE key IN ('notification_density', 'notifications_enabled')`,
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
      if (!validSettingKeys.has(key)) {
        throw new Error("Invalid setting key");
      }
      const db = await getDb();
      await db.execute(
        `INSERT OR REPLACE INTO app_settings (key, value) VALUES ($1, $2)`,
        [key, val],
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      showToast("Failed to save setting", "error");
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
    showToast("This is a test notification!", "info");
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

      {/* Application Updates Section */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-alt p-6">
        <div className="flex items-center justify-between">
          <h4 className="m-0 text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Application Updates
          </h4>
          <span className="text-xs font-mono text-text-muted bg-surface px-2.5 py-1 rounded-md border border-border">
            v0.1.0
          </span>
        </div>

        <p className="text-xs text-text-muted m-0">
          The Mainframe securely checks GitHub Releases for signed update packages and verifies cryptographic signatures before installing.
        </p>

        {updateStatus === "available" && updateInfo && (
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-text">New Version Available</span>
                <p className="text-xs text-accent font-mono m-0 mt-0.5">Version {updateInfo.version}</p>
              </div>
              <button
                onClick={handleInstallUpdate}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent/90 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Install Update
              </button>
            </div>
            {updateInfo.body && (
              <div className="text-xs text-text-muted max-h-32 overflow-y-auto bg-surface/50 p-2.5 rounded-lg border border-border">
                {updateInfo.body}
              </div>
            )}
          </div>
        )}

        {updateStatus === "downloading" && (
          <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Downloading update...</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {updateStatus === "downloaded" && (
          <div className="rounded-xl border border-success/30 bg-success/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Update ready to apply. Please restart the app.
            </div>
          </div>
        )}

        {updateStatus === "up_to_date" && (
          <div className="rounded-xl border border-border bg-surface p-3 flex items-center gap-2 text-xs text-text-muted">
            <CheckCircle2 className="w-4 h-4 text-success" />
            The Mainframe is up to date. You are running the latest version.
          </div>
        )}

        {updateStatus === "error" && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Update status: {updateError}</span>
          </div>
        )}

        <div className="pt-1 flex items-center gap-3">
          <button
            onClick={handleCheckForUpdates}
            disabled={checkingUpdate || updateStatus === "downloading"}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text hover:border-accent/50 hover:text-accent transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checkingUpdate ? "animate-spin text-accent" : ""}`} />
            {checkingUpdate ? "Checking Releases..." : "Check for Updates"}
          </button>
        </div>
      </section>

    </div>
  );
}
