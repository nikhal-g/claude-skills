import { randomUUID } from "node:crypto";
import { profileCompetitor, type CompetitorInput } from "@/lib/competitor";
import { getCurrentUser } from "@/lib/auth";
import { insertCompetitorRun, listCompetitorRuns } from "@/lib/db";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to use the competitor profiler." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.competitorName !== "string" || !body.competitorName.trim()) {
    return Response.json({ error: "Provide the competitor's name." }, { status: 400 });
  }
  if (typeof body.url !== "string" || !isValidUrl(body.url)) {
    return Response.json({ error: "Provide a valid http(s) URL for the competitor's homepage." }, { status: 400 });
  }
  if (body.pricingUrl && !isValidUrl(body.pricingUrl)) {
    return Response.json({ error: "The pricing page URL isn't valid." }, { status: 400 });
  }

  const input: CompetitorInput = {
    competitorName: body.competitorName,
    url: body.url,
    pricingUrl: typeof body.pricingUrl === "string" && body.pricingUrl ? body.pricingUrl : undefined,
  };

  const key = (typeof body.apiKey === "string" && body.apiKey) || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      { error: "No Anthropic API key configured. Set ANTHROPIC_API_KEY server-side, or pass one in the request." },
      { status: 400 }
    );
  }

  try {
    const result = await profileCompetitor(input, key, DEFAULT_MODEL);
    insertCompetitorRun({
      id: randomUUID(),
      userId: user.id,
      competitorName: input.competitorName,
      url: input.url,
      resultJson: JSON.stringify(result),
    });
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Competitor profiling failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to view history." }, { status: 401 });
  return Response.json({ runs: listCompetitorRuns(user.id) });
}
