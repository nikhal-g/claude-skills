---
name: lead-magnet-builder
description: >
  Builds a complete Notion lead magnet on autopilot from a topic or angle — no re-prompting required.
  Triggers on "build a lead magnet for X", "create a lead magnet about X", "lead magnet for [topic]".
---

# Lead Magnet Builder

Takes a topic or angle, generates a complete B2B lead magnet in the Catalyst Workflows format, and publishes it directly to Notion. No re-prompting. No manual copy-paste.

---

## When to Use

- "Build a lead magnet for [X]"
- "Create a lead magnet about [X]"
- "Lead magnet for [topic]"

---

## Step 1 — Understand the Brief

Before generating anything, lock in:

1. **Topic** — What is this teaching? (e.g. "ICP definition", "LinkedIn inbound", "reply triage")
2. **Audience** — Who is it for? Default to Ryan's ICP: agency founders and B2B service businesses, 1–20 staff.
3. **Core promise** — What will the reader have, know, or be able to do after going through it?
4. **Pain addressed** — What specific problem does this solve?

If any are missing from Ryan's brief, infer from context. Do not ask. State assumptions at the top of your output so Ryan can correct them.

---

## Step 2 — Generate All Content

Generate the full lead magnet before touching Notion. Every section below is required.

---

### Page Title

Format: `[Emoji] The [Specific System / Process / Method]`

Rules:
- Hook-driven and specific. "The Autonomous SDR Infrastructure" not "Cold Email Guide"
- No revenue or tenure claims
- No em dashes

---

### Tagline (italic, directly under title)

Format: `*The exact [system/process/method] we use to [specific outcome] without [pain point]*`

---

### Start Here Block

Always the first content block. Use a Notion callout:

