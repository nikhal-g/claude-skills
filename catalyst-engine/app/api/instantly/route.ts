import { randomUUID } from "node:crypto";
import { pushLeadsToInstantly, type InstantlyLead } from "@/lib/instantly";
import { getCurrentUser } from "@/lib/auth";
import { insertInstantlyPush, listInstantlyPushes } from "@/lib/db";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

interface SequenceForPush {
  lead: { name: string; company: string; email?: string };
  ok: boolean;
  sequence?: {
    openerSubject: string;
    openerBody: string;
    touch2Subject: string;
    touch2Body: string;
    touch3Subject: string;
    touch3Body: string;
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to push to Instantly." }, { status: 401 });

  const limit = checkRateLimit(`instantly:${user.id}`, 10, 60 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit);

  const body = await request.json().catch(() => null);
  if (!body || typeof body.campaignId !== "string" || !body.campaignId.trim()) {
    return Response.json({ error: "Provide your Instantly campaign ID." }, { status: 400 });
  }
  if (typeof body.apiKey !== "string" || !body.apiKey.trim()) {
    return Response.json({ error: "Provide your Instantly API key." }, { status: 400 });
  }
  const results: SequenceForPush[] = Array.isArray(body.results) ? body.results : [];
  if (results.length === 0) {
    return Response.json({ error: "No generated sequences to push. Generate sequences first." }, { status: 400 });
  }

  const leads: InstantlyLead[] = [];
  for (const r of results) {
    if (!r.ok || !r.sequence || !r.lead.email) continue;
    leads.push({
      email: r.lead.email,
      firstName: r.lead.name,
      companyName: r.lead.company,
      customVariables: {
        opener_subject: r.sequence.openerSubject,
        opener_body: r.sequence.openerBody,
        touch2_subject: r.sequence.touch2Subject,
        touch2_body: r.sequence.touch2Body,
        touch3_subject: r.sequence.touch3Subject,
        touch3_body: r.sequence.touch3Body,
      },
    });
  }

  if (leads.length === 0) {
    return Response.json(
      { error: "None of the generated results had an email address to push. Include an 'email' field on each lead." },
      { status: 400 }
    );
  }

  const pushResults = await pushLeadsToInstantly(body.campaignId, leads, body.apiKey);
  const okCount = pushResults.filter((r) => r.ok).length;

  insertInstantlyPush({
    id: randomUUID(),
    userId: user.id,
    campaignId: body.campaignId,
    leadCount: pushResults.length,
    okCount,
    resultsJson: JSON.stringify(pushResults),
  });

  return Response.json({ results: pushResults, okCount, totalCount: pushResults.length });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to view history." }, { status: 401 });
  return Response.json({ runs: listInstantlyPushes(user.id) });
}
