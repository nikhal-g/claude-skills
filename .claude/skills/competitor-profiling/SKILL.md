# Skill: competitor-profiling

## When to use
Invoke when Ryan needs to profile a tool or agency competitor — either to sharpen pitch positioning ("how do I beat Smartlead/Lemlist/Warmly?") or to understand a prospect's competitive landscape before a call.

**Two modes:**
- **Agency landscape** — profile a tool competitor (Lemlist, Smartlead, Instantly, Warmly, etc.)
- **Prospect prep** — profile the competitors of a specific lead to understand their market context

---

## Inputs required
- Competitor name and URL (or just name — find the URL via search)
- Mode: agency landscape or prospect prep
- Depth: quick (key facts, 10 min) or deep (full profile, 30 min)

---

## Workflow

### Step 1: Find and scrape key pages
Search for the competitor and fetch these pages if they exist:
- Homepage (positioning, ICP, value prop)
- Pricing page (tiers, limits, billing model)
- Features/product page
- Case studies / customers page
- About page (team size, funding, history)

### Step 2: Pull review intelligence
Search for:
- "[competitor name] reviews" on G2, Capterra, Trustpilot
- "[competitor name] vs [alternative]" articles
- Reddit threads mentioning the competitor
- Any public complaints or known weaknesses

Focus on patterns across reviews — what do unhappy customers always say?

### Step 3: Assess SEO and content footprint
Note roughly:
- What keywords they seem to target
- Whether they run cold email or LinkedIn content themselves
- Blog/content volume (signals how much they invest in inbound)

### Step 4: Build the profile

Output a structured markdown file at `.tmp/competitor_{name}.md`:

```markdown
# Competitor Profile: [Name]
**Date:** [today]
**URL:** [url]

## What they do
[One paragraph — who their ICP is, what they sell, how they position]

## Pricing
| Tier | Price | Key limits |
|------|-------|-----------|
| [tier] | [price/mo] | [limits] |

## Stated differentiators
- [their own claims from homepage/features page]

## Weaknesses (from reviews)
- [patterns from negative reviews — what customers complain about]

## How Catalyst Workflows beats them
- [specific, honest positioning — what Ryan does that they don't]
- [avoid claims that aren't backed by the research]

## Red flags / watch outs
- [anything that could be a trap in a comparison conversation with a prospect]

## Sources
- [URLs used]
```

### Step 5: Summarise for Ryan
Tell Ryan: what the top 2-3 differentiators are, what the clearest weakness is, and the one-line positioning statement Ryan can use in a pitch.

---

## Rules
- Only use what you can verify from public sources. Don't fabricate pricing or metrics.
- If pricing is not public, note that explicitly — "contact sales" wall = a Catalyst Workflows advantage.
- For prospect prep mode: focus on what THEIR competitors are doing that creates urgency for the prospect (e.g. competitor is scaling outbound aggressively = prospect is losing ground).
- Save raw output to `.tmp/competitor_{name}.md` so it can be reused without re-scraping.
