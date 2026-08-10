import { useState } from "react";
import type { DomainKey, BaseItem } from "../App";

interface ItemFormProps {
  domain: DomainKey;
  item: BaseItem | null;
  onSave: (fields: Record<string, unknown>) => void;
  onCancel: () => void;
}

// Domain-specific field definitions
const domainFields: Record<DomainKey, { key: string; label: string; type: string }[]> = {
  courses: [
    { key: "platform", label: "Platform", type: "text" },
    { key: "url", label: "URL", type: "url" },
    { key: "progress_percent", label: "Progress %", type: "number" },
  ],
  acquisitions: [
    { key: "category", label: "Category", type: "text" },
    { key: "estimated_cost", label: "Estimated Cost", type: "number" },
    { key: "priority", label: "Priority", type: "select" },
  ],
  goals: [
    { key: "timeframe", label: "Timeframe", type: "text" },
    { key: "action_trigger", label: "Action Trigger", type: "text" },
  ],
  build_ideas: [
    { key: "category", label: "Category", type: "text" },
    { key: "repo_or_link", label: "Repo / Link", type: "url" },
    { key: "action_trigger", label: "Action Trigger", type: "text" },
  ],
  ventures: [
    { key: "stage", label: "Stage", type: "select" },
    { key: "action_trigger", label: "Action Trigger", type: "text" },
  ],
};

export default function ItemForm({ domain, item, onSave, onCancel }: ItemFormProps) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    if (item) {
      const init: Record<string, string> = {};
      init.title = item.title;
      init.notes = item.notes ?? "";
      init.status = item.status;
      init.target_date = item.target_date ?? "";
      for (const f of domainFields[domain]) {
        init[f.key] = String(item[f.key] ?? "");
      }
      return init;
    }
    return { title: "", notes: "", status: "not_started", target_date: "" };
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const fields: Record<string, unknown> = { title: form.title.trim() };
    if (form.notes) fields.notes = form.notes;
    if (form.status) fields.status = form.status;
    if (form.target_date) fields.target_date = form.target_date;
    for (const f of domainFields[domain]) {
      const val = form[f.key];
      if (val !== undefined && val !== "") {
        fields[f.key] = f.type === "number" ? Number(val) : val;
      }
    }
    onSave(fields);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent/50 transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-accent/30 bg-surface p-5 flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Title — always first, full width */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-text-muted mb-1">Title *</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Item title"
            autoFocus
            required
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-text-muted mb-1">Status</label>
          <select
            className={inputClass}
            value={form.status || "not_started"}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {/* Target date */}
        <div>
          <label className="block text-xs text-text-muted mb-1">Target Date</label>
          <input
            type="date"
            className={inputClass}
            value={form.target_date || ""}
            onChange={(e) => set("target_date", e.target.value)}
          />
        </div>

        {/* Domain-specific fields */}
        {domainFields[domain].map((f) => (
          <div key={f.key}>
            <label className="block text-xs text-text-muted mb-1">{f.label}</label>
            {f.key === "priority" ? (
              <select
                className={inputClass}
                value={form[f.key] || "medium"}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : f.key === "stage" ? (
              <select
                className={inputClass}
                value={form[f.key] || "idea"}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="idea">Idea</option>
                <option value="validating">Validating</option>
                <option value="building">Building</option>
              </select>
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                className={inputClass}
                value={form[f.key] || ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.label}
                min={f.key === "progress_percent" ? 0 : undefined}
                max={f.key === "progress_percent" ? 100 : undefined}
              />
            )}
          </div>
        ))}

        {/* Notes — full width */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-text-muted mb-1">Notes</label>
          <textarea
            className={`${inputClass} resize-y min-h-16`}
            value={form.notes || ""}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Optional notes"
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent/90 transition-colors cursor-pointer"
        >
          {item ? "Save" : "Add"}
        </button>
      </div>
    </form>
  );
}
