import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Server, Download, RefreshCw, CheckCircle2, AlertTriangle, Loader2, QrCode, Search, Laptop } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
export default function SyncPanel() {
  const [serveStatus, setServeStatus] = useState<"idle" | "serving" | "error">("idle");
  const [serveIp, setServeIp] = useState<string | null>(null);
  const [serveError, setServeError] = useState<string | null>(null);

  const [pullStatus, setPullStatus] = useState<"idle" | "pulling" | "success" | "error">("idle");
  const [pullIp, setPullIp] = useState("");
  const [pullError, setPullError] = useState<string | null>(null);

  const [discoveredDevices, setDiscoveredDevices] = useState<{ip: string, name: string}[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

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
      const errorStr = err.toString();
      const friendlyError = errorStr.includes("in use") || errorStr.includes("10048")
        ? "Port is already in use. Please check if another instance is running."
        : "Failed to start server. Please try again.";
      setServeError(friendlyError);
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

  const handlePull = async (targetIp: string = pullIp) => {
    if (!targetIp.trim()) return;
    
    // Ensure we are not serving while pulling to avoid port conflicts or DB locks
    if (serveStatus === "serving") {
      await handleStopServe();
    }

    try {
      setPullStatus("pulling");
      setPullError(null);
      // Clean up IP string if user added http://
      let target = targetIp.trim().replace(/^https?:\/\//, '');
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
      const errorStr = err.toString();
      let friendlyError = "Failed to sync. Please check the connection.";
      if (errorStr.includes("refused") || errorStr.includes("10061") || errorStr.includes("timed out")) {
        friendlyError = "Connection refused or timed out. Please check the IP address and ensure the other app is broadcasting.";
      }
      setPullError(friendlyError);
      setPullStatus("error");
    }
  };

  const handleDiscover = async () => {
    try {
      setIsDiscovering(true);
      // Call our new Rust command (we will implement this in sync.rs)
      const devices = await invoke<{ip: string, name: string}[]>("discover_devices");
      setDiscoveredDevices(devices);
    } catch (err) {
      console.error("Discovery failed:", err);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6 lg:p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Serve Panel */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm flex flex-col">
          <div className="mb-8">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-medium tracking-tight text-text">
              <Server className="h-5 w-5 text-accent" />
              Make Available
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Broadcast this device on the local network. Scanning the QR code will instantly connect your mobile companion.
            </p>
          </div>

          <div className="mt-auto">
            {serveStatus === "idle" && (
              <button
                onClick={handleStartServe}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-bg transition-transform hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                Generate Connection Code
              </button>
            )}

            {serveStatus === "serving" && (
              <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-bg p-6">
                <div className="rounded-xl bg-white p-4 shadow-sm flex items-center justify-center">
                  <QRCodeSVG 
                    value={`http://${serveIp}`} 
                    size={160} 
                    className="block rounded-md"
                  />
                </div>
                <div className="text-center">
                  <div className="mb-1 flex items-center justify-center gap-2 text-accent">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium tracking-wide">BROADCASTING</span>
                  </div>
                  <p className="font-mono text-lg tracking-tight text-text">{serveIp}</p>
                </div>
                <button
                  onClick={handleStopServe}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-text hover:bg-border/50 cursor-pointer"
                >
                  Stop Broadcast
                </button>
              </div>
            )}

            {serveStatus === "error" && (
              <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span className="leading-relaxed">{serveError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pull Panel */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm flex flex-col">
          <div className="mb-8">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-medium tracking-tight text-text">
              <Download className="h-5 w-5 text-accent" />
              Sync from Device
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Pull data from another active Mainframe on your network. 
              <strong className="block mt-2 font-medium text-danger">Warning: This will overwrite your local data.</strong>
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4">
            <button
              onClick={handleDiscover}
              disabled={isDiscovering}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg px-6 py-3.5 text-sm font-medium text-text transition-colors hover:bg-border/50 disabled:opacity-50 cursor-pointer"
            >
              {isDiscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 text-accent" />}
              {isDiscovering ? "Scanning Network..." : "Auto-Discover Devices"}
            </button>

            {discoveredDevices.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-2">
                {discoveredDevices.map((device, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg p-3 hover:bg-surface transition-colors">
                    <div className="flex items-center gap-3">
                      <Laptop className="h-4 w-4 text-text-muted" />
                      <div>
                        <p className="text-sm font-medium text-text">{device.name}</p>
                        <p className="font-mono text-xs text-text-muted">{device.ip}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePull(device.ip)}
                      disabled={pullStatus === "pulling" || pullStatus === "success"}
                      className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-bg hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Sync
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="relative mb-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs font-medium tracking-widest text-text-muted uppercase">Manual IP</span>
              <div className="h-px flex-1 bg-border"></div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="192.168.x.x:9377"
                value={pullIp}
                onChange={(e) => setPullIp(e.target.value)}
                disabled={pullStatus === "pulling" || pullStatus === "success"}
                className="font-mono flex-1 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                onKeyDown={(e) => e.key === "Enter" && handlePull()}
              />
              <button
                onClick={() => handlePull()}
                disabled={!pullIp.trim() || pullStatus === "pulling" || pullStatus === "success"}
                className="flex items-center justify-center rounded-xl bg-surface px-6 py-3 text-sm font-medium text-text border border-border transition-colors hover:bg-border/50 disabled:opacity-50 cursor-pointer"
              >
                {pullStatus === "pulling" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
              </button>
            </div>

            {pullStatus === "success" && (
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-success/10 p-4 text-sm text-success">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-medium">Database synced successfully. Reloading system...</span>
              </div>
            )}

            {pullStatus === "error" && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span className="leading-relaxed">{pullError}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
