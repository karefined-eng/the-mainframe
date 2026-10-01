import type { DomainKey, BaseItem, Status } from "../App";
import { X } from "lucide-react";
import { formatTargetDate, isOverdueDate } from "../utils/dateWindow";

const statusCycle: Status[] = ["not_started", "in_progress", "done", "paused"];
const statusLabels: Record<Status, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  done: "Done",
  paused: "Paused",
};
const statusColors: Record<Status, string> = {
  not_started: "text-text-muted",
  in_progress: "text-accent",
  done: "text-success",
  paused: "text-warning",
};

interface ItemRowProps {
  item: BaseItem;
  domain: DomainKey;
  isHighlighted?: boolean;
  onStatusChange: (id: number, status: Status) => void;
  onDelete: (id: number) => void;
  onEdit: (item: BaseItem) => void;
}

export default function ItemRow({
  item,
  domain,
  isHighlighted = false,
  onStatusChange,
  onDelete,
  onEdit,
}: ItemRowProps) {
  const nextStatus = () => {
    const idx = statusCycle.indexOf(item.status);
    return statusCycle[(idx + 1) % statusCycle.length];
  };

  return (
    <div className={`group flex items-center gap-3 rounded-xl border bg-surface-alt px-4 py-3 transition-all hover:border-accent/30 ${isHighlighted ? "border-accent/60 ring-1 ring-accent/20" : "border-border"}`}>
      {/* Status toggle */}
      <button
        onClick={() => onStatusChange(item.id, nextStatus())}
        className={`shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer hover:border-accent/50 ${statusColors[item.status] || "text-text-muted"}`}
        title={`Click to change to ${statusLabels[nextStatus()]}`}
      >
        {statusLabels[item.status]}
      </button>

      {/* Title + meta */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit(item)}
      >
        <span className={`text-sm font-medium ${item.status === "done" ? "line-through text-text-muted" : "text-text"}`}>
          {item.title}
        </span>

        {/* Domain-specific extras */}
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
          {item.target_date && (
            <small className={`text-xs ${item.status !== "done" && isOverdueDate(item.target_date) ? "font-medium text-warning" : "text-text-muted"}`}>
              {item.status !== "done" && isOverdueDate(item.target_date) ? "Overdue" : "Due"} · {formatTargetDate(item.target_date)}
            </small>
          )}
          {domain === "certifications" && Boolean(item.platform) && (
            <small className="text-xs text-text-muted">{String(item.platform)}</small>
          )}
          {domain === "acquisitions" && Boolean(item.priority) && (
            <small className={`text-xs font-medium ${
              item.priority === "high" ? "text-danger" : item.priority === "low" ? "text-text-muted" : "text-warning"
            }`}>
              {String(item.priority).toUpperCase()}
            </small>
          )}
          {domain === "acquisitions" && item.estimated_cost != null && (
            <small className="text-xs text-text-muted">${String(item.estimated_cost)}</small>
          )}
          {domain === "ventures" && Boolean(item.stage) && (
            <small className="text-xs text-accent/80">{String(item.stage)}</small>
          )}
          {domain === "goals" && Boolean(item.timeframe) && (
            <small className="text-xs text-text-muted">{String(item.timeframe)}</small>
          )}
          {domain === "build_ideas" && Boolean(item.category) && (
            <small className="text-xs text-text-muted">{String(item.category)}</small>
          )}
          {item.notes && (
            <small className="text-xs text-text-muted/60 truncate max-w-48">{item.notes}</small>
          )}
          {Boolean(item.action_trigger) && (
            <small className="w-full border-l-2 border-accent/40 pl-2 text-xs text-text-muted">{String(item.action_trigger)}</small>
          )}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => onDelete(item.id)}
        className="shrink-0 rounded-lg p-1.5 text-text-muted/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-danger transition-all cursor-pointer"
        title="Delete"
      >
        <X className="w-4 h-4 mx-auto" />
      </button>
    </div>
  );
}
