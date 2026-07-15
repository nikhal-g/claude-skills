"use client";

import { useState, useEffect, useCallback } from "react";

interface CompetitorProfile {
  whatTheyDo: string;
  pricingNotes: string;
  statedDifferentiators: string[];
  weaknesses: string[];
  differentiationOpportunities: string[];
  onelinePositioning: string;
}

interface HistoryRow {
  id: string;
  competitor_name: string;
  url: string;
  created_at: string;
}

export default function CompetitorPage() {
  const [competitorName, setCompetitorName] = useState("");
  const [url, setUrl] = useState("");
  const [pricingUrl, setPricingUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ profile: CompetitorProfile; sourcesUsed: string[] } | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  const loadHistory = useCallback(() => {
    fetch("/api/competitor")
      .then((r) => r.json())
      .then((d) => setHistory(d.runs || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!competitorName.trim() || !url.trim()) {
      setError("Name and homepage URL are both required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorName,
          url,
          pricingUrl: pricingUrl || undefined,
          apiKey: apiKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profiling failed.");
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profiling failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <span className="eyebrow block mb-3">Reasoning + fetch — competitor.ts</span>
      <h1 className="font-serif text-2xl font-medium mb-2">Competitor Profiler</h1>
      <p className="text-fg-dim max-w-xl mb-8">
        Fetches the pages you point it at and builds a positioning profile from what&rsquo;s
        actually there. It does not crawl review sites (G2, Capterra, Reddit) — that needs
        search access this tool doesn&rsquo;t have, so weaknesses are only what the page text
        itself supports.
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
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">Competitor name</span>
          <input
            value={competitorName}
            onChange={(e) => setCompetitorName(e.target.value)}
            placeholder="e.g. Instantly"
            className="field-input text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">Homepage URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instantly.ai"
            className="field-input text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">Pricing page URL (optional)</span>
          <input
            value={pricingUrl}
            onChange={(e) => setPricingUrl(e.target.value)}
            placeholder="https://instantly.ai/pricing"
            className="field-input text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn-focus font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
        >
          {loading ? "Fetching and profiling…" : "Build profile"}
        </button>
        {error && <p className="text-crit text-sm">{error}</p>}
      </form>

      {result && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
            <span className="eyebrow block mb-1">One-line positioning</span>
            <p className="font-serif text-lg">{result.profile.onelinePositioning}</p>
          </div>

          <div className="surface p-4">
            <span className="eyebrow block mb-2">What they do</span>
            <p className="text-sm">{result.profile.whatTheyDo}</p>
          </div>

          <div className="surface p-4">
            <span className="eyebrow block mb-2">Pricing</span>
            <p className="text-sm text-fg-dim">{result.profile.pricingNotes}</p>
          </div>

          <div className="surface p-4">
            <span className="eyebrow block mb-2">Stated differentiators</span>
            <ul className="text-sm space-y-1 list-disc list-inside text-fg-dim">
              {result.profile.statedDifferentiators.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          {result.profile.weaknesses.length > 0 && (
            <div className="surface p-4">
              <span className="eyebrow block mb-2">Weaknesses (evidence-based only)</span>
              <ul className="text-sm space-y-1 list-disc list-inside text-fg-dim">
                {result.profile.weaknesses.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-ok/30 bg-ok/10 p-4">
            <span className="eyebrow block mb-2" style={{ color: "var(--ok)" }}>Where you can differentiate</span>
            <ul className="text-sm space-y-1 list-disc list-inside text-fg-dim">
              {result.profile.differentiationOpportunities.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-fg-dim font-mono">Sources: {result.sourcesUsed.join(", ")}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-line max-w-2xl">
          <span className="eyebrow block mb-3">Recent runs</span>
          <div className="flex flex-col gap-1">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-line last:border-0">
                <span className="font-serif flex-1 truncate">{h.competitor_name}</span>
                <span className="text-fg-dim font-mono text-xs truncate max-w-[200px]">{h.url}</span>
                <span className="text-fg-dim font-mono text-xs">{new Date(h.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
