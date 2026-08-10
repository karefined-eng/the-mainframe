import { useState } from "react";
import type { DomainKey } from "../App";
import { getDb } from "../App";

interface PasteIngestProps {
  domain: DomainKey;
  onImported: () => void;
}

export default function PasteIngest({ domain, onImported }: PasteIngestProps) {
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setImporting(true);
    try {
      const db = await getDb();
      for (const line of lines) {
        await db.execute(
          `INSERT OR IGNORE INTO ${domain} (title, raw_import_text) VALUES ($1, $2)`,
          [line, line],
        );
      }
      setResult(`${lines.length} item${lines.length !== 1 ? "s" : ""} imported`);
      setText("");
      // Brief delay to show the success message before closing
      setTimeout(() => {
        onImported();
      }, 800);
    } catch (err) {
      setResult(`Error: ${err}`);
      setImporting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-accent/20 bg-surface p-5 flex flex-col gap-3">
      <p className="text-sm text-text-muted m-0">
        Paste a list — one item per line. Each line becomes a new entry.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Learn Rust\nBuild a CLI tool\nRead SICP"}
        rows={6}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-muted/40 outline-none focus:border-accent/50 transition-colors resize-y font-mono"
        disabled={importing}
        autoFocus
      />
      <div className="flex items-center justify-between">
        {result ? (
          <span className={`text-sm font-medium ${result.startsWith("Error") ? "text-danger" : "text-success"}`}>
            ✓ {result}
          </span>
        ) : (
          <span className="text-xs text-text-muted">
            {text.split("\n").filter((l) => l.trim()).length} line
            {text.split("\n").filter((l) => l.trim()).length !== 1 ? "s" : ""} detected
          </span>
        )}
        <button
          onClick={handleImport}
          disabled={importing || text.trim().length === 0}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent/90 disabled:opacity-40 transition-all cursor-pointer"
        >
          {importing ? "Importing…" : "Import"}
        </button>
      </div>
    </div>
  );
}
