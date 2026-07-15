"use client";

import { useState, useEffect, useCallback } from "react";
import { toCsv } from "@/lib/csv";

interface LeadInput {
  name: string;
  company: string;
  email?: string;
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

interface HistoryRow {
  id: string;
  lead_count: number;
  ok_count: number;
  created_at: string;
}

interface InstantlyPushResult {
  email: string;
  ok: boolean;
  error?: string;
}

export default function SequencesPage() {
  const [mode, setMode] = useState<"single" | "csv">("single");
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lead, setLead] = useState<LeadInput>({ name: "", company: "", email: "", title: "", painSignal: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SequenceResult[] | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const [instantlyKey, setInstantlyKey] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [pushing, setPushing] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushResults, setPushResults] = useState<InstantlyPushResult[] | null>(null);

  const loadHistory = useCallback(() => {
    fetch("/api/sequences")
      .then((r) => r.json())
      .then((d) => setHistory(d.runs || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setPushResults(null);

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
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePush() {
    if (!results) return;
    setPushing(true);
    setPushError(null);
    setPushResults(null);
    try {
      const res = await fetch("/api/instantly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, apiKey: instantlyKey, results }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Push to Instantly failed.");
      setPushResults(data.results);
    } catch (err) {
      setPushError(err instanceof Error ? err.message : "Push to Instantly failed.");
    } finally {
      setPushing(false);
    }
  }

  function exportCsv() {
    if (!results) return;
    const headers = ["name", "company", "email", "status", "opener_subject", "opener_body", "touch2_subject", "touch2_body", "touch3_subject", "touch3_body", "error"];
    const rows = results.map((r) =>
      r.ok
        ? [r.lead.name, r.lead.company, r.lead.email || "", "draft", r.sequence.openerSubject, r.sequence.openerBody, r.sequence.touch2Subject, r.sequence.touch2Body, r.sequence.touch3Subject, r.sequence.touch3Body, ""]
        : [r.lead.name, r.lead.company, r.lead.email || "", "needs_manual_review", "", "", "", "", "", "", r.error]
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

  const pushableCount = results ? results.filter((r) => r.ok && r.lead.email).length : 0;

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
            className="field-input text-sm font-mono"
          />
        </label>

        <div className="flex gap-1 font-mono text-xs uppercase tracking-wider w-fit rounded-xl border border-line overflow-hidden">
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
              className="field-input text-sm"
            />
            <input
              placeholder="Company"
              value={lead.company}
              onChange={(e) => setLead({ ...lead, company: e.target.value })}
              className="field-input text-sm"
            />
            <input
              placeholder="Email (needed only if you'll push to Instantly)"
              value={lead.email}
              onChange={(e) => setLead({ ...lead, email: e.target.value })}
              className="field-input text-sm"
            />
            <input
              placeholder="Title (optional)"
              value={lead.title}
              onChange={(e) => setLead({ ...lead, title: e.target.value })}
              className="field-input text-sm"
            />
            <input
              placeholder="Visible pain signal (optional) — e.g. 'hiring a BDR', 'running ads'"
              value={lead.painSignal}
              onChange={(e) => setLead({ ...lead, painSignal: e.target.value })}
              className="field-input text-sm"
            />
            <input
              placeholder="Website (optional)"
              value={lead.website}
              onChange={(e) => setLead({ ...lead, website: e.target.value })}
              className="field-input text-sm"
            />
          </div>
        ) : (
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">
              CSV — columns: name, company, email, title, pain_signal, website
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="field-input text-sm file:mr-3 file:font-mono file:text-xs file:uppercase file:border-0 file:bg-line file:rounded file:px-2 file:py-1"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-focus font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
        >
          {loading ? "Generating…" : "Generate sequence(s)"}
        </button>
        {error && <p className="text-crit text-sm">{error}</p>}
      </form>

      {results && (
        <div className="flex flex-col gap-4 max-w-2xl mb-10">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-fg-dim">
              {results.filter((r) => r.ok).length} generated · {results.filter((r) => !r.ok).length} flagged for review
            </p>
            <button
              onClick={exportCsv}
              className="btn-focus font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-xl border border-line-strong hover:border-accent hover:text-accent transition-colors"
            >
              Export CSV
            </button>
          </div>

          {results.map((r, i) => (
            <details key={i} className="surface group" open={results.length === 1}>
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

          <div className="surface p-5">
            <span className="eyebrow block mb-1">Push to Instantly</span>
            <p className="text-sm text-fg-dim mb-4">
              Sends each generated sequence into an existing Instantly campaign as a lead with
              custom variables (<code className="font-mono text-xs">opener_subject</code>,{" "}
              <code className="font-mono text-xs">opener_body</code>,{" "}
              <code className="font-mono text-xs">touch2_subject</code>, etc.) — your campaign&rsquo;s
              own email steps in Instantly need to reference those variables to actually send this
              copy. Requires your own Instantly API key and an email address per lead.{" "}
              {pushableCount} of {results.length} leads here have an email and can be pushed.
            </p>
            <div className="flex flex-col gap-3 max-w-sm mb-4">
              <input
                type="password"
                value={instantlyKey}
                onChange={(e) => setInstantlyKey(e.target.value)}
                placeholder="Instantly API key"
                className="field-input text-sm font-mono"
              />
              <input
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="Instantly campaign ID"
                className="field-input text-sm"
              />
            </div>
            <button
              onClick={handlePush}
              disabled={pushing || pushableCount === 0 || !instantlyKey || !campaignId}
              className="btn-focus font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
            >
              {pushing ? "Pushing…" : `Push ${pushableCount} lead${pushableCount === 1 ? "" : "s"} to Instantly`}
            </button>
            {pushError && <p className="text-crit text-sm mt-3">{pushError}</p>}
            {pushResults && (
              <div className="flex flex-col gap-1 mt-4">
                {pushResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-1 border-t border-line first:border-0">
                    <span className={`font-mono text-xs ${r.ok ? "text-ok" : "text-crit"}`}>{r.ok ? "OK" : "FAILED"}</span>
                    <span className="flex-1 truncate">{r.email}</span>
                    {r.error && <span className="text-xs text-fg-dim truncate max-w-xs">{r.error}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-8 border-t border-line max-w-2xl">
          <span className="eyebrow block mb-3">Recent runs</span>
          <div className="flex flex-col gap-1">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-line last:border-0">
                <span className="font-mono text-xs text-fg-dim flex-1">
                  {h.ok_count}/{h.lead_count} generated
                </span>
                <span className="text-fg-dim font-mono text-xs">{new Date(h.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
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
