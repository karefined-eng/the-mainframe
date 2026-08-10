import { useEffect, useState, useCallback } from "react";
import Database from "@tauri-apps/plugin-sql";
import Sidebar from "./components/Sidebar";
import DomainView from "./components/DomainView";
import PasteIngest from "./components/PasteIngest";
import NotificationLog from "./components/NotificationLog";
import Settings from "./components/Settings";
import BackupExport from "./components/BackupExport";
import ToastContainer from "./components/Toast";
import { Award, Wrench, ShoppingCart, Target, Rocket, Feather, Zap, Compass } from "lucide-react";
import { runUrgencyCheck } from "./engine/urgency";
import CalendarView from "./components/CalendarView";

export const domains = [
  { key: "courses", label: "Courses", icon: Award },
  { key: "build_ideas", label: "Build Ideas", icon: Wrench },
  { key: "acquisitions", label: "Acquisitions", icon: ShoppingCart },
  { key: "goals", label: "Goals", icon: Target },
  { key: "ventures", label: "Ventures", icon: Rocket },
  { key: "writing", label: "Writing", icon: Feather },
  { key: "skills", label: "Skills", icon: Zap },
  { key: "experiences", label: "Experiences", icon: Compass },
] as const;

export type DomainKey = "courses" | "build_ideas" | "acquisitions" | "goals" | "ventures" | "writing" | "skills" | "experiences";
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

type View = DomainKey | "notifications" | "settings" | "export" | "calendar" | null;

function App() {
  const [activeView, setActiveView] = useState<View>(null);
  const [counts, setCounts] = useState<DomainCounts>({
    courses: 0,
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
  const [showIngest, setShowIngest] = useState(false);

  const refreshCounts = useCallback(() => {
    loadCounts().then(setCounts).catch(console.error);
  }, []);

  useEffect(() => {
    refreshCounts();
    // Run urgency check on app open (doc 06 §5)
    runUrgencyCheck().catch(console.error);
  }, [refreshCounts]);

  const activeDomain = (activeView && !["notifications", "settings", "export", "calendar"].includes(activeView))
    ? (activeView as DomainKey)
    : null;
  const activeDomainInfo = activeDomain ? domains.find((d) => d.key === activeDomain) : undefined;

  const viewTitle = () => {
    if (activeDomainInfo) return activeDomainInfo.label;
    if (activeView === "notifications") return "Notifications";
    if (activeView === "settings") return "Settings";
    if (activeView === "export") return "Export / Backup";
    if (activeView === "calendar") return "Calendar";
    return "The Mainframe";
  };

  return (
    <div
      className={`grid min-h-screen transition-[grid-template-columns] duration-200 ${sidebarCollapsed ? "grid-cols-[64px_1fr]" : "grid-cols-[260px_1fr]"}`}
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
        }}
        onNavigate={(view: string) => {
          setActiveView((view || null) as View);
          setShowIngest(false);
        }}
        activeView={activeView}
      />

      <main className="flex flex-col gap-7 p-8 overflow-y-auto">
        {/* Top strip */}
        <header className="flex items-center justify-between gap-5">
          <h1 className="m-0 text-3xl font-bold tracking-tight">
            {viewTitle()}
          </h1>
          {activeDomain && (
            <div className="flex gap-2.5">
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
                {showIngest ? "✕ Close" : "📋 Paste Import"}
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
            />
          </div>
        ) : activeView === "notifications" ? (
          <NotificationLog />
        ) : activeView === "settings" ? (
          <Settings />
        ) : activeView === "export" ? (
          <BackupExport />
        ) : activeView === "calendar" ? (
          <CalendarView />
        ) : (
          /* Dashboard summary cards */
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((d) => (
              <button
                key={d.key}
                onClick={() => setActiveView(d.key)}
                className="group rounded-2xl border border-border bg-surface-alt p-6 text-left transition-all hover:border-accent/60 hover:bg-surface cursor-pointer"
              >
                <div className="flex flex-col gap-3 mb-3">
                  <d.icon className="w-8 h-8 text-accent" />
                  <h2 className="m-0 text-base font-semibold">{d.label}</h2>
                </div>
                {counts[d.key] > 0 ? (
                  <p className="m-0 text-text-muted text-sm">
                    {counts[d.key]} item{counts[d.key] !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="m-0 text-accent/70 text-sm">
                    Paste your {d.label.toLowerCase()} list to get started →
                  </p>
                )}
              </button>
            ))}
          </section>
        )}
      </main>

      <ToastContainer />
    </div>
  );
}

export default App;
