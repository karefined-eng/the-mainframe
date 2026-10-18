import { useEffect, useState } from "react";
import { getDb, domains } from "../App";
import { showToast } from "./Toast";
import { Bell, Database as DbIcon, Info, Sparkles, Download, RefreshCw, CheckCircle2, AlertCircle, Cpu, Eye, EyeOff } from "lucide-react";
import { check } from "@tauri-apps/plugin-updater";

type Density = "minimal" | "balanced" | "intensive";
const validSettingKeys = new Set([
  "notification_density",
  "notifications_enabled",
  "gemini_api_key",
  "openrouter_api_key",
  "nvidia_api_key",
  "groq_api_key",
]);

export default function Settings() {
  const [density, setDensity] = useState<Density>("balanced");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dbStats, setDbStats] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  // AI provider keys
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [nvidiaKey, setNvidiaKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [aiKeySaving, setAiKeySaving] = useState<string | null>(null);

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
          `SELECT key, value FROM app_settings WHERE key IN ('notification_density', 'notifications_enabled', 'gemini_api_key', 'openrouter_api_key', 'nvidia_api_key', 'groq_api_key')`,
        );
        for (const row of rows) {
          if (row.key === 'notification_density') setDensity(row.value as Density);
          if (row.key === 'notifications_enabled') setNotificationsEnabled(row.value === 'true');
          if (row.key === 'gemini_api_key') setGeminiKey(row.value);
          if (row.key === 'openrouter_api_key') setOpenrouterKey(row.value);
          if (row.key === 'nvidia_api_key') setNvidiaKey(row.value);
          if (row.key === 'groq_api_key') setGroqKey(row.value);
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

  const saveAIKey = async (key: "gemini_api_key" | "openrouter_api_key" | "nvidia_api_key" | "groq_api_key", value: string) => {
    setAiKeySaving(key);
    try {
      const db = await getDb();
      if (value.trim()) {
        await db.execute(
          `INSERT OR REPLACE INTO app_settings (key, value) VALUES ($1, $2)`,
          [key, value.trim()]
        );
      } else {
        await db.execute(`DELETE FROM app_settings WHERE key = $1`, [key]);
      }
      showToast(value.trim() ? "API key saved" : "API key cleared", "info");
    } catch {
      showToast("Failed to save API key", "error");
    } finally {
      setAiKeySaving(null);
    }
  };

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

      {/* AI Voice Parser Section */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-alt p-6">
        <div className="flex items-center justify-between">
          <h4 className="m-0 text-base font-semibold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent" />
            AI Voice Parser
          </h4>
          <div className="flex items-center gap-2">
            {geminiKey && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Gemini active
              </span>
            )}
            {openrouterKey && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                OpenRouter
              </span>
            )}
            {nvidiaKey && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                NVIDIA
              </span>
            )}
            {groqKey && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Groq Whisper
              </span>
            )}
            {!geminiKey && !openrouterKey && !nvidiaKey && !groqKey && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface text-text-muted border border-border">
                Local mode
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-text-muted m-0">
          Add a Gemini key for AI-powered transcription and domain parsing (free quota at AI Studio).
          OpenRouter and NVIDIA are used as automatic fallbacks for parsing.
        </p>

        {/* Gemini Key — primary */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Gemini API Key <span className="normal-case font-normal">(primary — transcription + parsing)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showGeminiKey ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-sm text-text placeholder:text-text-muted/40 outline-none focus:border-accent/50 transition-colors pr-9 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => saveAIKey("gemini_api_key", geminiKey)}
              disabled={aiKeySaving === "gemini_api_key"}
              className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text hover:border-accent/50 hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              {aiKeySaving === "gemini_api_key" ? "Saving..." : geminiKey ? "Update" : "Save"}
            </button>
          </div>
          <p className="text-[11px] text-text-muted m-0">
            Free at <span className="text-accent font-mono">aistudio.google.com</span> — generous free quota, no card needed.
          </p>
        </div>

        {/* OpenRouter Key — fallback 1 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            OpenRouter API Key <span className="normal-case font-normal">(fallback 1 — parsing)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showOpenRouterKey ? "text" : "password"}
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="sk-or-..."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-sm text-text placeholder:text-text-muted/40 outline-none focus:border-accent/50 transition-colors pr-9 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOpenRouterKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => saveAIKey("openrouter_api_key", openrouterKey)}
              disabled={aiKeySaving === "openrouter_api_key"}
              className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text hover:border-accent/50 hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              {aiKeySaving === "openrouter_api_key" ? "Saving..." : openrouterKey ? "Update" : "Save"}
            </button>
          </div>
          <p className="text-[11px] text-text-muted m-0">
            Get a key at <span className="text-accent font-mono">openrouter.ai/keys</span> — pay-per-token, has free models.
          </p>
        </div>

        {/* NVIDIA Key — fallback 2 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            NVIDIA NIM API Key <span className="normal-case font-normal">(fallback 2 — parsing)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showNvidiaKey ? "text" : "password"}
                value={nvidiaKey}
                onChange={(e) => setNvidiaKey(e.target.value)}
                placeholder="nvapi-..."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-sm text-text placeholder:text-text-muted/40 outline-none focus:border-accent/50 transition-colors pr-9 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNvidiaKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                {showNvidiaKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => saveAIKey("nvidia_api_key", nvidiaKey)}
              disabled={aiKeySaving === "nvidia_api_key"}
              className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text hover:border-accent/50 hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              {aiKeySaving === "nvidia_api_key" ? "Saving..." : nvidiaKey ? "Update" : "Save"}
            </button>
          </div>
          <p className="text-[11px] text-text-muted m-0">
            Free credits at <span className="text-accent font-mono">build.nvidia.com</span> — key starts with <span className="font-mono">nvapi-</span>.
          </p>
        </div>

        {/* Groq Key — STT fallback */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Groq API Key <span className="normal-case font-normal">(fallback — fast Whisper transcription)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showGroqKey ? "text" : "password"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-sm text-text placeholder:text-text-muted/40 outline-none focus:border-accent/50 transition-colors pr-9 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGroqKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => saveAIKey("groq_api_key", groqKey)}
              disabled={aiKeySaving === "groq_api_key"}
              className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text hover:border-accent/50 hover:text-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              {aiKeySaving === "groq_api_key" ? "Saving..." : groqKey ? "Update" : "Save"}
            </button>
          </div>
          <p className="text-[11px] text-text-muted m-0">
            Free high-speed Whisper Large v3 at <span className="text-accent font-mono">console.groq.com</span>.
          </p>
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
