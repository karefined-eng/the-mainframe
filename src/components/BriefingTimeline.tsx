import { useState, useEffect, useCallback } from "react";
import type { DomainKey } from "../App";
import { getDb } from "../App";

interface ItemUpdate {
  id: number;
  content: string;
  created_at: string;
}

interface BriefingTimelineProps {
  domain: DomainKey;
  rowId: number;
}

export default function BriefingTimeline({ domain, rowId }: BriefingTimelineProps) {
  const [updates, setUpdates] = useState<ItemUpdate[]>([]);
  const [newUpdate, setNewUpdate] = useState("");

  const loadUpdates = useCallback(async () => {
    try {
      const db = await getDb();
      const rows = await db.select<ItemUpdate[]>(
        `SELECT id, content, created_at FROM item_updates WHERE domain = $1 AND row_id = $2 ORDER BY created_at DESC`,
        [domain, rowId]
      );
      setUpdates(rows);
    } catch (err) {
      console.error("Failed to load updates", err);
    }
  }, [domain, rowId]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    
    try {
      const db = await getDb();
      await db.execute(
        `INSERT INTO item_updates (domain, row_id, content) VALUES ($1, $2, $3)`,
        [domain, rowId, newUpdate.trim()]
      );
      setNewUpdate("");
      loadUpdates();
    } catch (err) {
      console.error("Failed to add update", err);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-border">
      <h3 className="text-sm font-semibold text-text">Project Briefing & Notes</h3>
      
      {/* Add new update */}
      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <textarea
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent/50 transition-colors resize-y min-h-[60px]"
          placeholder="Add a new note or progress update..."
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleAdd(e);
            }
          }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newUpdate.trim()}
            className="rounded-lg bg-surface-alt border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-surface hover:text-accent transition-colors disabled:opacity-50 cursor-pointer"
          >
            Add Note
          </button>
        </div>
      </form>

      {/* Timeline */}
      <div className="flex flex-col gap-3 mt-2">
        {updates.length === 0 ? (
          <p className="text-xs text-text-muted italic">No briefing notes yet.</p>
        ) : (
          updates.map((update) => {
            const date = new Date(update.created_at + 'Z'); // ensure UTC parsing if needed, sqlite returns UTC text normally
            const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute:'2-digit'});
            return (
              <div key={update.id} className="flex flex-col gap-1 rounded-lg bg-surface-alt/50 p-3 border border-border/50">
                <span className="text-[10px] font-medium text-text-muted/70 uppercase tracking-wider">
                  {formattedDate}
                </span>
                <p className="text-sm text-text whitespace-pre-wrap m-0">
                  {update.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
