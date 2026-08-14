import { useState } from "react";
import { Download } from "lucide-react";
import type { DomainKey } from "../App";
import { getDb, domains } from "../App";

export default function BackupExport() {
  const [status, setStatus] = useState<string | null>(null);

  const exportDomainText = async (domain: DomainKey) => {
    try {
      const db = await getDb();
      const rows = await db.select<{ title: string; notes: string | null; status: string }[]>(
        `SELECT title, notes, status FROM ${domain} ORDER BY updated_at DESC`,
      );
      const lines = rows.map(
        (r) => `[${r.status}] ${r.title}${r.notes ? ` — ${r.notes}` : ""}`,
      );
      const text = lines.join("\n");

      // Copy to clipboard as the simplest cross-platform export
      await navigator.clipboard.writeText(text);
      setStatus(`${domain}: ${rows.length} items copied to clipboard`);
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  const exportAllText = async () => {
    try {
      const db = await getDb();
      const sections: string[] = [];
      for (const d of domains) {
        const rows = await db.select<{ title: string; notes: string | null; status: string }[]>(
          `SELECT title, notes, status FROM ${d.key} ORDER BY updated_at DESC`,
        );
        const lines = rows.map(
          (r) => `  [${r.status}] ${r.title}${r.notes ? ` — ${r.notes}` : ""}`,
        );
        sections.push(`## ${d.label}\n${lines.length ? lines.join("\n") : "  (empty)"}`);
      }
      await navigator.clipboard.writeText(`# The Mainframe — Export\n\n${sections.join("\n\n")}`);
      setStatus("Full export copied to clipboard");
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface-alt p-6">
        <h3 className="m-0 mb-4 text-base font-semibold">Export Data</h3>
        <p className="text-sm text-text-muted mb-4">
          Export your data as plain text (copied to clipboard).
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={exportAllText}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent/90 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 inline-block mr-2" /> Export All Domains
          </button>
          {domains.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.key}
                onClick={() => exportDomainText(d.key)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text hover:border-accent/50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Icon className="w-4 h-4" /> {d.label}
              </button>
            );
          })}
        </div>

        {status && (
          <p className={`text-sm font-medium m-0 ${status.startsWith("Error") ? "text-danger" : "text-success"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
