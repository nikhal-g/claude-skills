// Personalized sequence generator — this is the one module that needs the reasoning
// layer (Claude) rather than fixed rules. Prompt encodes the opener + 3-touch formula
// from .claude/skills/COLD-EMAIL-PLAYBOOK.md, Skills 1 and 2, verbatim.

import Anthropic from "@anthropic-ai/sdk";

export interface LeadInput {
  name: string;
  company: string;
  title?: string;
  painSignal?: string;
  website?: string;
}

export interface SequenceOutput {
  openerSubject: string;
  openerBody: string;
  touch2Subject: string;
  touch2Body: string;
  touch3Subject: string;
  touch3Body: string;
}

export type SequenceResult =
  | { lead: LeadInput; ok: true; sequence: SequenceOutput }
  | { lead: LeadInput; ok: false; error: string };

const SYSTEM_PROMPT = `You write cold outbound email sequences for Catalyst Workflows, following a strict house style. Output ONLY valid JSON, no markdown fences, no commentary.

RULES (non-negotiable):
- No em dashes anywhere in copy.
- Never say "just following up".
- Never start any message with "I" or "We".
- Opener under 100 words. Touch 2 under 75 words. Touch 3 under 50 words.
- Mirror any specific language given about the prospect — use their words back.
- Infrastructure logic beats clever copy — lead with the math or the mechanism, not a vendor pitch.
- No fluff, no pleasantries, no "hope this finds you well".

TOUCH 1 — OPENER (Pattern Interrupt):
Line 1 is exactly: "Good news / bad news — which do you want first?"
Then "Bad news" — 2-3 words naming that this is a cold message.
Then "Good news" — 1-2 sentences, a specific technical insight tied to their visible pain. Sound like someone who already diagnosed the problem, not a vendor guessing.

TOUCH 2 — THE PROOF (Day 3-4):
Do not reference touch 1. Start completely fresh. Lead with a specific, concrete result (a number or before/after). Ask if the math lands for them.

TOUCH 3 — THE EXIT (Day 7-8):
Close the door. Make it easy to say no — this creates urgency. Action-conditional opt-out only (e.g. "reply 'not now'") — never silence-conditional ("if I don't hear back...").

Respond with exactly this JSON shape:
{"openerSubject": string, "openerBody": string, "touch2Subject": string, "touch2Body": string, "touch3Subject": string, "touch3Body": string}`;

function buildUserPrompt(lead: LeadInput): string {
  const lines = [
    `Name: ${lead.name}`,
    `Company: ${lead.company}`,
    lead.title ? `Title: ${lead.title}` : null,
    lead.painSignal ? `Visible pain signal: ${lead.painSignal}` : null,
    lead.website ? `Website: ${lead.website}` : null,
  ].filter(Boolean);
  return `Write the 3-touch sequence for this lead:\n\n${lines.join("\n")}`;
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const withoutFences = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model response.");
  return JSON.parse(withoutFences.slice(start, end + 1));
}

function isSequenceOutput(v: unknown): v is SequenceOutput {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return ["openerSubject", "openerBody", "touch2Subject", "touch2Body", "touch3Subject", "touch3Body"].every(
    (k) => typeof o[k] === "string"
  );
}

export async function generateSequence(
  lead: LeadInput,
  apiKey: string,
  model: string
): Promise<SequenceOutput> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(lead) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Model returned no text content.");

  const parsed = extractJson(textBlock.text);
  if (!isSequenceOutput(parsed)) throw new Error("Model response did not match the expected sequence shape.");
  return parsed;
}

// The client dispatches Server Actions sequentially, so batch generation runs as a
// Route Handler with in-process concurrency control instead.
export async function generateSequencesBatch(
  leads: LeadInput[],
  apiKey: string,
  model: string,
  concurrency = 3
): Promise<SequenceResult[]> {
  const results: SequenceResult[] = new Array(leads.length);
  let cursor = 0;

  async function worker() {
    while (cursor < leads.length) {
      const i = cursor++;
      const lead = leads[i];
      try {
        const sequence = await generateSequence(lead, apiKey, model);
        results[i] = { lead, ok: true, sequence };
      } catch (err) {
        results[i] = { lead, ok: false, error: err instanceof Error ? err.message : "Unknown error" };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, leads.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
