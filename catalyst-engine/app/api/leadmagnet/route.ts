import { randomUUID } from "node:crypto";
import { generateLeadMagnet, type LeadMagnetInput } from "@/lib/leadmagnet";
import { getCurrentUser } from "@/lib/auth";
import { insertLeadMagnetRun, listLeadMagnetRuns } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const REQUIRED_FIELDS = ["topic", "audience", "promise", "painAddressed", "proofPoint", "contactName", "bookingLink"] as const;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to use the lead magnet builder." }, { status: 401 });

  const limit = checkRateLimit(`leadmagnet:${user.id}`, 20, 60 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit);

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid JSON body." }, { status: 400 });

  for (const field of REQUIRED_FIELDS) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return Response.json({ error: `Field '${field}' is required.` }, { status: 400 });
    }
  }

  const input: LeadMagnetInput = {
    topic: body.topic,
    audience: body.audience,
    promise: body.promise,
    painAddressed: body.painAddressed,
    proofPoint: body.proofPoint,
    contactName: body.contactName,
    bookingLink: body.bookingLink,
    contactLinkedin: typeof body.contactLinkedin === "string" && body.contactLinkedin ? body.contactLinkedin : undefined,
  };

  const key = (typeof body.apiKey === "string" && body.apiKey) || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json(
      { error: "No Anthropic API key configured. Set ANTHROPIC_API_KEY server-side, or pass one in the request." },
      { status: 400 }
    );
  }

  try {
    const result = await generateLeadMagnet(input, key, DEFAULT_MODEL);
    insertLeadMagnetRun({
      id: randomUUID(),
      userId: user.id,
      topic: input.topic,
      title: result.content.pageTitle,
      stepCount: result.content.steps.length,
      markdown: result.markdown,
    });
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Lead magnet generation failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to view history." }, { status: 401 });
  return Response.json({ runs: listLeadMagnetRuns(user.id) });
}
