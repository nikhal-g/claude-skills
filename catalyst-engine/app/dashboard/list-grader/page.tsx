"use client";

import { useState } from "react";

type Letter = "A" | "B" | "C" | "D" | "F";

interface DimensionResult {
  key: string;
  label: string;
  grade: Letter | null;
  detail: string;
  weight: number;
  included: boolean;
}

interface GradeReport {
  totalLeads: number;
  uniqueEmails: number;
  overallGrade: Letter;
  overallScore: number;
  dimensions: DimensionResult[];
  criticalIssues: string[];
  recommendedFixes: string[];
  readyToSend: boolean;
  warnings: string[];
}

const GRADE_COLOR: Record<Letter, string> = {
  A: "text-ok",
  B: "text-ok",
  C: "text-accent",
  D: "text-crit",
  F: "text-crit",
};

export default function ListGraderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [icpGrade, setIcpGrade] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<GradeReport | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);

    const form = new FormData();
    form.append("file", file);
    if (icpGrade) form.append("icpGrade", icpGrade);

    try {
      const res = await fetch("/api/grade", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Grading failed.");
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grading failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <span className="eyebrow block mb-3">Deterministic — list-grader.ts</span>
      <h1 className="font-serif text-2xl font-medium mb-2">List Grader</h1>
      <p className="text-fg-dim max-w-xl mb-8">
        Upload a lead CSV. Columns recognized: <code className="font-mono text-xs">email</code>,{" "}
        <code className="font-mono text-xs">title</code>,{" "}
        <code className="font-mono text-xs">catch_all</code>,{" "}
        <code className="font-mono text-xs">verified</code> (any are optional; missing dimensions
        are skipped, not guessed).
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mb-10">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">CSV file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm border border-line rounded px-3 py-2 bg-bg-raised file:mr-3 file:font-mono file:text-xs file:uppercase file:border-0 file:bg-line file:rounded file:px-2 file:py-1"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">
            ICP fit (manual — this dimension is judgment, not mechanical)
          </span>
          <select
            value={icpGrade}
            onChange={(e) => setIcpGrade(e.target.value)}
            className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
          >
            <option value="">Not scored</option>
            <option value="A">A — most leads squarely in target ICP</option>
            <option value="B">B — some leads outside range</option>
            <option value="C">C — most leads outside range</option>
            <option value="F">F — wrong audience entirely</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
        >
          {loading ? "Grading…" : "Grade list"}
        </button>

        {error && <p className="text-crit text-sm">{error}</p>}
      </form>

      {report && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6 rounded border border-line bg-bg-raised p-6">
            <div className={`font-serif text-6xl font-medium tabular ${GRADE_COLOR[report.overallGrade]}`}>
              {report.overallGrade}
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-fg-dim mb-1">
                {report.totalLeads} rows · {report.uniqueEmails} unique emails
              </p>
              <p className={`font-mono text-sm ${report.readyToSend ? "text-ok" : "text-crit"}`}>
                {report.readyToSend ? "Ready to send" : "Do not send yet"}
              </p>
            </div>
          </div>

          <div className="rounded border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-raised border-b border-line-strong">
                  <th className="text-left font-mono text-xs uppercase tracking-wider text-fg-dim px-4 py-2.5">
                    Dimension
                  </th>
                  <th className="text-left font-mono text-xs uppercase tracking-wider text-fg-dim px-4 py-2.5">
                    Weight
                  </th>
                  <th className="text-left font-mono text-xs uppercase tracking-wider text-fg-dim px-4 py-2.5">
                    Grade
                  </th>
                  <th className="text-left font-mono text-xs uppercase tracking-wider text-fg-dim px-4 py-2.5">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.dimensions.map((d) => (
                  <tr key={d.key} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5">{d.label}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-fg-dim tabular">
                      {Math.round(d.weight * 100)}%
                    </td>
                    <td className={`px-4 py-2.5 font-mono font-semibold ${d.grade ? GRADE_COLOR[d.grade] : "text-fg-dim"}`}>
                      {d.grade ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-fg-dim">{d.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.criticalIssues.length > 0 && (
            <div className="rounded border border-crit/40 bg-crit/10 p-4">
              <span className="eyebrow text-crit block mb-2">Critical — must fix before sending</span>
              <ul className="text-sm space-y-1 list-disc list-inside text-fg-dim">
                {report.criticalIssues.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {report.recommendedFixes.length > 0 && (
            <div className="rounded border border-line bg-bg-raised p-4">
              <span className="eyebrow block mb-2">Recommended fixes</span>
              <ul className="text-sm space-y-1 list-disc list-inside text-fg-dim">
                {report.recommendedFixes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {report.warnings.length > 0 && (
            <div className="text-xs text-fg-dim font-mono space-y-1">
              {report.warnings.map((w, i) => (
                <p key={i}>⚠ {w}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
