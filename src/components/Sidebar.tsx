import type { DomainKey, DomainCounts } from "../App";
import { domains } from "../App";
import { Bell, Save, Settings as SettingsIcon, Home, Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface SidebarProps {
  domains: typeof domains;
  counts: DomainCounts;
  activeDomain: DomainKey | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectDomain: (key: DomainKey) => void;
  onNavigate: (view: string) => void;
  activeView: string | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const bottomNav = [
  { key: "calendar", icon: CalendarIcon, label: "Calendar" },
  { key: "notifications", icon: Bell, label: "Notifications" },
  { key: "sync", icon: RefreshCw, label: "Device Sync" },
  { key: "export", icon: Save, label: "Export / Backup" },
  { key: "settings", icon: SettingsIcon, label: "Settings" },
];

export default function Sidebar({
  domains,
  counts,
  activeDomain,
  collapsed,
  onToggleCollapse,
  onSelectDomain,
  onNavigate,
  activeView,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside className={`flex flex-col gap-6 border-r border-border bg-sidebar px-5 py-8 pt-12 sm:pt-8 overflow-hidden
        fixed inset-y-0 left-0 z-50 md:relative w-[260px] md:w-auto h-full
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
      {/* Brand + collapse toggle */}
      <div className="flex items-center justify-between">
        {!collapsed && (
          <span
            className="text-lg font-bold tracking-widest uppercase text-text cursor-pointer"
            onClick={() => onNavigate("")}
          >
            The Mainframe
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-1.5 text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Domain nav */}
      <nav className="grid gap-2.5">
        {domains.map((d) => {
          const isActive = d.key === activeDomain;
          return (
            <button
              key={d.key}
              onClick={() => onSelectDomain(d.key)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all cursor-pointer ${
                isActive
                  ? "border-accent bg-surface"
                  : "border-transparent bg-surface-alt hover:border-border hover:bg-surface"
              }`}
            >
              <d.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">{d.label}</span>
                  <small className="text-xs text-text-muted">
                    {counts[d.key]} item{counts[d.key] !== 1 ? "s" : ""}
                  </small>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom nav — notifications, export, settings */}
      <div className="mt-auto flex flex-col gap-2">
        {bottomNav.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-all cursor-pointer ${
              activeView === item.key
                ? "border-accent/50 bg-surface text-text"
                : "border-transparent text-text-muted hover:text-text hover:bg-surface-alt"
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {/* Dashboard home */}
        <button
          onClick={() => onNavigate("")}
          className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-all cursor-pointer ${
            activeView === null || activeView === ""
              ? "border-accent/50 bg-surface text-text"
              : "border-transparent text-text-muted hover:text-text hover:bg-surface-alt"
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
