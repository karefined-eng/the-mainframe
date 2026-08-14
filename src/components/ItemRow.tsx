import type { DomainKey, BaseItem, Status } from "../App";
import { X } from "lucide-react";

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
  onStatusChange: (id: number, status: Status) => void;
  onDelete: (id: number) => void;
  onEdit: (item: BaseItem) => void;
}

export default function ItemRow({
  item,
  domain,
  onStatusChange,
  onDelete,
  onEdit,
}: ItemRowProps) {
  const nextStatus = () => {
    const idx = statusCycle.indexOf(item.status);
    return statusCycle[(idx + 1) % statusCycle.length];
  };

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3 transition-all hover:border-accent/30">
      {/* Status toggle */}
      <button
        onClick={() => onStatusChange(item.id, nextStatus())}
        className={`shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer hover:border-accent/50 ${statusColors[item.status]}`}
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
        <div className="flex gap-3 mt-0.5 flex-wrap">
          {domain === "certifications" && item.platform && (
            <small className="text-xs text-text-muted">{item.platform as string}</small>
          )}
          {domain === "acquisitions" && item.priority && (
            <small className={`text-xs font-medium ${
              item.priority === "high" ? "text-danger" : item.priority === "low" ? "text-text-muted" : "text-warning"
            }`}>
              {(item.priority as string).toUpperCase()}
            </small>
          )}
          {domain === "acquisitions" && item.estimated_cost != null && (
            <small className="text-xs text-text-muted">${item.estimated_cost as number}</small>
          )}
          {domain === "ventures" && item.stage && (
            <small className="text-xs text-accent/80">{item.stage as string}</small>
          )}
          {domain === "goals" && item.timeframe && (
            <small className="text-xs text-text-muted">{item.timeframe as string}</small>
          )}
          {domain === "build_ideas" && item.category && (
            <small className="text-xs text-text-muted">{item.category as string}</small>
          )}
          {item.notes && (
            <small className="text-xs text-text-muted/60 truncate max-w-48">{item.notes}</small>
          )}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => onDelete(item.id)}
        className="shrink-0 rounded-lg p-1.5 text-text-muted/40 opacity-0 group-hover:opacity-100 hover:text-danger transition-all cursor-pointer"
        title="Delete"
      >
        <X className="w-4 h-4 mx-auto" />
      </button>
    </div>
  );
}
