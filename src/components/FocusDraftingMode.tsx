import { useEffect, useState, useCallback, useRef } from "react";
import { getDb, type BaseItem } from "../App";

interface FocusDraftingModeProps {
  item: BaseItem;
  onClose: () => void;
}

interface ItemUpdate {
  id: number;
  content: string;
  created_at: string;
}

export default function FocusDraftingMode({ item, onClose }: FocusDraftingModeProps) {
  const [draft, setDraft] = useState(String(item.draft_content || ""));
  const [updates, setUpdates] = useState<ItemUpdate[]>([]);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<number | null>(null);

  useEffect(() => {
    async function loadUpdates() {
      const db = await getDb();
      const rows = await db.select<ItemUpdate[]>(
        `SELECT * FROM item_updates WHERE domain = 'writing' AND row_id = $1 ORDER BY created_at ASC`,
        [item.id]
      );
      setUpdates(rows);
    }
    loadUpdates();
  }, [item.id]);

  const saveDraft = useCallback(async (content: string) => {
    setSaving(true);
    try {
      const db = await getDb();
      await db.execute(
        `UPDATE writing SET draft_content = $1, updated_at = datetime('now') WHERE id = $2`,
        [content, item.id]
      );
    } catch (e) {
      console.error("Failed to save draft", e);
    } finally {
      setSaving(false);
    }
  }, [item.id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraft(val);
    
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      saveDraft(val);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    alert("Draft copied to clipboard!");
  };

  const handleExport = () => {
    const blob = new Blob([draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_draft.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none h-14 border-b border-border bg-surface px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold m-0 truncate max-w-md">{item.title}</h1>
          <span className="text-xs text-text-muted">
            {saving ? "Saving..." : "Saved"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopy}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:border-accent/50 transition-all cursor-pointer"
          >
            📋 Copy
          </button>
          <button 
            onClick={handleExport}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:border-accent/50 transition-all cursor-pointer"
          >
            💾 Export .txt
          </button>
          <button 
            onClick={onClose}
            className="rounded-lg bg-surface-alt border border-border px-4 py-1.5 text-sm hover:bg-surface transition-all cursor-pointer"
          >
            ✕ Close
          </button>
        </div>
      </header>

      {/* Main Dual Pane */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane (Reference) */}
        <section className="w-1/3 min-w-[300px] border-r border-border bg-surface-alt overflow-y-auto p-6 flex flex-col gap-6">
          
          <div>
            <h2 className="text-sm font-semibold text-accent mb-2">Description / Notes</h2>
            <div className="text-sm text-text whitespace-pre-wrap">
              {item.notes || <span className="text-text-muted italic">No notes provided.</span>}
            </div>
          </div>

          <div className="w-full h-px bg-border/50"></div>

          <div>
            <h2 className="text-sm font-semibold text-accent mb-4">Chronological Updates</h2>
            {updates.length === 0 ? (
              <span className="text-xs text-text-muted italic">No updates logged.</span>
            ) : (
              <div className="flex flex-col gap-4">
                {updates.map(u => (
                  <div key={u.id} className="text-sm border-l-2 border-accent/30 pl-3">
                    <span className="text-xs text-text-muted block mb-1">
                      {new Date(u.created_at + "Z").toLocaleString()}
                    </span>
                    <p className="m-0 whitespace-pre-wrap">{u.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </section>

        {/* Right Pane (Drafting Canvas) */}
        <section className="flex-1 bg-bg p-6">
          <textarea
            value={draft}
            onChange={handleChange}
            placeholder="Start drafting here..."
            className="w-full h-full bg-transparent resize-none outline-none text-text text-base leading-relaxed"
          />
        </section>
      </main>
    </div>
  );
}
