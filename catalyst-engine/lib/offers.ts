// Offer Idea Generator — ported from .claude/skills/offer-idea-generator/SKILL.md.
// Reasoning-only: generates one offer per category, tailored to the given ICP/pain.

import Anthropic from "@anthropic-ai/sdk";

export type OfferCategory = "Insight" | "Framework" | "Gap Audit" | "Template/Tool" | "Call";

export interface OfferIdea {
  category: OfferCategory;
  friction: "None" | "Low" | "Medium" | "High";
  headline: string;
  body: string;
  whenToUse: string;
}

export interface OfferResult {
  offers: OfferIdea[];
  recommendedPrimary: OfferCategory;
  reasoning: string;
}

export interface OfferInput {
  icp: string;
  painPoint?: string;
  context?: string;
}

const SYSTEM_PROMPT = `You generate cold-email offer ideas. Output ONLY valid JSON, no markdown fences, no commentary.

THE OFFER STACK — five categories, ranked by friction:
- Insight (no friction): a specific observation about their industry/company/role that implies a problem or opportunity. Zero ask. Best for a first email.
- Framework (no friction): a repeatable method or model, simplified and shareable. Feels like IP they want to apply.
- Gap Audit (low friction): a mini-audit revealed in the email itself — "do this and you'll find X gap."
- Template/Tool (medium friction): a specific resource they can use immediately — proven, tangible, low risk.
- Call (high friction): a 15-30 minute call. Only works on warm traffic, never a cold first ask.

RULES:
- Generate exactly one offer per category, all five.
- Each offer must be specific to the given ICP and pain point, not generic ("we help companies X" is a failure).
- Formulas by category:
  Insight: "[Specific fact about them] + [implication]"
  Framework: "[X-step process] for [specific outcome]"
  Gap Audit: "[Do this] and you'll find [specific gap]"
  Template/Tool: "Our [name] that [specific outcome]"
  Call: "Quick call to [specific outcome] if [condition is true]"
- Pick a recommendedPrimary: for cold/first-touch use, this should almost always be Insight or Framework, never Call, unless the input context says the audience is already warm.
- reasoning is one sentence explaining the recommendedPrimary choice.

Respond with exactly this JSON shape:
{"offers": [{"category": string, "friction": string, "headline": string, "body": string, "whenToUse": string}], "recommendedPrimary": string, "reasoning": string}`;

function buildUserPrompt(input: OfferInput): string {
  const lines = [
    `ICP: ${input.icp}`,
    input.painPoint ? `Pain point: ${input.painPoint}` : null,
    input.context ? `Additional context: ${input.context}` : null,
  ].filter(Boolean);
  return `Generate offer ideas for this campaign:\n\n${lines.join("\n")}`;
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model response.");
  return JSON.parse(trimmed.slice(start, end + 1));
}

function isOfferResult(v: unknown): v is OfferResult {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return Array.isArray(o.offers) && typeof o.recommendedPrimary === "string" && typeof o.reasoning === "string";
}

export async function generateOffers(input: OfferInput, apiKey: string, model: string): Promise<OfferResult> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Model returned no text content.");

  const parsed = extractJson(textBlock.text);
  if (!isOfferResult(parsed)) throw new Error("Model response did not match the expected offer shape.");
  return parsed;
}
