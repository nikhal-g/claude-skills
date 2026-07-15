// Competitor Profiling — ported from .claude/skills/competitor-profiling/SKILL.md.
// Fetches the pages the operator provides (no search-engine crawling — that needs a
// search API this app doesn't have), strips them to readable text, then asks Claude
// to build the structured profile. Honest about what it didn't check: the source
// skill also pulls G2/Capterra/Reddit review intelligence, which isn't automated here.

import Anthropic from "@anthropic-ai/sdk";

export interface CompetitorInput {
  competitorName: string;
  url: string;
  pricingUrl?: string;
}

export interface CompetitorProfile {
  whatTheyDo: string;
  pricingNotes: string;
  statedDifferentiators: string[];
  weaknesses: string[];
  differentiationOpportunities: string[];
  onelinePositioning: string;
}

const FETCH_TIMEOUT_MS = 12000;
const MAX_CHARS_PER_PAGE = 6000;

async function fetchPageText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CatalystEngine/1.0; +https://example.com)" },
    });
    if (!res.ok) throw new Error(`Fetching ${url} returned HTTP ${res.status}`);
    const html = await res.text();
    return htmlToText(html).slice(0, MAX_CHARS_PER_PAGE);
  } finally {
    clearTimeout(timeout);
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SYSTEM_PROMPT = `You profile a competitor for cold-email positioning, from raw page text the caller fetched.
Output ONLY valid JSON, no markdown fences, no commentary.

RULES:
- Only use what you can verify from the provided page text. Do not invent pricing, metrics, or claims that aren't there.
- If pricing is not visible in the text, say so explicitly in pricingNotes rather than guessing — note that a "contact sales" wall can itself be a competitive angle (opacity vs. transparency).
- statedDifferentiators: claims the competitor makes about itself, drawn from the text.
- weaknesses: only include something here if the text itself gives evidence for it (e.g. thin feature descriptions, vague claims, contact-sales-only pricing). Do not fabricate customer complaints you have no evidence for — that requires review-site research this tool did not perform.
- differentiationOpportunities: honest, specific angles a competitor could use against this company based on what's visible — not generic "be better" statements.
- onelinePositioning: a single sentence usable in a sales conversation.

Respond with exactly this JSON shape:
{"whatTheyDo": string, "pricingNotes": string, "statedDifferentiators": string[], "weaknesses": string[], "differentiationOpportunities": string[], "onelinePositioning": string}`;

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model response.");
  return JSON.parse(trimmed.slice(start, end + 1));
}

function isCompetitorProfile(v: unknown): v is CompetitorProfile {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.whatTheyDo === "string" &&
    typeof o.pricingNotes === "string" &&
    Array.isArray(o.statedDifferentiators) &&
    Array.isArray(o.weaknesses) &&
    Array.isArray(o.differentiationOpportunities) &&
    typeof o.onelinePositioning === "string"
  );
}

export async function profileCompetitor(
  input: CompetitorInput,
  apiKey: string,
  model: string
): Promise<{ profile: CompetitorProfile; sourcesUsed: string[] }> {
  const sourcesUsed: string[] = [];
  const pages: string[] = [];

  const homepage = await fetchPageText(input.url);
  pages.push(`--- ${input.url} ---\n${homepage}`);
  sourcesUsed.push(input.url);

  if (input.pricingUrl) {
    try {
      const pricing = await fetchPageText(input.pricingUrl);
      pages.push(`--- ${input.pricingUrl} ---\n${pricing}`);
      sourcesUsed.push(input.pricingUrl);
    } catch {
      // Pricing page fetch failing shouldn't kill the whole profile — the homepage might mention pricing anyway.
    }
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Competitor: ${input.competitorName}\n\nPage text fetched:\n\n${pages.join("\n\n")}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Model returned no text content.");

  const parsed = extractJson(textBlock.text);
  if (!isCompetitorProfile(parsed)) throw new Error("Model response did not match the expected profile shape.");
  return { profile: parsed, sourcesUsed };
}
