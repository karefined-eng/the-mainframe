import { useEffect, useState, useCallback } from "react";
import type { DomainKey, DomainInfo, Period, BaseItem, Status } from "../App";
import { getDb } from "../App";
import ItemRow from "./ItemRow";
import ItemForm from "./ItemForm";
import { getPeriodDateRange, isOverdueDate, isVisibleInPeriod } from "../utils/dateWindow";

interface DomainViewProps {
  domain: DomainKey;
  domainInfo: DomainInfo;
  period: Period;
  spotlightItemId: number | null;
  onCountChange: () => void;
  onEnterDraftingMode?: (item: BaseItem) => void;
}

export default function DomainView({
  domain,
  domainInfo,
  period,
  spotlightItemId,
  onCountChange,
  onEnterDraftingMode,
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

  const now = new Date();
  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    if (q && !item.title.toLowerCase().includes(q) && !(item.notes ?? "").toLowerCase().includes(q)) {
      return false;
    }
    if (item.id === spotlightItemId) return true;
    return isVisibleInPeriod(item.target_date, period, now, item.status !== "done");
  });

  const overdueCount = items.filter((item) => item.status !== "done" && isOverdueDate(item.target_date, now)).length;
  const undatedCount = items.filter((item) => !item.target_date).length;
  const range = getPeriodDateRange(period, now);
  const periodDescription = period === "daily"
    ? `today · ${range.start}`
    : period === "weekly"
      ? `this week · ${range.start}–${range.end}`
      : `this month · ${range.start}–${range.end}`;
  const spotlightItem = items.find((item) => item.id === spotlightItemId);
  const spotlightOutsidePeriod = Boolean(
    spotlightItem && !isVisibleInPeriod(spotlightItem.target_date, period, now, spotlightItem.status !== "done"),
  );

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
    
    const cardsToSync = fields.cards as {id?: number, title: string, isDeleted?: boolean}[] | undefined;
    delete fields.cards;

    const keys = Object.keys(fields);
    let itemId = editingItem?.id;
    
    if (editingItem) {
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
      await db.execute(
        `UPDATE ${domain} SET ${sets}, updated_at = datetime('now') WHERE id = $${keys.length + 1}`,
        [...Object.values(fields), editingItem.id],
      );
    } else {
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
      const result = await db.execute(
        `INSERT OR IGNORE INTO ${domain} (${keys.join(", ")}) VALUES (${placeholders})`,
        Object.values(fields),
      );
      itemId = result.lastInsertId;
    }

    if (cardsToSync && itemId) {
      for (let i = 0; i < cardsToSync.length; i++) {
        const c = cardsToSync[i];
        if (c.isDeleted && c.id) {
          await db.execute(`DELETE FROM cards WHERE id = $1`, [c.id]);
        } else if (c.id) {
          await db.execute(`UPDATE cards SET title = $1, order_index = $2, updated_at = datetime('now') WHERE id = $3`, [c.title, i, c.id]);
        } else if (c.title.trim()) {
          await db.execute(`INSERT INTO cards (domain, row_id, title, order_index) VALUES ($1, $2, $3, $4)`, [domain, itemId, c.title.trim(), i]);
        }
      }
    }
    setShowForm(false);
    setEditingItem(null);
    await loadItems();
    onCountChange();
  };

  return (
      <div className="flex flex-col gap-4">
      {/* Definition Banner */}
      {(domain === "goals" || domain === "skills" || domain === "experiences" || domain === "writing" || domain === "journal") && (
        <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 mb-2 text-sm text-text-muted">
          {domain === "goals" && <p className="m-0"><strong className="text-accent">Goals:</strong> A specific milestone with an endpoint (e.g. "Save $10k", "Sub-20 5k"). Complete when achieved.</p>}
          {domain === "skills" && <p className="m-0"><strong className="text-accent">Skills:</strong> An ongoing craft or capability to level up (e.g. "Rust", "UI Design"). No finish line, just compounding proficiency.</p>}
          {domain === "experiences" && <p className="m-0"><strong className="text-accent">Experiences (Bucket List):</strong> Real-world adventures and memories to pursue (e.g. "Skydive from a plane", "Hike Mt. Fuji", "Swim under a waterfall").</p>}
          {domain === "writing" && <p className="m-0"><strong className="text-accent">Writing:</strong> Formal research papers, essays, articles, and structured thought pieces meant for publishing or deep inquiry.</p>}
          {domain === "journal" && <p className="m-0"><strong className="text-accent">Journal:</strong> Unfiltered daily reflections, raw emotional check-ins, personal day logs, and introspective musings.</p>}
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface-alt/70 px-3 py-2.5 text-xs text-text-muted" role="status">
        Showing items due {periodDescription}. Active overdue items and undated items remain visible ({overdueCount} overdue · {undatedCount} undated).
      </div>
      {spotlightOutsidePeriod && spotlightItem && (
        <p className="m-0 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-text-muted">
          {spotlightItem.title} is shown from the dashboard, outside this date window.
        </p>
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
          onEnterDraftingMode={onEnterDraftingMode}
        />
      )}

      {/* Items list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-alt p-8 text-center">
            <p className="text-text-muted text-sm">
              {items.length === 0
                ? `No ${domainInfo.label.toLowerCase()} yet. Add one or paste import a list.`
                : search
                  ? "No items match your search."
                  : "No items are due in this window. Undated and active overdue items remain visible."}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              domain={domain}
              isHighlighted={item.id === spotlightItemId}
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
