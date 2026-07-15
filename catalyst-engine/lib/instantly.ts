// Instantly integration — pushes generated sequences into an existing Instantly
// campaign as leads with custom variables, so the campaign's own email steps
// (edited in Instantly, referencing {{opener_subject}}, {{opener_body}}, etc.)
// send the actual copy this app generated.
//
// IMPORTANT: this client is written against Instantly's documented v2 API shape
// from general knowledge, not verified against a live account — this sandbox's
// network policy blocks outbound calls to arbitrary external hosts, so it could
// not be exercised end to end against api.instantly.ai. Confirm the endpoint and
// field names against your own Instantly API key before relying on this in
// production; the error handling below surfaces Instantly's raw response body
// specifically so a schema mismatch is loud and diagnosable, not silent.
//
// This never sends anything on its own — it requires the caller's own Instantly
// API key and an existing campaign ID they created themselves, and only runs
// when a signed-in user explicitly submits the push form.

const INSTANTLY_BASE = "https://api.instantly.ai/api/v2";

export interface InstantlyLead {
  email: string;
  firstName?: string;
  companyName?: string;
  customVariables: Record<string, string>;
}

export interface InstantlyPushResult {
  email: string;
  ok: boolean;
  error?: string;
}

async function addLeadToCampaign(
  campaignId: string,
  lead: InstantlyLead,
  apiKey: string
): Promise<InstantlyPushResult> {
  try {
    const res = await fetch(`${INSTANTLY_BASE}/leads`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        campaign: campaignId,
        email: lead.email,
        first_name: lead.firstName,
        company_name: lead.companyName,
        custom_variables: lead.customVariables,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { email: lead.email, ok: false, error: `Instantly returned ${res.status}: ${body.slice(0, 300)}` };
    }
    return { email: lead.email, ok: true };
  } catch (err) {
    return { email: lead.email, ok: false, error: err instanceof Error ? err.message : "Request to Instantly failed." };
  }
}

export async function pushLeadsToInstantly(
  campaignId: string,
  leads: InstantlyLead[],
  apiKey: string,
  concurrency = 3
): Promise<InstantlyPushResult[]> {
  const results: InstantlyPushResult[] = new Array(leads.length);
  let cursor = 0;

  async function worker() {
    while (cursor < leads.length) {
      const i = cursor++;
      results[i] = await addLeadToCampaign(campaignId, leads[i], apiKey);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, leads.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
