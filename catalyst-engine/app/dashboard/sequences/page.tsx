"use client";

import { useState } from "react";
import { toCsv } from "@/lib/csv";

interface LeadInput {
  name: string;
  company: string;
  title?: string;
  painSignal?: string;
  website?: string;
}

interface SequenceOutput {
  openerSubject: string;
  openerBody: string;
  touch2Subject: string;
  touch2Body: string;
  touch3Subject: string;
  touch3Body: string;
}

type SequenceResult =
  | { lead: LeadInput; ok: true; sequence: SequenceOutput }
  | { lead: LeadInput; ok: false; error: string };

export default function SequencesPage() {
  const [mode, setMode] = useState<"single" | "csv">("single");
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lead, setLead] = useState<LeadInput>({ name: "", company: "", title: "", painSignal: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SequenceResult[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let res: Response;
      if (mode === "csv") {
        if (!file) throw new Error("Choose a CSV file first.");
        const form = new FormData();
        form.append("file", file);
        if (apiKey) form.append("apiKey", apiKey);
        res = await fetch("/api/sequences", { method: "POST", body: form });
      } else {
        if (!lead.name && !lead.company) throw new Error("Provide at least a name or company.");
        res = await fetch("/api/sequences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead, apiKey: apiKey || undefined }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!results) return;
    const headers = ["name", "company", "status", "opener_subject", "opener_body", "touch2_subject", "touch2_body", "touch3_subject", "touch3_body", "error"];
    const rows = results.map((r) =>
      r.ok
        ? [r.lead.name, r.lead.company, "draft", r.sequence.openerSubject, r.sequence.openerBody, r.sequence.touch2Subject, r.sequence.touch2Body, r.sequence.touch3Subject, r.sequence.touch3Body, ""]
        : [r.lead.name, r.lead.company, "needs_manual_review", "", "", "", "", "", "", r.error]
    );
    const csv = toCsv(headers, rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sequences.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <span className="eyebrow block mb-3">Reasoning — sequence.ts</span>
      <h1 className="font-serif text-2xl font-medium mb-2">Sequence Generator</h1>
      <p className="text-fg-dim max-w-xl mb-8">
        Each lead gets its own opener + 3-touch sequence from the pattern-interrupt formula. Weak
        or missing signal is flagged for manual review rather than shipped as generic copy.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mb-10">
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

        <div className="flex gap-1 font-mono text-xs uppercase tracking-wider w-fit rounded border border-line overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`px-3 py-1.5 ${mode === "single" ? "bg-accent text-on-accent" : "hover:bg-bg-raised"}`}
          >
            Single lead
          </button>
          <button
            type="button"
            onClick={() => setMode("csv")}
            className={`px-3 py-1.5 ${mode === "csv" ? "bg-accent text-on-accent" : "hover:bg-bg-raised"}`}
          >
            CSV (up to 25)
          </button>
        </div>

        {mode === "single" ? (
          <div className="flex flex-col gap-3">
            <input
              placeholder="Name"
              value={lead.name}
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
              className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
            />
            <input
              placeholder="Company"
              value={lead.company}
              onChange={(e) => setLead({ ...lead, company: e.target.value })}
              className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
            />
            <input
              placeholder="Title (optional)"
              value={lead.title}
              onChange={(e) => setLead({ ...lead, title: e.target.value })}
              className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
            />
            <input
              placeholder="Visible pain signal (optional) — e.g. 'hiring a BDR', 'running ads'"
              value={lead.painSignal}
              onChange={(e) => setLead({ ...lead, painSignal: e.target.value })}
              className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
            />
            <input
              placeholder="Website (optional)"
              value={lead.website}
              onChange={(e) => setLead({ ...lead, website: e.target.value })}
              className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
            />
          </div>
        ) : (
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">
              CSV — columns: name, company, title, pain_signal, website
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm border border-line rounded px-3 py-2 bg-bg-raised file:mr-3 file:font-mono file:text-xs file:uppercase file:border-0 file:bg-line file:rounded file:px-2 file:py-1"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
        >
          {loading ? "Generating…" : "Generate sequence(s)"}
        </button>
        {error && <p className="text-crit text-sm">{error}</p>}
      </form>

      {results && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-fg-dim">
              {results.filter((r) => r.ok).length} generated · {results.filter((r) => !r.ok).length} flagged for review
            </p>
            <button
              onClick={exportCsv}
              className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded border border-line-strong hover:border-accent hover:text-accent transition-colors"
            >
              Export CSV
            </button>
          </div>

          {results.map((r, i) => (
            <details key={i} className="rounded border border-line bg-bg-raised group" open={results.length === 1}>
              <summary className="cursor-pointer px-4 py-3 flex items-center justify-between">
                <span className="font-serif">
                  {r.lead.name || "—"} <span className="text-fg-dim">at</span> {r.lead.company || "—"}
                </span>
                <span
                  className={`font-mono text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    r.ok ? "bg-ok/15 text-ok" : "bg-crit/15 text-crit"
                  }`}
                >
                  {r.ok ? "draft" : "needs review"}
                </span>
              </summary>
              <div className="px-4 pb-4 flex flex-col gap-4 text-sm">
                {r.ok ? (
                  <>
                    <Touch label="Touch 1 — Opener" subject={r.sequence.openerSubject} body={r.sequence.openerBody} />
                    <Touch label="Touch 2 — Proof" subject={r.sequence.touch2Subject} body={r.sequence.touch2Body} />
                    <Touch label="Touch 3 — Exit" subject={r.sequence.touch3Subject} body={r.sequence.touch3Body} />
                  </>
                ) : (
                  <p className="text-crit">{r.error}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function Touch({ label, subject, body }: { label: string; subject: string; body: string }) {
  return (
    <div className="border-t border-line pt-3 first:border-0 first:pt-0">
      <span className="font-mono text-[0.65rem] uppercase tracking-wider text-accent block mb-1">{label}</span>
      <p className="font-mono text-xs text-fg-dim mb-1">Subject: {subject}</p>
      <p className="whitespace-pre-wrap leading-relaxed">{body}</p>
    </div>
  );
}
