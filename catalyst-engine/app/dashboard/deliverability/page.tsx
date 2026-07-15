"use client";

import { useState, useEffect, useCallback } from "react";

interface Flag {
  severity: "HIGH" | "MEDIUM";
  type: string;
  detail: string;
  line: string;
}

interface ScanResult {
  pass: boolean;
  flagCount: number;
  highCount: number;
  mediumCount: number;
  flags: Flag[];
}

interface HistoryRow {
  id: string;
  pass: number;
  flag_count: number;
  created_at: string;
}

const PLACEHOLDER = `Subject: Quick question about your onboarding flow

Good news / bad news — which do you want first?

Bad news — this is a cold message.

Good news — most teams your size lose 15-20% of trial signups in the first onboarding step alone.`;

export default function DeliverabilityPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const loadHistory = useCallback(() => {
    fetch("/api/deliverability")
      .then((r) => r.json())
      .then((d) => setHistory(d.runs || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError("Paste a draft first — include a 'Subject:' line if you want subject checks.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/deliverability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed.");
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <span className="eyebrow block mb-3">Deterministic — scan.ts</span>
      <h1 className="font-serif text-2xl font-medium mb-2">Deliverability Guard</h1>
      <p className="text-fg-dim max-w-xl mb-8">
        Paste a draft, subject line included as <code className="font-mono text-xs">Subject: ...</code>{" "}
        on its own line. Rule-based scan, no model call — same result every time for the same input.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mb-10">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={10}
          className="text-sm font-mono border border-line rounded px-3 py-2.5 bg-bg-raised resize-y"
        />
        <button
          type="submit"
          disabled={loading}
          className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
        >
          {loading ? "Scanning…" : "Scan draft"}
        </button>
        {error && <p className="text-crit text-sm">{error}</p>}
      </form>

      {result && (
        <div className="flex flex-col gap-6 max-w-xl">
          <div
            className={`rounded border p-6 flex items-center gap-4 ${
              result.pass ? "border-ok/40 bg-ok/10" : "border-crit/40 bg-crit/10"
            }`}
          >
            <span className={`font-serif text-3xl font-medium ${result.pass ? "text-ok" : "text-crit"}`}>
              {result.pass ? "PASS" : "FAIL"}
            </span>
            <span className="font-mono text-sm text-fg-dim">
              {result.flagCount} flag{result.flagCount === 1 ? "" : "s"} — {result.highCount} high, {result.mediumCount} medium
            </span>
          </div>

          {result.flags.length > 0 && (
            <div className="flex flex-col gap-2">
              {result.flags.map((f, i) => (
                <div key={i} className="rounded border border-line bg-bg-raised px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        f.severity === "HIGH" ? "bg-crit/15 text-crit" : "bg-accent/15 text-accent"
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="font-mono text-xs text-fg-dim">{f.type}</span>
                  </div>
                  <p className="text-sm">{f.detail}</p>
                  <p className="text-xs text-fg-dim font-mono mt-1 truncate">&ldquo;{f.line}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-line max-w-xl">
          <span className="eyebrow block mb-3">Recent runs</span>
          <div className="flex flex-col gap-1">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-line last:border-0">
                <span className={`font-mono font-semibold w-10 ${h.pass ? "text-ok" : "text-crit"}`}>
                  {h.pass ? "PASS" : "FAIL"}
                </span>
                <span className="text-fg-dim font-mono text-xs flex-1">{h.flag_count} flags</span>
                <span className="text-fg-dim font-mono text-xs">{new Date(h.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
