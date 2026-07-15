// Lead Magnet Builder — ported from .claude/skills/lead-magnet-builder/SKILL.md.
//
// Generalized from the source skill: the original hardcodes Ryan's own Calendly link,
// LinkedIn, and Catalyst Workflows' specific case studies (Kanopy, RAID, etc.) because
// it was written for one operator. This tool serves any client, so booking link, contact
// name, and proof point are caller-supplied inputs instead of fixed values — and no case
// study is fabricated for a client whose actual results we don't have.
//
// Notion publishing from the source skill isn't wired up here (would need a per-user
// Notion integration token and OAuth flow) — output is markdown the caller can copy,
// export, or paste into Notion themselves.

import Anthropic from "@anthropic-ai/sdk";

export interface LeadMagnetInput {
  topic: string;
  audience: string;
  promise: string;
  painAddressed: string;
  proofPoint: string;
  contactName: string;
  bookingLink: string;
  contactLinkedin?: string;
}

interface LeadMagnetStep {
  title: string;
  opening: string;
  whyPeopleFail: string;
  solution: string;
}

interface LeadMagnetContent {
  pageTitle: string;
  tagline: string;
  whoForYes: string[];
  whoForNo: string[];
  outcomes: string[];
  steps: LeadMagnetStep[];
  bonusTitle: string;
  bonusContent: string;
}

export interface LeadMagnetResult {
  content: LeadMagnetContent;
  markdown: string;
}

const SYSTEM_PROMPT = `You write the content for a B2B lead magnet page. Output ONLY valid JSON, no markdown fences, no commentary.

RULES (non-negotiable):
- No em dashes anywhere.
- No revenue or tenure claims.
- pageTitle format: "The [Specific System / Process / Method]" — hook-driven and specific, never generic ("Cold Email Guide" is a failure).
- tagline format: "The exact [system/process/method] we use to [specific outcome] without [pain point]"
- whoForYes: 3-4 bullets, specific pain signals, not vague wants.
- whoForNo: 3-4 bullets, clear disqualifiers.
- outcomes: 4-6 specific, tangible deliverables the reader will have after going through it. Not vague benefits.
- steps: minimum 4, maximum 6. Each step needs a title, a one-line opening statement (the single most important thing to know about this step), 2-3 sentences on why most people fail at this step, and the actual method/framework as the solution (go deep, this is what makes it defensible, thin steps get skipped — minimum 150 words for the "solution" field).
- bonusTitle + bonusContent: one bonus, either a ready-to-use prompt, a checklist, or a swipe file. Pick whichever is most useful for this specific topic.

Respond with exactly this JSON shape:
{"pageTitle": string, "tagline": string, "whoForYes": string[], "whoForNo": string[], "outcomes": string[], "steps": [{"title": string, "opening": string, "whyPeopleFail": string, "solution": string}], "bonusTitle": string, "bonusContent": string}`;

function buildUserPrompt(input: LeadMagnetInput): string {
  return [
    `Topic: ${input.topic}`,
    `Audience: ${input.audience}`,
    `Core promise (what the reader will have/know/be able to do after this): ${input.promise}`,
    `Pain addressed: ${input.painAddressed}`,
  ].join("\n");
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model response.");
  return JSON.parse(trimmed.slice(start, end + 1));
}

function isLeadMagnetContent(v: unknown): v is LeadMagnetContent {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.pageTitle === "string" &&
    typeof o.tagline === "string" &&
    Array.isArray(o.whoForYes) &&
    Array.isArray(o.whoForNo) &&
    Array.isArray(o.outcomes) &&
    Array.isArray(o.steps) &&
    typeof o.bonusTitle === "string" &&
    typeof o.bonusContent === "string"
  );
}

function ctaBlock(input: LeadMagnetInput, prompt: string): string {
  const linkedinPart = input.contactLinkedin ? ` or message ${input.contactName} on [LinkedIn](${input.contactLinkedin})` : "";
  return `> **${prompt}** [Book a call here](${input.bookingLink})${linkedinPart}.`;
}

function renderMarkdown(content: LeadMagnetContent, input: LeadMagnetInput): string {
  const parts: string[] = [];
  parts.push(`# ${content.pageTitle}`);
  parts.push(`*${content.tagline}*`);
  parts.push("");
  parts.push(ctaBlock(input, "Want this built for you instead of doing it yourself?"));
  parts.push("");
  parts.push("## Who Is This For?");
  parts.push("");
  parts.push("**You are in the right place if:**");
  content.whoForYes.forEach((b) => parts.push(`- ${b}`));
  parts.push("");
  parts.push("**You are NOT in the right place if:**");
  content.whoForNo.forEach((b) => parts.push(`- ${b}`));
  parts.push("");
  parts.push("**What you will have after going through this:**");
  parts.push("");
  parts.push(`> **Proof it works:** ${input.proofPoint}`);
  parts.push("");
  content.outcomes.forEach((o) => parts.push(`- ${o}`));
  parts.push("");

  content.steps.forEach((step, i) => {
    parts.push(`## Step ${i + 1} — ${step.title}`);
    parts.push("");
    parts.push(step.opening);
    parts.push("");
    parts.push(`**Why most people fail here:** ${step.whyPeopleFail}`);
    parts.push("");
    parts.push(step.solution);
    parts.push("");
    if (i < content.steps.length - 1) {
      parts.push(`**→ Next: Step ${i + 2} — ${content.steps[i + 1].title}**`);
      parts.push("");
    }
    parts.push(ctaBlock(input, `Not sure if ${step.title.toLowerCase()} is right for you?`));
    parts.push("");
  });

  parts.push(`## Bonus — ${content.bonusTitle}`);
  parts.push("");
  parts.push(content.bonusContent);
  parts.push("");
  parts.push(ctaBlock(input, "Don't want to build this yourself? We can run this entire system for you."));

  return parts.join("\n");
}

export async function generateLeadMagnet(
  input: LeadMagnetInput,
  apiKey: string,
  model: string
): Promise<LeadMagnetResult> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Model returned no text content.");

  const parsed = extractJson(textBlock.text);
  if (!isLeadMagnetContent(parsed)) throw new Error("Model response did not match the expected lead magnet shape.");

  return { content: parsed, markdown: renderMarkdown(parsed, input) };
}
