import { useState, useEffect } from "react";
import type { DomainKey, BaseItem } from "../App";
import { getDb } from "../App";
import { Pen, Plus, X } from "lucide-react";
import BriefingTimeline from "./BriefingTimeline";

interface ItemFormProps {
  domain: DomainKey;
  item: BaseItem | null;
  onSave: (fields: Record<string, unknown>) => void;
  onCancel: () => void;
  onEnterDraftingMode?: (item: BaseItem) => void;
}

// Domain-specific field definitions
const domainFields: Record<DomainKey, { key: string; label: string; type: string }[]> = {
  certifications: [
    { key: "platform", label: "Platform", type: "text" },
    { key: "url", label: "URL", type: "url" },
    { key: "credential_url", label: "Credential URL", type: "url" },
    { key: "expires_at", label: "Expires At", type: "date" },
  ],
  acquisitions: [
    { key: "category", label: "Category", type: "text" },
    { key: "estimated_cost", label: "Estimated Cost", type: "number" },
    { key: "priority", label: "Priority", type: "select" },
    { key: "necessity", label: "Necessity", type: "select" },
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
    { key: "target_audience", label: "Target Audience", type: "text" },
    { key: "action_trigger", label: "Action Trigger", type: "text" },
  ],
  writing: [
    { key: "writing_type", label: "Writing Type", type: "select" },
  ],
  skills: [
    { key: "proficiency", label: "Proficiency", type: "select" },
    { key: "proof_link", label: "Proof Link", type: "url" },
  ],
  experiences: [
    { key: "impact", label: "Impact", type: "select" },
    { key: "takeaway", label: "Takeaway", type: "text" },
  ],
  journal: [
    { key: "entry_type", label: "Entry Type", type: "select" },
  ],
};


export default function ItemForm({ domain, item, onSave, onCancel, onEnterDraftingMode }: ItemFormProps) {
  const isTier1 = ["build_ideas", "writing", "ventures", "goals", "skills", "experiences", "journal"].includes(domain);

  const [form, setForm] = useState<Record<string, string>>(() => {
    if (item) {
      const init: Record<string, string> = {};
      init.title = item.title;
      init.notes = item.notes ?? "";
      init.status = item.status;
      init.target_date = item.target_date ?? "";
      const fields = domainFields[domain] || [];
      for (const f of fields) {
        init[f.key] = String(item[f.key] ?? "");
      }
      return init;
    }
    return { title: "", notes: "", status: "not_started", target_date: "" };
  });

  const [cards, setCards] = useState<{ id?: number; title: string; isDeleted?: boolean }[]>([
    { title: "" }
  ]);

  useEffect(() => {
    if (isTier1 && item) {
      getDb().then(db => {
        db.select<{id: number, title: string}[]>("SELECT id, title FROM cards WHERE domain = $1 AND row_id = $2 ORDER BY order_index ASC", [domain, item.id])
          .then(res => {
            if (res.length > 0) {
              setCards(res);
            }
          });
      });
    }
  }, [item, domain, isTier1]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const fields: Record<string, unknown> = { title: form.title.trim() };
    if (form.notes) fields.notes = form.notes;
    if (form.status) fields.status = form.status;
    if (form.target_date) fields.target_date = form.target_date;
    const fieldsList = domainFields[domain] || [];
    for (const f of fieldsList) {
      const val = form[f.key];
      if (val !== undefined && val !== "") {
        fields[f.key] = f.type === "number" ? Number(val) : val;
      }
    }
    
    if (isTier1) {
      fields.cards = cards.filter(c => c.title.trim() !== "" || c.isDeleted);
    }
    
    onSave(fields);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent/50 transition-colors";

  return (
    <div className="rounded-2xl border border-accent/30 bg-surface p-5 flex flex-col gap-4">
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
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
        {(domainFields[domain] || []).map((f) => (
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
            ) : f.key === "necessity" ? (
              <select
                className={inputClass}
                value={form[f.key] || "want"}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="want">Want</option>
                <option value="need">Need</option>
              </select>
            ) : f.key === "entry_type" ? (
              <select
                className={inputClass}
                value={form[f.key] || "reflection"}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="reflection">Reflection</option>
                <option value="daily">Daily Log</option>
                <option value="thought">Raw Thought</option>
                <option value="gratitude">Gratitude</option>
              </select>
            ) : f.key === "writing_type" ? (
              <select
                className={inputClass}
                value={form[f.key] || "essay"}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="essay">Essay</option>
                <option value="research">Research</option>
                <option value="letter">Letter</option>
                <option value="article">Article</option>
              </select>
            ) : f.key === "proficiency" ? (
              <select
                className={inputClass}
                value={form[f.key] || "novice"}
                onChange={(e) => set(f.key, e.target.value)}
              >
                <option value="novice">Novice</option>
                <option value="competent">Competent</option>
                <option value="expert">Expert</option>
              </select>
            ) : f.key === "impact" ? (
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
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                className={inputClass}
                value={form[f.key] || ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.label}
              />
            )}
          </div>
        ))}

        {/* Notes or Cards — full width */}
        <div className="sm:col-span-2">
          {!isTier1 ? (
            <>
              <label className="block text-xs text-text-muted mb-1">Description / Summary</label>
              <textarea
                className={`${inputClass} resize-y min-h-16`}
                value={form.notes || ""}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Optional notes"
                rows={2}
              />
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="block text-xs text-text-muted mb-1">Cards / Points (Hit Enter to add)</label>
              {cards.filter(c => !c.isDeleted).map((card, i) => (
                <div key={card.id ?? `new-${i}`} className="flex gap-2 items-center">
                  <input
                    type="text"
                    className={inputClass}
                    value={card.title}
                    placeholder="Enter a point or question..."
                    onChange={(e) => {
                      const newCards = [...cards];
                      const idx = newCards.findIndex(c => c === card);
                      newCards[idx].title = e.target.value;
                      setCards(newCards);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setCards([...cards, { title: "" }]);
                        // Next render will add a new input, autofocus handling could be added but omitted for simplicity
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newCards = [...cards];
                      const idx = newCards.findIndex(c => c === card);
                      if (newCards[idx].id) {
                        newCards[idx].isDeleted = true;
                      } else {
                        newCards.splice(idx, 1);
                      }
                      setCards(newCards);
                    }}
                    className="p-2 text-text-muted hover:text-danger cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCards([...cards, { title: "" }])}
                className="text-xs font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1 self-start mt-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Card
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {isTier1 && item && onEnterDraftingMode && (
          <button
            type="button"
            onClick={() => onEnterDraftingMode(item)}
            className="mr-auto rounded-lg border border-accent bg-transparent px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 transition-colors cursor-pointer"
          >
            <Pen className="w-4 h-4 inline-block mr-1" /> Enter Drafting Mode
          </button>
        )}
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
    
    {item && (
      <BriefingTimeline domain={domain} rowId={item.id} />
    )}
    </div>
  );
}
