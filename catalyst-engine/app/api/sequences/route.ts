import { randomUUID } from "node:crypto";
import { parseCsv } from "@/lib/csv";
import { generateSequencesBatch, type LeadInput } from "@/lib/sequence";
import { getCurrentUser } from "@/lib/auth";
import { insertSequenceRun, listSequenceRuns } from "@/lib/db";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function findColumn(row: Record<string, string>, candidates: string[]): string | undefined {
  for (const c of candidates) if (row[c] !== undefined) return c;
  return undefined;
}

function leadsFromCsv(csvText: string): LeadInput[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];

  const nameCol = findColumn(rows[0], ["name", "full_name", "first_name"]);
  const companyCol = findColumn(rows[0], ["company", "company_name", "organization"]);
  const emailCol = findColumn(rows[0], ["email", "email address", "e-mail"]);
  const titleCol = findColumn(rows[0], ["title", "job_title", "role"]);
  const painCol = findColumn(rows[0], ["pain_signal", "pain", "signal", "notes"]);
  const websiteCol = findColumn(rows[0], ["website", "url", "domain"]);

  return rows
    .filter((r) => (nameCol && r[nameCol]) || (companyCol && r[companyCol]))
    .map((r) => ({
      name: nameCol ? r[nameCol] : "there",
      company: companyCol ? r[companyCol] : "your company",
      email: emailCol ? r[emailCol] : undefined,
      title: titleCol ? r[titleCol] : undefined,
      painSignal: painCol ? r[painCol] : undefined,
      website: websiteCol ? r[websiteCol] : undefined,
    }));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to use the sequence generator." }, { status: 401 });

  const contentType = request.headers.get("content-type") || "";
  let leads: LeadInput[] = [];
  let apiKey: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const apiKeyField = form.get("apiKey");
    apiKey = typeof apiKeyField === "string" && apiKeyField ? apiKeyField : undefined;
    if (!(file instanceof File)) {
      return Response.json({ error: "No CSV file provided under field 'file'." }, { status: 400 });
    }
    leads = leadsFromCsv(await file.text());
  } else {
    const body = await request.json().catch(() => null);
    if (!body) return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    apiKey = typeof body.apiKey === "string" && body.apiKey ? body.apiKey : undefined;
    if (Array.isArray(body.leads)) leads = body.leads;
    else if (body.lead) leads = [body.lead];
  }

  if (leads.length === 0) {
    return Response.json({ error: "No leads found. Provide at least a name or company per row." }, { status: 400 });
  }

  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      {
        error:
          "No Anthropic API key configured. Set ANTHROPIC_API_KEY in the server environment, or pass one in the request for a bring-your-own-key setup.",
      },
      { status: 400 }
    );
  }

  if (leads.length > 25) {
    return Response.json({ error: "MVP cap: 25 leads per batch. Split larger lists into multiple runs." }, { status: 400 });
  }

  try {
    const results = await generateSequencesBatch(leads, key, DEFAULT_MODEL, 3);
    insertSequenceRun({
      id: randomUUID(),
      userId: user.id,
      leadCount: results.length,
      okCount: results.filter((r) => r.ok).length,
      resultsJson: JSON.stringify(results),
    });
    return Response.json({ results });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Sequence generation failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to view history." }, { status: 401 });
  return Response.json({ runs: listSequenceRuns(user.id) });
}
