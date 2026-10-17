import { useState, useEffect, useRef } from "react";
import { Mic, Radio, X, Check, FileCode, Trash2, ArrowRight } from "lucide-react";
import { parseRantTranscript, type ParsedItem } from "../engine/rantParser";
import { exportCardAsOriginMd, downloadFile } from "../engine/exportEngine";
import { getDb, domains, type DomainKey } from "../App";

interface VoiceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsImported: () => void;
}

export default function VoiceCaptureModal({
  isOpen,
  onClose,
  onItemsImported,
}: VoiceCaptureModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvedIndices, setApprovedIndices] = useState<Set<number>>(new Set());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Web Speech Recognition reference
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setTranscript("");
      setParsedItems([]);
      setApprovedIndices(new Set());
      setStatusMessage(null);
    }
  }, [isOpen]);

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage("Speech recognition not supported in this browser/environment. You can paste or type your rant directly below.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalSoFar = transcript;

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSoFar += (finalSoFar ? " " : "") + trans;
          } else {
            interim += trans;
          }
        }
        setTranscript(finalSoFar + (interim ? " " + interim : ""));
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
        setStatusMessage(`Mic error: ${e.error || "Speech recognition paused."}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setStatusMessage("Listening... Speak freely about apps, goals, experiences, or reflections.");
    } catch (err) {
      console.error(err);
      setStatusMessage("Could not access microphone.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleDecompose = () => {
    if (!transcript.trim()) return;
    stopRecording();
    setIsProcessing(true);

    try {
      const result = parseRantTranscript(transcript);
      setParsedItems(result.items);
      // Auto-approve all by default for one-click simplicity
      setApprovedIndices(new Set(result.items.map((_, i) => i)));
      setStatusMessage(`Identified ${result.items.length} distinct item${result.items.length !== 1 ? "s" : ""} across domains.`);
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to decompose transcript.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleApproval = (index: number) => {
    const next = new Set(approvedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setApprovedIndices(next);
  };

  const updateItemTitle = (index: number, newTitle: string) => {
    setParsedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, title: newTitle } : item))
    );
  };

  const updateItemDomain = (index: number, newDomain: DomainKey) => {
    setParsedItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              domain: newDomain,
              is_software_build: newDomain === "build_ideas",
            }
          : item
      )
    );
  };

  const handleSaveToDatabase = async () => {
    const toSave = parsedItems.filter((_, i) => approvedIndices.has(i));
    if (toSave.length === 0) return;

    setIsProcessing(true);
    try {
      const db = await getDb();
      for (const item of toSave) {
        // Insert into respective domain with native SQLite deduplication
        await db.execute(
          `INSERT OR IGNORE INTO ${item.domain} (title, notes, raw_import_text, action_trigger) VALUES ($1, $2, $3, $4)`,
          [item.title, item.notes || null, transcript, item.action_trigger || null]
        );
      }
      setStatusMessage(`Saved ${toSave.length} item${toSave.length !== 1 ? "s" : ""} to The Mainframe!`);
      setTimeout(() => {
        onItemsImported();
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Error saving to database: ${err}`);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${isRecording ? "text-danger animate-pulse" : "text-accent"}`} />
            <h2 className="text-base font-semibold text-text m-0">Voice Rant & Quick Capture</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Mic control */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-alt border border-border gap-3 text-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? "bg-danger text-white ring-4 ring-danger/30 scale-105"
                  : "bg-accent text-bg hover:opacity-90 hover:scale-105"
              }`}
              title={isRecording ? "Stop Recording" : "Start Voice Rant"}
            >
              <Mic className="w-7 h-7" />
            </button>
            <span className="text-xs font-medium text-text-muted">
              {isRecording ? "Recording... Tap to pause" : "Tap mic and speak freely"}
            </span>
          </div>

          {/* Transcript input / preview */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Spoken Transcript (or Paste Rant)
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak or type your raw stream of consciousness... (e.g. 'I want to build an app for offline photo indexing, and need to buy a portable monitor, and also hike Mt Fuji next year')"
              rows={4}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/40 outline-none focus:border-accent/50 transition-colors resize-y font-sans"
            />
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="text-xs text-text-muted px-1 italic">
              {statusMessage}
            </div>
          )}

          {/* Decompose button */}
          {parsedItems.length === 0 && (
            <button
              onClick={handleDecompose}
              disabled={isProcessing || !transcript.trim()}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-bg hover:bg-accent/90 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Sort Into Domains <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Parsed Items Approval Drawer */}
          {parsedItems.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Decomposed Domain Cards ({approvedIndices.size}/{parsedItems.length} Approved)
                </span>
                <button
                  onClick={() => {
                    if (approvedIndices.size === parsedItems.length) {
                      setApprovedIndices(new Set());
                    } else {
                      setApprovedIndices(new Set(parsedItems.map((_, i) => i)));
                    }
                  }}
                  className="text-xs text-accent hover:underline cursor-pointer"
                >
                  {approvedIndices.size === parsedItems.length ? "Deselect All" : "Approve All"}
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {parsedItems.map((item, idx) => {
                  const isApproved = approvedIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${
                        isApproved
                          ? "bg-surface-alt border-accent/40"
                          : "bg-surface-alt/40 border-border opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleApproval(idx)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                            isApproved
                              ? "bg-accent text-bg"
                              : "border border-border text-transparent"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItemTitle(idx, e.target.value)}
                          className="flex-1 bg-transparent text-sm font-medium text-text outline-none border-b border-transparent focus:border-accent/40 px-1 py-0.5"
                        />
                        <select
                          value={item.domain}
                          onChange={(e) => updateItemDomain(idx, e.target.value as DomainKey)}
                          className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text outline-none focus:border-accent/50 cursor-pointer"
                        >
                          {domains.map((d) => (
                            <option key={d.key} value={d.key}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {item.action_trigger && (
                        <div className="text-[11.5px] text-accent/80 pl-7">
                          Trigger: {item.action_trigger}
                        </div>
                      )}

                      {/* origin.md export button for software ideas */}
                      {item.is_software_build && (
                        <div className="flex justify-end pt-1 pl-7">
                          <button
                            type="button"
                            onClick={() => {
                              const originText = exportCardAsOriginMd(
                                {
                                  id: 0,
                                  title: item.title,
                                  notes: item.notes || null,
                                  status: "not_started",
                                  created_at: new Date().toISOString(),
                                  updated_at: new Date().toISOString(),
                                  target_date: null,
                                  target_time: null,
                                  raw_import_text: transcript,
                                },
                                []
                              );
                              downloadFile(
                                `${item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_origin.md`,
                                originText
                              );
                            }}
                            className="rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs text-accent hover:bg-accent/20 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <FileCode className="w-3.5 h-3.5" /> Seed origin.md
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-surface-alt">
          <button
            onClick={() => {
              setParsedItems([]);
              setTranscript("");
            }}
            className="text-xs text-text-muted hover:text-danger transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-text-muted hover:text-text hover:bg-surface transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToDatabase}
              disabled={isProcessing || approvedIndices.size === 0}
              className="rounded-xl bg-accent px-5 py-2 text-xs font-medium text-bg hover:bg-accent/90 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save {approvedIndices.size} Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
