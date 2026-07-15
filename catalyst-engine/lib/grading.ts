// Lead List Grader — ported from .claude/skills/lead-list-grader/SKILL.md
// Four dimensions are computed mechanically from the CSV. ICP fit is inherently
// qualitative (per the source rubric) and is supplied by the operator, not inferred.

import { parseCsv, type CsvRow } from "./csv";

export type Letter = "A" | "B" | "C" | "D" | "F";

const POINTS: Record<Letter, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };

const WEIGHTS = {
  icp: 0.4,
  verification: 0.25,
  catchAll: 0.15,
  titleDiversity: 0.1,
  duplicates: 0.1,
};

export interface DimensionResult {
  key: string;
  label: string;
  grade: Letter | null;
  detail: string;
  weight: number;
  included: boolean;
}

export interface GradeReport {
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

function pointsToLetter(score: number): Letter {
  if (score >= 3.5) return "A";
  if (score >= 2.5) return "B";
  if (score >= 1.5) return "C";
  if (score >= 0.5) return "D";
  return "F";
}

function findColumn(row: CsvRow, candidates: string[]): string | undefined {
  for (const c of candidates) {
    if (row[c] !== undefined) return c;
  }
  return undefined;
}

function toBool(val: string | undefined): boolean | null {
  if (val === undefined || val === "") return null;
  const v = val.trim().toLowerCase();
  if (["true", "yes", "y", "1"].includes(v)) return true;
  if (["false", "no", "n", "0"].includes(v)) return false;
  return null;
}

function scoreDuplicates(rows: CsvRow[]): { grade: Letter; detail: string; uniqueEmails: number } {
  const emailCol = rows[0] ? findColumn(rows[0], ["email", "email address", "e-mail"]) : undefined;
  if (!emailCol) {
    return { grade: "F", detail: "No email column found — cannot check for duplicates.", uniqueEmails: 0 };
  }
  const emails = rows.map((r) => (r[emailCol] || "").trim().toLowerCase()).filter(Boolean);
  const seen = new Set<string>();
  let dupes = 0;
  for (const e of emails) {
    if (seen.has(e)) dupes++;
    else seen.add(e);
  }
  const rate = emails.length ? (dupes / emails.length) * 100 : 0;
  let grade: Letter;
  if (rate === 0) grade = "A";
  else if (rate <= 3) grade = "B";
  else if (rate <= 10) grade = "C";
  else grade = "F";
  return {
    grade,
    detail: `${dupes} duplicate${dupes === 1 ? "" : "s"} of ${emails.length} rows (${rate.toFixed(1)}%)`,
    uniqueEmails: seen.size,
  };
}

function scoreTitleDiversity(rows: CsvRow[]): { grade: Letter; detail: string } {
  const titleCol = rows[0] ? findColumn(rows[0], ["title", "job title", "job_title", "role"]) : undefined;
  if (!titleCol) {
    return { grade: "F", detail: "No title column found — cannot assess targeting diversity." };
  }
  const titles = rows.map((r) => (r[titleCol] || "").trim()).filter(Boolean);
  if (titles.length === 0) {
    return { grade: "F", detail: "No title data present." };
  }
  const counts = new Map<string, number>();
  for (const t of titles) counts.set(t.toLowerCase(), (counts.get(t.toLowerCase()) || 0) + 1);

  const uniqueTitles = counts.size;
  const shares = [...counts.values()].map((c) => c / titles.length).sort((a, b) => b - a);
  const qualifying = shares.filter((s) => s > 0.1).length;
  const top2 = (shares[0] || 0) + (shares[1] || 0);
  const maxShare = shares[0] || 0;

  let grade: Letter;
  if (uniqueTitles <= 1) grade = "F";
  else if (qualifying >= 5) grade = "A";
  else if (top2 > 0.85) grade = "C";
  else if (uniqueTitles >= 3 || maxShare > 0.7) grade = "B";
  else grade = "B";

  return {
    grade,
    detail: `${uniqueTitles} unique title${uniqueTitles === 1 ? "" : "s"}, top title is ${(maxShare * 100).toFixed(0)}% of the list`,
  };
}

function scoreCatchAll(rows: CsvRow[]): { grade: Letter | null; detail: string } {
  const col = rows[0] ? findColumn(rows[0], ["catch_all", "catch-all", "catchall", "is_catch_all"]) : undefined;
  if (!col) return { grade: null, detail: "No catch-all column in the CSV — dimension skipped, not scored." };
  const flags = rows.map((r) => toBool(r[col])).filter((v): v is boolean => v !== null);
  if (flags.length === 0) return { grade: null, detail: "Catch-all column present but empty — dimension skipped." };
  const rate = (flags.filter(Boolean).length / flags.length) * 100;
  let grade: Letter;
  if (rate <= 5) grade = "A";
  else if (rate <= 15) grade = "B";
  else if (rate <= 30) grade = "C";
  else grade = "F";
  return { grade, detail: `${rate.toFixed(1)}% of leads are on catch-all domains` };
}

function scoreVerification(rows: CsvRow[]): { grade: Letter | null; detail: string } {
  const col = rows[0] ? findColumn(rows[0], ["verified", "is_verified", "email_verified", "verification_status"]) : undefined;
  if (!col) return { grade: null, detail: "No verification column in the CSV — dimension skipped, not scored." };
  const flags = rows.map((r) => toBool(r[col])).filter((v): v is boolean => v !== null);
  if (flags.length === 0) return { grade: null, detail: "Verification column present but empty — dimension skipped." };
  const rate = (flags.filter(Boolean).length / flags.length) * 100;
  let grade: Letter;
  if (rate >= 90) grade = "A";
  else if (rate >= 70) grade = "B";
  else if (rate >= 50) grade = "C";
  else grade = "F";
  return { grade, detail: `${rate.toFixed(1)}% of leads carry verification data` };
}

export function gradeList(csvText: string, icpGrade: Letter | null): GradeReport {
  const rows = parseCsv(csvText);
  const warnings: string[] = [];

  if (rows.length === 0) {
    return {
      totalLeads: 0,
      uniqueEmails: 0,
      overallGrade: "F",
      overallScore: 0,
      dimensions: [],
      criticalIssues: ["CSV had no parseable rows."],
      recommendedFixes: ["Check the file has a header row and at least one data row."],
      readyToSend: false,
      warnings: [],
    };
  }

  const dup = scoreDuplicates(rows);
  const titles = scoreTitleDiversity(rows);
  const catchAll = scoreCatchAll(rows);
  const verification = scoreVerification(rows);

  const dimensions: DimensionResult[] = [
    { key: "icp", label: "ICP Fit", grade: icpGrade, detail: icpGrade ? "Operator-assessed" : "Not scored — set manually", weight: WEIGHTS.icp, included: icpGrade !== null },
    { key: "verification", label: "Email Verification Coverage", grade: verification.grade, detail: verification.detail, weight: WEIGHTS.verification, included: verification.grade !== null },
    { key: "catchAll", label: "Catch-All Domain Density", grade: catchAll.grade, detail: catchAll.detail, weight: WEIGHTS.catchAll, included: catchAll.grade !== null },
    { key: "titleDiversity", label: "Title Diversity", grade: titles.grade, detail: titles.detail, weight: WEIGHTS.titleDiversity, included: true },
    { key: "duplicates", label: "Duplicate Rate", grade: dup.grade, detail: dup.detail, weight: WEIGHTS.duplicates, included: true },
  ];

  if (!icpGrade) warnings.push("ICP fit was not provided — overall grade is computed on the remaining dimensions only and will read optimistic.");
  if (!catchAll.grade) warnings.push("No catch-all data — a clean-looking grade may still hide undeliverable addresses.");
  if (!verification.grade) warnings.push("No verification data — bounce risk is unknown.");

  const includedDims = dimensions.filter((d) => d.included && d.grade);
  const totalWeight = includedDims.reduce((sum, d) => sum + d.weight, 0);
  const weightedPoints = includedDims.reduce((sum, d) => sum + POINTS[d.grade as Letter] * d.weight, 0);
  const overallScore = totalWeight > 0 ? weightedPoints / totalWeight : 0;
  const overallGrade = pointsToLetter(overallScore);

  const criticalIssues: string[] = [];
  const recommendedFixes: string[] = [];
  for (const d of dimensions) {
    if (d.grade === "F") criticalIssues.push(`${d.label}: ${d.detail}`);
    else if (d.grade === "D" || d.grade === "C") recommendedFixes.push(`${d.label}: ${d.detail}`);
  }

  return {
    totalLeads: rows.length,
    uniqueEmails: dup.uniqueEmails,
    overallGrade,
    overallScore,
    dimensions,
    criticalIssues,
    recommendedFixes,
    readyToSend: (overallGrade === "A" || overallGrade === "B") && criticalIssues.length === 0,
    warnings,
  };
}