> **Want this built for you instead of doing it yourself?** [Book a 15-min call here](https://calendly.com/ryanpaulkj18/30min) or message Ryan on [LinkedIn](https://www.linkedin.com/in/ryan-paul-795179357/).

---

### Section — Who Is This For?

Header: `## Who Is This For?`

**You Are In The Right Place If:** (3–4 bullets)
Make these specific pain signals. "Your pipeline is unpredictable" beats "you want more leads."

**You Are NOT In The Right Place If:** (3–4 bullets)
Clear disqualifiers. B2C, sub-£3k LTV, no outbound intent, not the decision maker.

**What You Will Have After Going Through This:**
Open with a proof block using one case study (see Case Studies section below), then list 4–6 specific outcomes. Tangible deliverables, not vague benefits.

Format:
```
> **Proof it works:** [One sentence from a real case study.]

- Outcome 1
- Outcome 2
- Outcome 3
```

**Tool Stack Table** (include if the lead magnet covers a technical process):
| Tool | Role |
| --- | --- |

---

### Sections — The Steps

4–6 numbered steps. Minimum 4, maximum 6. Each step follows this structure exactly:

**Title:** `## Step [N] — [Title]`

**Opening statement:** One line. The single most important thing to know about this step.

---

**Why most people fail here:** 2–3 sentences. Name the common mistake clearly.

**The solution:** The actual method, framework, or process. Use:
- Tables for frameworks, scoring systems, qualifying criteria
- Numbered lists for sequential processes
- Callout blocks for rules: `> **Rule:** [rule text]`

Go deep. This is what makes the playbook defensible. Thin steps get skipped.

**Step navigation (end of every step):**
`**→ Next: Step [N+1] — [Title]**`

**Step CTA (end of every step, as a callout):**
> **Not sure if [step topic] is right?** [Book a 15-min call here](https://calendly.com/ryanpaulkj18/30min) or message Ryan on [LinkedIn](https://www.linkedin.com/in/ryan-paul-795179357/).

---

### Bonus Section

Header: `## Bonus — [Title]`

One bonus per lead magnet. Choose the most useful one for the topic:
- A ready-to-use Claude prompt (format as a blockquote with clear instructions)
- A checklist (use `- [ ]` checkboxes)
- A swipe file or template

---

### Bottom CTA

Always the last block:

> **Don't want to build this yourself?** We run this entire system for you. [Book a 15-min call here](https://calendly.com/ryanpaulkj18/30min) and we will map out exactly what your setup needs. Or message Ryan on [LinkedIn](https://www.linkedin.com/in/ryan-paul-795179357/).

---

## Case Studies — Use Only These, Never Fabricate

Embed one in the "What You Will Have After" section. Never invent metrics.

| Case Study | Detail | Best used when |
| --- | --- | --- |
| **Kanopy (B2B Logistics)** | 14 sales-qualified calls in 21 days. No SDR. No ads. No team. | Default. Most specific and defensible. |
| **9-figure company meeting** | Got in front of a 9-figure company via cold outreach alone. No ads, no referral. | When the lead magnet is about reach or positioning. |
| **RAID (Nikhal)** | Friend/founder. Real testimonial. | Supporting proof only. No specific metrics. |
| **Trelais (Jan)** | Friend/B2B founder. Real testimonial. | Supporting proof only. No specific metrics. |

---

## Hard Rules

- No em dashes anywhere in the content
- No revenue or tenure claims in titles or section headers
- No hyper-personalisation framing — mocked in 2026 market
- No fabricated metrics — only the four case studies above, used as written
- CTAs always use these exact links:
  - Calendly: https://calendly.com/ryanpaulkj18/30min
  - LinkedIn: https://www.linkedin.com/in/ryan-paul-795179357/
- Minimum 4 steps, maximum 6
- No step should be thinner than 150 words of actual content

---

## Skill Giveaway Map

Some steps map directly to an existing skill in `.claude/skills/`. When they do, embed that skill's full content as the bonus block for that step — give it away.

| Topic | Matched Skill |
| --- | --- |
| Deliverability / spam / subject lines | `deliverability-guard` |
| Competitor research | `competitor-profiling` |
| Copy QA / copy before sending | `copy-audit-framework` |
| Lead list quality / scoring | `lead-list-grader` |
| Scraping / sourcing leads | `scrape-leads` |
| Reply handling / triage | `reply-classifier` |
| Campaign rhythm / ops | `cold-email-ops-rhythm` |
| Email personalisation | `email-personalise` |
| ICP qualification | `icp-check.md` (inline skill) |
| Offer framing | `offer-idea-generator` |

When a step maps to a skill: read the skill's SKILL.md, extract the core framework (banned patterns list, checklist, scoring table, etc.), and embed it inline in that step's content block. Label it clearly:

> **Free tool — [Skill Name]:** [Embedded framework/checklist/table from the skill]

---

## Step 3 — Publish to Notion

Once all content is generated, publish using sub-pages. Read the Notion enhanced markdown spec via the MCP resource `notion://docs/enhanced-markdown-spec` before creating anything.

**Parent page:** The High Volume Cold Email Playbook
**Parent page ID:** `e2c79aeaf887836ab715812fae99e761`

### Sub-pages architecture

**Create in this order — IDs must exist before children can reference them:**

**Call 1 — Create the overview page (parent):**
```
parent: { type: "page_id", page_id: "e2c79aeaf887836ab715812fae99e761" }
pages: [{
  icon: [emoji matching the topic],
  properties: { title: "[Full page title without emoji]" },
  content: [
    Tagline,
    Start Here callout,
    Who Is This For section (full),
    Table of contents linking to each step — use plain text for now, Ryan can link manually,
    Bottom CTA callout
  ]
}]
```
→ Capture the returned page ID. This is the sub-page parent.

**Calls 2–N — Create one child page per step:**
```
parent: { type: "page_id", page_id: "[overview page ID from Call 1]" }
pages: [{
  icon: [step-appropriate emoji],
  properties: { title: "Step [N] — [Title]" },
  content: [Full step content including skill giveaway if applicable]
}]
```

Create each step page sequentially (each call depends on the parent existing). Do not batch step pages in one call if the Notion MCP requires sequential IDs.

---

## Step 4 — Output to Ryan

After all pages are created:

1. One sentence confirming what was built
2. The overview page Notion URL
3. List each step sub-page title and its URL
4. Call out which steps had a skill embedded as a giveaway
5. Any assumptions made about topic, audience, or promise that Ryan should check
