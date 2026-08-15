import { useEffect, useState, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";
import Sidebar from "./components/Sidebar";
import DomainView from "./components/DomainView";
import PasteIngest from "./components/PasteIngest";
import NotificationLog from "./components/NotificationLog";
import Settings from "./components/Settings";
import BackupExport from "./components/BackupExport";
import SyncPanel from "./components/SyncPanel";
import ToastContainer from "./components/Toast";
import { Award, Wrench, ShoppingCart, Target, Rocket, Feather, Zap, Compass, X, ClipboardPaste, ArrowRight, Menu } from "lucide-react";
import { runUrgencyCheck } from "./engine/urgency";
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

async function loadCounts(): Promise<DomainCounts> {
  const db = await getDb();
  const counts = {} as DomainCounts;
  await Promise.all(
    domains.map(async (d) => {
      const rows = await db.select<{ count: number }[]>(
        `SELECT COUNT(*) AS count FROM ${d.key}`,
      );
      counts[d.key] = rows[0]?.count ?? 0;
    }),
  );
  return counts;
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
  const [period, setPeriod] = useState<Period>("daily");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIngest, setShowIngest] = useState(false);
  const [draftingItem, setDraftingItem] = useState<{item: BaseItem, domain: DomainKey} | null>(null);

  const refreshCounts = useCallback(() => {
    loadCounts().then(setCounts).catch(console.error);
  }, []);

  useEffect(() => {
    refreshCounts();
    // Run urgency check on app open (doc 06 §5)
    runUrgencyCheck().catch(console.error);
  }, [refreshCounts]);

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
          setMobileMenuOpen(false);
        }}
        onNavigate={(view: string) => {
          setActiveView((view || null) as View);
          setShowIngest(false);
          setMobileMenuOpen(false);
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
                  onClick={() => setPeriod(p)}
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
        ) : (
          /* Dashboard summary cards */
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {domains.map((d) => (
              <button
                key={d.key}
                onClick={() => setActiveView(d.key)}
                className="group rounded-2xl border border-border bg-surface-alt p-3 text-left transition-all hover:border-accent/60 hover:bg-surface cursor-pointer"
              >
                <div className="flex flex-col gap-2 mb-2">
                  <d.icon className="w-6 h-6 text-accent" />
                  <h2 className="m-0 text-sm font-semibold leading-tight">{d.label}</h2>
                </div>
                {counts[d.key] > 0 ? (
                  <p className="m-0 text-text-muted text-sm">
                    {counts[d.key]} item{counts[d.key] !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="m-0 text-accent/70 text-xs">
                    Empty <ArrowRight className="w-3 h-3 inline-block ml-0.5" />
                  </p>
                )}
              </button>
            ))}
          </section>
        )}
      </main>

      <NotificationEngine />
      <ToastContainer />
    </div>
  );
}

export default App;
