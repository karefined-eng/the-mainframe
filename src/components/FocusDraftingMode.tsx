import { useEffect, useState, useCallback, useRef } from "react";
import { getDb, type BaseItem, type DomainKey } from "../App";
import { Download, X, Plus, GripVertical, FileText } from "lucide-react";
import { useSyncContext } from "../context/SyncContext";

interface FocusDraftingModeProps {
  item: BaseItem;
  domain: DomainKey;
  onClose: () => void;
}

interface Card {
  id: number;
  domain: string;
  row_id: number;
  title: string;
  draft_content: string | null;
  order_index: number;
  updated_at: string;
}

export default function FocusDraftingMode({ item, domain, onClose }: FocusDraftingModeProps) {
  const { syncInProgress } = useSyncContext();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const saveTimeout = useRef<number | null>(null);

  const draftRef = useRef(draft);
  const selectedRef = useRef(selectedCardId);

  useEffect(() => {
    draftRef.current = draft;
    selectedRef.current = selectedCardId;
  }, [draft, selectedCardId]);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        if (selectedRef.current) {
          getDb().then(db => {
            db.execute(
              `UPDATE cards SET draft_content = $1, updated_at = datetime('now') WHERE id = $2`,
              [draftRef.current, selectedRef.current]
            ).catch(console.error);
          });
        }
      }
    };
  }, []);

  const [draggedCardId, setDraggedCardId] = useState<number | null>(null);

  const loadCards = useCallback(async () => {
    const db = await getDb();
    const rows = await db.select<Card[]>(
      `SELECT * FROM cards WHERE domain = $1 AND row_id = $2 ORDER BY order_index ASC`,
      [domain, item.id]
    );
    setCards(rows);
    if (rows.length > 0 && selectedCardId === null) {
      setSelectedCardId(rows[0].id);
      setDraft(rows[0].draft_content || "");
    }
  }, [domain, item.id, selectedCardId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const selectCard = (id: number) => {
    setSelectedCardId(id);
    const card = cards.find(c => c.id === id);
    setDraft(card?.draft_content || "");
  };

  const saveDraft = useCallback(async (content: string, id: number) => {
    setSaving(true);
    setSaveError(false);
    try {
      const db = await getDb();
      await db.execute(
        `UPDATE cards SET draft_content = $1, updated_at = datetime('now') WHERE id = $2`,
        [content, id]
      );
      setCards(prev => prev.map(c => c.id === id ? { ...c, updated_at: new Date().toISOString() } : c));
    } catch (e) {
      console.error("Failed to save draft", e);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedCardId) return;
    const val = e.target.value;
    setDraft(val);

    // Don't schedule auto-save during an active sync — prevents SQLite BUSY collisions.
    // The page reloads after sync completes, so state is naturally reset.
    if (syncInProgress) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      saveDraft(val, selectedCardId);
    }, 1000);
  };

  const handleTitleChange = async (id: number, newTitle: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, title: newTitle } : c));
    const db = await getDb();
    await db.execute(`UPDATE cards SET title = $1, updated_at = datetime('now') WHERE id = $2`, [newTitle, id]);
  };

  const addCard = async () => {
    const db = await getDb();
    const newOrder = cards.length;
    const res = await db.execute(
      `INSERT INTO cards (domain, row_id, title, order_index) VALUES ($1, $2, 'New Card', $3)`,
      [domain, item.id, newOrder]
    );
    await loadCards();
    if (res.lastInsertId !== undefined) {
      selectCard(res.lastInsertId);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedCardId(id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = "0.4";
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (e.target instanceof HTMLElement) e.target.style.opacity = "1";
    if (!draggedCardId || draggedCardId === targetId) {
      setDraggedCardId(null);
      return;
    }
    
    const newCards = [...cards];
    const draggedIdx = newCards.findIndex(c => c.id === draggedCardId);
    const targetIdx = newCards.findIndex(c => c.id === targetId);
    
    const [draggedCard] = newCards.splice(draggedIdx, 1);
    newCards.splice(targetIdx, 0, draggedCard);
    
    newCards.forEach((c, i) => c.order_index = i);
    setCards(newCards);
    setDraggedCardId(null);
    
    const db = await getDb();
    for (let i = 0; i < newCards.length; i++) {
      await db.execute(`UPDATE cards SET order_index = $1 WHERE id = $2`, [i, newCards[i].id]);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = "1";
    setDraggedCardId(null);
  };

  const handleExport = () => {
    const lines = cards.map(c => `## ${c.title}\n\n${c.draft_content || ""}\n`);
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col overflow-hidden pt-12 sm:pt-0">
      {/* Header */}
      <header className="flex-none min-h-[56px] border-b border-border bg-surface px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Mobile Back Button to list when a card is selected */}
          <div className="md:hidden">
             {selectedCardId && (
               <button 
                 onClick={() => selectCard(0)} 
                 className="p-1.5 -ml-2 rounded-lg bg-surface-alt border border-border text-text hover:bg-surface transition-all cursor-pointer"
               >
                 <X className="w-4 h-4" />
               </button>
             )}
          </div>
          <h1 className="text-base sm:text-lg font-semibold m-0 truncate flex-1 sm:max-w-md">{item.title}</h1>
          <span className={`text-[10px] sm:text-xs shrink-0 ${saveError ? "text-danger" : syncInProgress ? "text-warning" : "text-text-muted"}`}>
            {saveError ? "Save Failed" : syncInProgress ? "Sync in progress" : saving ? "Saving..." : "Saved"}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={handleExport}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:border-accent/50 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 inline-block mr-1" /> Export .txt
          </button>
          <button 
            onClick={onClose}
            className="rounded-lg bg-surface-alt border border-border px-4 py-1.5 text-sm hover:bg-surface transition-all cursor-pointer"
          >
            <X className="w-4 h-4 inline-block mr-1" /> Close
          </button>
        </div>
      </header>

      {/* Main Dual Pane */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane (Cards List) */}
        <section className={`w-full md:w-1/3 md:min-w-[320px] md:max-w-[400px] border-r border-border bg-surface-alt overflow-y-auto p-4 flex flex-col gap-3 ${selectedCardId ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-sm font-semibold text-accent m-0">Cards</h2>
            <button
              onClick={addCard}
              className="p-1 text-accent hover:bg-accent/10 rounded-md transition-colors cursor-pointer"
              title="Add Card"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {cards.length === 0 ? (
              <div className="text-sm text-text-muted italic text-center mt-10">No cards yet.</div>
            ) : (
              cards.map(card => {
                const isSelected = card.id === selectedCardId;
                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, card.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => selectCard(card.id)}
                    className={`group flex items-start gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? "border-accent bg-accent/5" : "border-border bg-bg hover:border-accent/40"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0 text-text-muted/30 group-hover:text-text-muted cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <input 
                        type="text"
                        value={card.title}
                        onChange={(e) => handleTitleChange(card.id, e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium text-text placeholder:text-text-muted/50 w-full"
                        placeholder="Card title..."
                        onClick={(e) => e.stopPropagation()} 
                        onFocus={() => selectCard(card.id)} 
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-text-muted/70">
                          {new Date(card.updated_at.endsWith("Z") ? card.updated_at : card.updated_at + "Z").toLocaleString()}
                        </span>
                        {card.draft_content && (
                          <FileText className="w-3 h-3 text-accent/50" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Pane (Drafting Canvas) */}
        <section className={`flex-1 bg-bg p-4 sm:p-8 overflow-y-auto ${!selectedCardId ? 'hidden md:block' : 'block'}`}>
          {selectedCardId ? (
            <div className="h-full flex flex-col max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-text mb-6">
                {cards.find(c => c.id === selectedCardId)?.title || "Untitled Card"}
              </h2>
              <textarea
                value={draft}
                onChange={handleDraftChange}
                placeholder="Start drafting here..."
                className="flex-1 w-full bg-transparent resize-none outline-none text-text text-base leading-relaxed"
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              Select a card to view its draft
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
