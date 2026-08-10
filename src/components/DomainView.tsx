import { useEffect, useState, useCallback } from "react";
import type { DomainKey, DomainInfo, Period, BaseItem, Status } from "../App";
import { getDb } from "../App";
import ItemRow from "./ItemRow";
import ItemForm from "./ItemForm";

interface DomainViewProps {
  domain: DomainKey;
  domainInfo: DomainInfo;
  period: Period;
  onCountChange: () => void;
}

export default function DomainView({
  domain,
  domainInfo,
  period,
  onCountChange,
}: DomainViewProps) {
  const [items, setItems] = useState<BaseItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BaseItem | null>(null);

  const loadItems = useCallback(async () => {
    const db = await getDb();
    // Sort: in_progress first, then most recently updated
    const rows = await db.select<BaseItem[]>(
      `SELECT * FROM ${domain}
       ORDER BY
         CASE status WHEN 'in_progress' THEN 0 WHEN 'not_started' THEN 1 WHEN 'paused' THEN 2 ELSE 3 END,
         updated_at DESC`,
    );
    setItems(rows);
  }, [domain]);

  useEffect(() => {
    loadItems();
    setSearch("");
    setShowForm(false);
    setEditingItem(null);
  }, [loadItems]);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    if (q && !item.title.toLowerCase().includes(q) && !(item.notes ?? "").toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  const handleStatusChange = async (id: number, newStatus: Status) => {
    const db = await getDb();
    await db.execute(
      `UPDATE ${domain} SET status = $1, updated_at = datetime('now') WHERE id = $2`,
      [newStatus, id],
    );
    await loadItems();
    onCountChange();
  };

  const handleDelete = async (id: number) => {
    // Confirmation for ventures/build_ideas per doc 04 §C4
    if (domain === "ventures" || domain === "build_ideas") {
      if (!confirm("Delete this item? This can't be undone.")) return;
    }
    const db = await getDb();
    await db.execute(`DELETE FROM ${domain} WHERE id = $1`, [id]);
    await loadItems();
    onCountChange();
  };

  const handleSave = async (fields: Record<string, unknown>) => {
    const db = await getDb();
    const keys = Object.keys(fields);
    if (editingItem) {
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
      await db.execute(
        `UPDATE ${domain} SET ${sets}, updated_at = datetime('now') WHERE id = $${keys.length + 1}`,
        [...Object.values(fields), editingItem.id],
      );
    } else {
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      await db.execute(
        `INSERT INTO ${domain} (${keys.join(", ")}) VALUES (${placeholders})`,
        Object.values(fields),
      );
    }
    setShowForm(false);
    setEditingItem(null);
    await loadItems();
    onCountChange();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Definition Banner */}
      {(domain === "goals" || domain === "skills" || domain === "experiences") && (
        <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 mb-2 text-sm text-text-muted">
          {domain === "goals" && <p className="m-0"><strong className="text-accent">Goals:</strong> A specific achievement with an endpoint (e.g. "Run a marathon"). It is complete when done.</p>}
          {domain === "skills" && <p className="m-0"><strong className="text-accent">Skills:</strong> An ongoing capability to master (e.g. "Coding", "Running"). No finish line, just proficiency.</p>}
          {domain === "experiences" && <p className="m-0"><strong className="text-accent">Experiences:</strong> A one-time life event to enjoy (e.g. "Skydiving"). No ongoing mastery, just do it once.</p>}
        </div>
      )}

      {/* Search + Add */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder={`Search ${domainInfo.label.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none focus:border-accent/50 transition-colors"
        />
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="rounded-xl border border-accent bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent/20 transition-all cursor-pointer"
        >
          + Add
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <ItemForm
          domain={domain}
          item={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Items list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-alt p-8 text-center">
            <p className="text-text-muted text-sm">
              {items.length === 0
                ? `No ${domainInfo.label.toLowerCase()} yet. Add one or paste import a list.`
                : "No items match your search."}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              domain={domain}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={(item) => {
                setEditingItem(item);
                setShowForm(true);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
