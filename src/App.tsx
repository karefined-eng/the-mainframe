import { useEffect, useState, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";
import Sidebar from "./components/Sidebar";
import DomainView from "./components/DomainView";
import DashboardHome from "./components/DashboardHome";
import PasteIngest from "./components/PasteIngest";
import NotificationLog from "./components/NotificationLog";
import Settings from "./components/Settings";
import BackupExport from "./components/BackupExport";
import SyncPanel from "./components/SyncPanel";
import ToastContainer from "./components/Toast";
import { Award, Wrench, ShoppingCart, Target, Rocket, Feather, Zap, Compass, X, ClipboardPaste, Menu } from "lucide-react";
import { runUrgencyCheck } from "./engine/urgency";
import { buildDashboardModel, type HotItem, type ReentrySummary } from "./engine/dashboardModel";
import CalendarView from "./components/CalendarView";
import FocusDraftingMode from "./components/FocusDraftingMode";
import NotificationEngine from "./components/NotificationEngine";

export const domains = [
  { key: "certifications", label: "Certifications", icon: Award },
  { key: "build_ideas", label: "Build Ideas", icon: Wrench },
  { key: "acquisitions", label: "Acquisitions", icon: ShoppingCart },
  { key: "goals", label: "Goals", icon: Target },
  { key: "ventures", label: "Ventures", icon: Rocket },
  { key: "writing", label: "Writing", icon: Feather },
  { key: "skills", label: "Skills", icon: Zap },
  { key: "experiences", label: "Experiences", icon: Compass },
] as const;

export type DomainKey = "certifications" | "build_ideas" | "acquisitions" | "goals" | "ventures" | "writing" | "skills" | "experiences";
export type DomainInfo = typeof domains[number];
export type Period = "daily" | "weekly" | "monthly";
export type Status = "not_started" | "in_progress" | "done" | "paused";

export interface BaseItem {
  id: number;
  title: string;
  notes: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
  target_date: string | null;
  target_time: string | null;
  raw_import_text: string | null;
  [key: string]: unknown;
}

export type DomainCounts = Record<DomainKey, number>;

let _db: Database | null = null;
export async function getDb(): Promise<Database> {
  if (!_db) _db = await Database.load("sqlite:mainframe.db");
  return _db;
}

async function loadDashboardModel(previousVisitAt: string | null) {
  const db = await getDb();
  const snapshots = await Promise.all(domains.map(async (domain) => ({
    key: domain.key,
    label: domain.label,
    items: await db.select<BaseItem[]>(`SELECT * FROM ${domain.key}`),
  })));
  const settings = await db.select<{ value: string }[]>(
    `SELECT value FROM app_settings WHERE key = 'notification_density'`,
  );
  return buildDashboardModel(snapshots, previousVisitAt, settings[0]?.value || "balanced");
}

type View = DomainKey | "notifications" | "settings" | "export" | "calendar" | "sync" | "drafting_mode" | null;

function App() {
  const [activeView, setActiveView] = useState<View>(null);
  const [counts, setCounts] = useState<DomainCounts>({
    certifications: 0,
    build_ideas: 0,
    acquisitions: 0,
    goals: 0,
    ventures: 0,
    writing: 0,
    skills: 0,
    experiences: 0,
  });
  const [hotItems, setHotItems] = useState<HotItem[]>([]);
  const [reentry, setReentry] = useState<ReentrySummary | null>(null);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const [period, setPeriod] = useState<Period>("daily");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIngest, setShowIngest] = useState(false);
  const [draftingItem, setDraftingItem] = useState<{item: BaseItem, domain: DomainKey} | null>(null);
  const [spotlight, setSpotlight] = useState<{ domain: DomainKey; itemId: number } | null>(null);
  const [startupError, setStartupError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async (previousVisitAt?: string | null) => {
    const model = await loadDashboardModel(previousVisitAt ?? null);
    setCounts(model.counts);
    setHotItems(model.hotItems);
    if (previousVisitAt !== undefined) setReentry(model.reentry);
    setDashboardLoaded(true);
  }, []);

  const refreshCounts = useCallback(() => {
    refreshDashboard().catch(console.error);
  }, [refreshDashboard]);

  useEffect(() => {
    const previousVisitAt = window.localStorage.getItem("mainframe.lastOpenedAt");
    const openedAt = new Date().toISOString();
    refreshDashboard(previousVisitAt)
      .then(() => window.localStorage.setItem("mainframe.lastOpenedAt", openedAt))
      .catch((err) => {
        console.error(err);
        setStartupError(err instanceof Error ? err.message : String(err));
      });
    // Run urgency check on app open (doc 06 §5)
    runUrgencyCheck().catch(console.error);
  }, [refreshDashboard]);

  const activeDomain = (activeView && !["notifications", "settings", "export", "calendar", "sync", "drafting_mode"].includes(activeView))
    ? (activeView as DomainKey)
    : null;
  const activeDomainInfo = activeDomain ? domains.find((d) => d.key === activeDomain) : undefined;

  const viewTitle = () => {
    if (activeDomainInfo) return activeDomainInfo.label;
    if (activeView === "notifications") return "Notifications";
    if (activeView === "settings") return "Settings";
    if (activeView === "export") return "Export / Backup";
    if (activeView === "sync") return "Device Sync";
    if (activeView === "calendar") return "Calendar";
    return "The Mainframe";
  };

  return (
    <div
      className={`relative flex flex-col md:grid min-h-screen transition-[grid-template-columns] duration-200 ${sidebarCollapsed ? "md:grid-cols-[64px_1fr]" : "md:grid-cols-[260px_1fr]"}`}
    >
      <Sidebar
        domains={domains}
        counts={counts}
        activeDomain={activeDomain}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        onSelectDomain={(key) => {
          setActiveView(key);
          setShowIngest(false);
          setSpotlight(null);
          setMobileMenuOpen(false);
        }}
        onNavigate={(view: string) => {
          setActiveView((view || null) as View);
          setShowIngest(false);
          setSpotlight(null);
          setMobileMenuOpen(false);
          if (!view) refreshCounts();
        }}
        activeView={activeView}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col gap-4 p-4 pt-4 overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
        {/* Top strip */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="m-0 text-2xl sm:text-3xl font-bold tracking-tight">
              {viewTitle()}
            </h1>
          </div>
          {activeDomain && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 sm:pb-0">
              {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
                <button
                  key={p}
                  aria-pressed={period === p}
                  onClick={() => {
                    setPeriod(p);
                    setSpotlight(null);
                  }}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium capitalize transition-all cursor-pointer ${
                    period === p
                      ? "bg-accent text-bg border-accent"
                      : "bg-surface-alt border-border text-text hover:border-accent/50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Main content area */}
        {activeDomain && activeDomainInfo ? (
          <div className="flex flex-col gap-5">
            {/* Ingest toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowIngest((s) => !s)}
                className="rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-text-muted hover:border-accent/50 hover:text-text transition-all cursor-pointer"
              >
                {showIngest ? <><X className="w-4 h-4 inline-block mr-1" /> Close</> : <><ClipboardPaste className="w-4 h-4 inline-block mr-1" /> Paste Import</>}
              </button>
            </div>

            {showIngest && (
              <PasteIngest
                domain={activeDomain}
                onImported={() => {
                  refreshCounts();
                  setShowIngest(false);
                }}
              />
            )}

            <DomainView
              domain={activeDomain}
              domainInfo={activeDomainInfo}
              period={period}
              spotlightItemId={spotlight?.domain === activeDomain ? spotlight.itemId : null}
              onCountChange={refreshCounts}
              onEnterDraftingMode={(item) => {
                if (activeDomain) {
                  setDraftingItem({ item, domain: activeDomain });
                  setActiveView("drafting_mode");
                }
              }}
            />
          </div>
        ) : activeView === "notifications" ? (
          <NotificationLog />
        ) : activeView === "settings" ? (
          <Settings />
        ) : activeView === "export" ? (
          <BackupExport />
        ) : activeView === "sync" ? (
          <SyncPanel />
        ) : activeView === "calendar" ? (
          <CalendarView />
        ) : activeView === "drafting_mode" && draftingItem ? (
          <FocusDraftingMode
            item={draftingItem.item}
            domain={draftingItem.domain}
            onClose={() => {
              setActiveView(draftingItem.domain);
              setDraftingItem(null);
            }}
          />
        ) : startupError ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5">
            <p className="m-0 font-semibold text-red-300">Could not load your data</p>
            <p className="m-0 mt-2 text-text-muted">
              The window started, but the local database did not respond. Restart the app; if this keeps happening, share the details below.
            </p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-alt p-3 text-xs text-red-200">{startupError}</pre>
          </div>
        ) : (
          <DashboardHome
            domains={domains}
            counts={counts}
            hotItems={hotItems}
            reentry={reentry}
            loaded={dashboardLoaded}
            onSelectDomain={(domain) => {
              setActiveView(domain);
              setShowIngest(false);
              setSpotlight(null);
            }}
            onOpenItem={(domain, itemId) => {
              setActiveView(domain);
              setSpotlight({ domain, itemId });
              setShowIngest(false);
            }}
          />
        )}
      </main>

      <NotificationEngine />
      <ToastContainer />
    </div>
  );
}

export default App;
