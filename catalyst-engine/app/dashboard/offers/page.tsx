"use client";

import { useState, useEffect, useCallback } from "react";

type OfferCategory = "Insight" | "Framework" | "Gap Audit" | "Template/Tool" | "Call";

interface OfferIdea {
  category: OfferCategory;
  friction: string;
  headline: string;
  body: string;
  whenToUse: string;
}

interface OfferResult {
  offers: OfferIdea[];
  recommendedPrimary: OfferCategory;
  reasoning: string;
}

interface HistoryRow {
  id: string;
  icp: string;
  recommended_primary: string;
  created_at: string;
}

const FRICTION_COLOR: Record<string, string> = {
  None: "text-ok",
  Low: "text-ok",
  Medium: "text-accent",
  High: "text-crit",
};

export default function OffersPage() {
  const [icp, setIcp] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [context, setContext] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OfferResult | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const loadHistory = useCallback(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((d) => setHistory(d.runs || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!icp.trim()) {
      setError("Describe the ICP first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icp, painPoint: painPoint || undefined, context: context || undefined, apiKey: apiKey || undefined }),
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

  return (
    <div>
      <span className="eyebrow block mb-3">Reasoning — offers.ts</span>
      <h1 className="font-serif text-2xl font-medium mb-2">Offer Idea Generator</h1>
      <p className="text-fg-dim max-w-xl mb-8">
        One offer per friction level (Insight, Framework, Gap Audit, Template/Tool, Call), tailored to
        your ICP. Cold first emails should lead with Insight or Framework, not a Call.
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
            className="field-input text-sm font-mono"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">ICP</span>
          <textarea
            value={icp}
            onChange={(e) => setIcp(e.target.value)}
            placeholder="e.g. B2B logistics companies, 20-200 employees, ops leadership"
            rows={2}
            className="field-input text-sm resize-y"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">Pain point (optional)</span>
          <input
            value={painPoint}
            onChange={(e) => setPainPoint(e.target.value)}
            placeholder="e.g. manual carrier reconciliation eating finance team hours"
            className="field-input text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">Additional context (optional)</span>
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. this is a follow-up sequence for warm inbound, not a cold first touch"
            className="field-input text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-focus font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
        >
          {loading ? "Generating…" : "Generate offers"}
        </button>
        {error && <p className="text-crit text-sm">{error}</p>}
      </form>

      {result && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
            <span className="eyebrow block mb-1">Recommended primary</span>
            <p className="font-serif text-lg">{result.recommendedPrimary}</p>
            <p className="text-sm text-fg-dim mt-1">{result.reasoning}</p>
          </div>

          {result.offers.map((offer, i) => (
            <div key={i} className="surface p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif text-base">{offer.category}</span>
                <span className={`font-mono text-[0.65rem] uppercase tracking-wider ${FRICTION_COLOR[offer.friction] || "text-fg-dim"}`}>
                  {offer.friction} friction
                </span>
              </div>
              <p className="font-mono text-sm mb-1">{offer.headline}</p>
              <p className="text-sm text-fg-dim mb-2">{offer.body}</p>
              <p className="text-xs text-fg-dim font-mono">When to use: {offer.whenToUse}</p>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-line max-w-2xl">
          <span className="eyebrow block mb-3">Recent runs</span>
          <div className="flex flex-col gap-1">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-line last:border-0">
                <span className="text-fg-dim flex-1 truncate">{h.icp}</span>
                <span className="font-mono text-xs text-accent">{h.recommended_primary}</span>
                <span className="text-fg-dim font-mono text-xs">{new Date(h.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
