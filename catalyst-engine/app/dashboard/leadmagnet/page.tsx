"use client";

import { useState, useEffect, useCallback } from "react";

interface LeadMagnetResult {
  content: { pageTitle: string; steps: unknown[] };
  markdown: string;
}

interface HistoryRow {
  id: string;
  topic: string;
  title: string;
  step_count: number;
  created_at: string;
}

const FIELDS: { key: string; label: string; placeholder: string; required: boolean; textarea?: boolean }[] = [
  { key: "topic", label: "Topic", placeholder: "e.g. ICP definition for cold outbound", required: true },
  { key: "audience", label: "Audience", placeholder: "e.g. agency founders, 1-20 staff", required: true },
  { key: "promise", label: "Core promise", placeholder: "What will the reader have/know/be able to do after this?", required: true },
  { key: "painAddressed", label: "Pain addressed", placeholder: "The specific problem this solves", required: true },
  { key: "proofPoint", label: "Your proof point (real result, 1-2 sentences)", placeholder: "e.g. Helped X go from Y to Z in N weeks", required: true, textarea: true },
  { key: "contactName", label: "Your name", placeholder: "e.g. Jordan Lee", required: true },
  { key: "bookingLink", label: "Booking link", placeholder: "https://cal.com/you/30min", required: true },
  { key: "contactLinkedin", label: "LinkedIn (optional)", placeholder: "https://linkedin.com/in/you", required: false },
];

export default function LeadMagnetPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LeadMagnetResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const loadHistory = useCallback(() => {
    fetch("/api/leadmagnet")
      .then((r) => r.json())
      .then((d) => setHistory(d.runs || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of FIELDS) {
      if (f.required && !form[f.key]?.trim()) {
        setError(`"${f.label}" is required.`);
        return;
      }
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/leadmagnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, apiKey: apiKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function copyMarkdown() {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function exportMarkdown() {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.content.pageTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <span className="eyebrow block mb-3">Reasoning — leadmagnet.ts</span>
      <h1 className="font-serif text-2xl font-medium mb-2">Lead Magnet Builder</h1>
      <p className="text-fg-dim max-w-xl mb-8">
        Generates a full lead magnet page (4-6 steps, deep content per step) as markdown you can
        paste into Notion, a doc, or a landing page. No fabricated case studies — your proof point
        goes in as an input, not something the model invents.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg mb-10">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">
            Anthropic API key (not stored — sent per request)
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-… (leave blank to use server default, if configured)"
            className="text-sm border border-line rounded px-3 py-2 bg-bg-raised font-mono"
          />
        </label>

        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">
              {f.label}{f.required ? "" : " (optional)"}
            </span>
            {f.textarea ? (
              <textarea
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                rows={2}
                className="text-sm border border-line rounded px-3 py-2 bg-bg-raised resize-y"
              />
            ) : (
              <input
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
              />
            )}
          </label>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
        >
          {loading ? "Building…" : "Build lead magnet"}
        </button>
        {error && <p className="text-crit text-sm">{error}</p>}
      </form>

      {result && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <p className="font-serif text-lg">{result.content.pageTitle}</p>
            <div className="flex gap-2">
              <button
                onClick={copyMarkdown}
                className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded border border-line-strong hover:border-accent hover:text-accent transition-colors"
              >
                {copied ? "Copied" : "Copy markdown"}
              </button>
              <button
                onClick={exportMarkdown}
                className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded border border-line-strong hover:border-accent hover:text-accent transition-colors"
              >
                Export .md
              </button>
            </div>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap rounded border border-line bg-bg-raised p-4 max-h-[600px] overflow-y-auto leading-relaxed">
            {result.markdown}
          </pre>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-line max-w-2xl">
          <span className="eyebrow block mb-3">Recent runs</span>
          <div className="flex flex-col gap-1">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-line last:border-0">
                <span className="font-serif flex-1 truncate">{h.title}</span>
                <span className="text-fg-dim font-mono text-xs">{h.step_count} steps</span>
                <span className="text-fg-dim font-mono text-xs">{new Date(h.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
