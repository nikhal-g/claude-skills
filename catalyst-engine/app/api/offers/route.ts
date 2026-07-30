import { randomUUID } from "node:crypto";
import { generateOffers, type OfferInput } from "@/lib/offers";
import { getCurrentUser } from "@/lib/auth";
import { insertOfferRun, listOfferRuns } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to use the offer generator." }, { status: 401 });

  const limit = checkRateLimit(`offers:${user.id}`, 20, 60 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit);

  const body = await request.json().catch(() => null);
  if (!body || typeof body.icp !== "string" || !body.icp.trim()) {
    return Response.json({ error: "Describe the ICP you're generating offers for." }, { status: 400 });
  }

  const input: OfferInput = {
    icp: body.icp,
    painPoint: typeof body.painPoint === "string" ? body.painPoint : undefined,
    context: typeof body.context === "string" ? body.context : undefined,
  };

  const key = (typeof body.apiKey === "string" && body.apiKey) || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      { error: "No Anthropic API key configured. Set ANTHROPIC_API_KEY server-side, or pass one in the request." },
      { status: 400 }
    );
  }

  try {
    const result = await generateOffers(input, key, DEFAULT_MODEL);
    insertOfferRun({
      id: randomUUID(),
      userId: user.id,
      icp: input.icp,
      recommendedPrimary: result.recommendedPrimary,
      resultJson: JSON.stringify(result),
    });
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Offer generation failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to view history." }, { status: 401 });
  return Response.json({ runs: listOfferRuns(user.id) });
}
