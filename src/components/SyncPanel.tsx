import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Server, Download, RefreshCw, CheckCircle2, AlertTriangle, Loader2, QrCode, Search, Laptop, KeyRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSyncContext } from "../context/SyncContext";

export default function SyncPanel() {
  const { setSyncInProgress } = useSyncContext();

  const [serveStatus, setServeStatus] = useState<"idle" | "serving" | "error">("idle");
  const [serveIp, setServeIp] = useState<string | null>(null);
  const [servePin, setServePin] = useState<string | null>(null);
  const [serveError, setServeError] = useState<string | null>(null);

  const [pullStatus, setPullStatus] = useState<"idle" | "pulling" | "success" | "error">("idle");
  const [pullIp, setPullIp] = useState("");
  const [pullPin, setPullPin] = useState("");
  const [pullError, setPullError] = useState<string | null>(null);

  const [discoveredDevices, setDiscoveredDevices] = useState<{ ip: string; name: string }[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Stop server and listen for db_swap_complete event on mount/unmount
  useEffect(() => {
    const unlisten = listen("db_swap_complete", () => {
      window.location.reload();
    });

    return () => {
      invoke("stop_sync_server").catch(console.error);
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleStartServe = async () => {
    try {
      setServeStatus("idle");
      setServeError(null);
      const info = await invoke<{ addr: string; pin: string }>("start_sync_server");
      setServeIp(info.addr);
      setServePin(info.pin);
      setServeStatus("serving");
    } catch (err: any) {
      const msg = err.toString();
      setServeError(
        msg.includes("in use") || msg.includes("10048")
          ? "Port is already in use. Please check if another instance is running."
          : "Failed to start server. Please try again."
      );
      setServeStatus("error");
    }
  };

  const handleStopServe = async () => {
    try {
      await invoke("stop_sync_server");
      setServeStatus("idle");
      setServeIp(null);
      setServePin(null);
    } catch (err) {
      console.error("Failed to stop server:", err);
    }
  };

  const handlePull = async (targetIp: string = pullIp, targetPin: string = pullPin) => {
    if (!targetIp.trim() || !targetPin.trim()) return;

    if (serveStatus === "serving") await handleStopServe();

    try {
      setPullStatus("pulling");
      setPullError(null);
      setSyncInProgress(true);

      let target = targetIp.trim().replace(/^https?:\/\//, "");
      if (!target.includes(":")) target = `${target}:9377`;

      await invoke("pull_from_device", { ipPort: target, pin: targetPin.trim() });

      setPullStatus("success");
      setPullIp("");
      setPullPin("");
      // Page reload is triggered by db_swap_complete event from Rust
    } catch (err: any) {
      setSyncInProgress(false);
      const msg = err.toString();
      setPullError(
        msg.includes("Invalid PIN") || msg.includes("Unauthorized")
          ? "Invalid PIN. Please check the code shown on the source device."
          : msg.includes("refused") || msg.includes("timed out")
          ? "Connection refused or timed out. Ensure the source device is broadcasting."
          : msg.includes("corrupt") || msg.includes("integrity")
          ? "The incoming database failed its integrity check. Your local data is safe."
          : "Failed to sync. Please check the connection and try again."
      );
      setPullStatus("error");
    }
  };

  const handleDiscover = async () => {
    try {
      setIsDiscovering(true);
      const devices = await invoke<{ ip: string; name: string }[]>("discover_devices");
      setDiscoveredDevices(devices);
    } catch (err) {
      console.error("Discovery failed:", err);
    } finally {
      setIsDiscovering(false);
    }
  };

  // QR encodes the full URL with PIN so the receiving Mainframe app can auto-fill
  const qrValue = serveIp && servePin
    ? `http://${serveIp}/?pin=${servePin.replace("-", "")}`
    : "";

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
              Broadcast this device on the local network. Another Mainframe on the same Wi-Fi can pull your data using the PIN shown below.
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

            {serveStatus === "serving" && serveIp && servePin && (
              <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-bg p-6">
                <div className="rounded-xl bg-white p-4 shadow-sm flex items-center justify-center">
                  <QRCodeSVG value={qrValue} size={160} className="block rounded-md" />
                </div>
                <div className="text-center w-full">
                  <div className="mb-3 flex items-center justify-center gap-2 text-accent">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium tracking-wide">BROADCASTING</span>
                  </div>
                  <p className="font-mono text-lg tracking-tight text-text mb-4">{serveIp}</p>
                  {/* PIN display */}
                  <div className="rounded-xl border border-border bg-surface px-5 py-3">
                    <p className="text-xs text-text-muted mb-1 uppercase tracking-widest">One-Time PIN</p>
                    <p className="font-mono text-3xl font-bold tracking-widest text-accent">{servePin}</p>
                    <p className="text-[10px] text-text-muted/60 mt-1">PIN rotates after each successful sync</p>
                  </div>
                </div>
                <button
                  onClick={handleStopServe}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-text hover:bg-border/50 cursor-pointer"
                >
                  Stop Broadcast
                </button>
                <p className="text-[11px] text-text-muted/50 text-center -mt-2">
                  Phone scanning coming with Android APK
                </p>
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
              Pull data from another active Mainframe on your network.{" "}
              <strong className="block mt-2 font-medium text-warning">
                A local backup of your current data is made automatically before any overwrite.
              </strong>
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4">
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
                      onClick={() => {
                        setPullIp(device.ip);
                      }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:border-accent/50 transition-all cursor-pointer"
                    >
                      Use IP
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <div className="relative flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium tracking-widest text-text-muted uppercase">Connection Details</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <input
              type="text"
              placeholder="192.168.x.x:9377"
              value={pullIp}
              onChange={(e) => setPullIp(e.target.value)}
              disabled={pullStatus === "pulling" || pullStatus === "success"}
              className="font-mono rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />

            {/* PIN input */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
              <KeyRound className="h-4 w-4 text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="PIN from source device (e.g. 482-391)"
                value={pullPin}
                onChange={(e) => setPullPin(e.target.value)}
                disabled={pullStatus === "pulling" || pullStatus === "success"}
                maxLength={7}
                className="font-mono flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-muted/40"
                onKeyDown={(e) => e.key === "Enter" && handlePull()}
              />
            </div>

            <button
              onClick={() => handlePull()}
              disabled={!pullIp.trim() || !pullPin.trim() || pullStatus === "pulling" || pullStatus === "success"}
              className="flex items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-bg transition-transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-40 disabled:translate-y-0 cursor-pointer"
            >
              {pullStatus === "pulling" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync Now"}
            </button>

            {pullStatus === "success" && (
              <div className="flex items-center gap-3 rounded-xl bg-success/10 p-4 text-sm text-success">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-medium">Database verified and synced. Reloading...</span>
              </div>
            )}

            {pullStatus === "error" && (
              <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
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
