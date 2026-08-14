import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Server, Download, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function SyncPanel() {
  const [serveStatus, setServeStatus] = useState<"idle" | "serving" | "error">("idle");
  const [serveIp, setServeIp] = useState<string | null>(null);
  const [serveError, setServeError] = useState<string | null>(null);

  const [pullStatus, setPullStatus] = useState<"idle" | "pulling" | "success" | "error">("idle");
  const [pullIp, setPullIp] = useState("");
  const [pullError, setPullError] = useState<string | null>(null);

  // Auto-stop server on unmount
  useEffect(() => {
    return () => {
      invoke("stop_sync_server").catch(console.error);
    };
  }, []);

  const handleStartServe = async () => {
    try {
      setServeStatus("idle");
      setServeError(null);
      const addr = await invoke<string>("start_sync_server");
      setServeIp(addr);
      setServeStatus("serving");
    } catch (err: any) {
      setServeError(err.toString());
      setServeStatus("error");
    }
  };

  const handleStopServe = async () => {
    try {
      await invoke("stop_sync_server");
      setServeStatus("idle");
      setServeIp(null);
    } catch (err) {
      console.error("Failed to stop server:", err);
    }
  };

  const handlePull = async () => {
    if (!pullIp.trim()) return;
    
    // Ensure we are not serving while pulling to avoid port conflicts or DB locks
    if (serveStatus === "serving") {
      await handleStopServe();
    }

    try {
      setPullStatus("pulling");
      setPullError(null);
      // Clean up IP string if user added http://
      let target = pullIp.trim().replace(/^https?:\/\//, '');
      if (!target.includes(':')) {
        target = `${target}:9377`; // Default port if none provided
      }
      
      await invoke("pull_from_device", { ipPort: target });
      setPullStatus("success");
      setPullIp("");
      
      // Auto-reload the page after 2 seconds to reload the DB connection and states
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err: any) {
      setPullError(err.toString());
      setPullStatus("error");
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="rounded-2xl border border-border bg-surface-alt p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
          <Server className="h-5 w-5 text-accent" />
          Send to Device
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          Make this device's database available on your local network. The other device can pull it.
        </p>

        {serveStatus === "idle" && (
          <button
            onClick={handleStartServe}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 cursor-pointer"
          >
            Make Available
          </button>
        )}

        {serveStatus === "serving" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4 text-accent">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <div>
                <p className="text-sm font-medium">Serving database on network</p>
                <p className="font-mono text-lg font-bold mt-1">{serveIp}</p>
              </div>
            </div>
            <button
              onClick={handleStopServe}
              className="self-start rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text cursor-pointer"
            >
              Stop Serving
            </button>
          </div>
        )}

        {serveStatus === "error" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4" />
            {serveError}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface-alt p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
          <Download className="h-5 w-5 text-accent" />
          Get from Device
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          Pull the database from another device on your network.
          <strong className="block mt-2 text-red-400">Warning: This will overwrite your local data. A backup will be created first.</strong>
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. 192.168.1.42:9377"
            value={pullIp}
            onChange={(e) => setPullIp(e.target.value)}
            disabled={pullStatus === "pulling" || pullStatus === "success"}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handlePull()}
          />
          <button
            onClick={handlePull}
            disabled={!pullIp.trim() || pullStatus === "pulling" || pullStatus === "success"}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {pullStatus === "pulling" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Get DB"
            )}
          </button>
        </div>

        {pullStatus === "success" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Database synced successfully. Reloading app...
          </div>
        )}

        {pullStatus === "error" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4" />
            {pullError}
          </div>
        )}
      </div>
    </div>
  );
}
