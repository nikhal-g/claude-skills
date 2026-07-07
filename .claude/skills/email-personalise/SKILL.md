# Skill: email-personalise

## When to use
Invoke this skill when Ryan asks to write personalised cold emails for a batch of leads, or when building the email layer for a client campaign (e.g. Joy's Instantly campaign). This is the Claude API personalisation layer — the core of what Catalyst Workflows delivers.

## Inputs required
- Lead data: list of leads with name, title, company, website (from crm.json or a CSV)
- Optional: existing research briefs (skips the research step if already done)

## Workflow

### Step 1: Load leads
Read leads from `tasks/crm.json` or a specified CSV. Filter to leads with status `scraped` or `approved` only.

### Step 2: Research each lead
For each lead, spawn the `research` subagent with their name, company, title, and website. Run in parallel where possible (`run_in_background: true`). Collect structured research briefs.

### Step 3: Generate the opener
For each lead + research brief, spawn the `email-personaliser` subagent with `type: opener`. Run in parallel. Collect subject + body pairs.

### Step 4: Generate the follow-up sequence
For each lead that produced a usable opener, spawn the `email-personaliser` subagent three more times in parallel — one per follow-up type. Pass the opener content so follow-ups don't repeat the same angle.

**Sequence structure:**

| Email | Send day | Angle | Length |
|-------|---------|-------|--------|
| Opener | Day 0 | Company-specific hook + pain + soft CTA | <100 words |
| FU1 | Day 3 | Proof — specific result from a case study (Kanopy: 14 calls in 21 days) | <75 words |
| FU2 | Day 7 | Reframe — different angle on the pain, or different aspect of their business from the research | <75 words |
| FU3 | Day 14 | Break-up — short, no pressure, leaves the door open permanently | <50 words |

**Follow-up rules (non-negotiable):**
- No "just following up" — ever. Each email must stand alone with a new angle.
- FU1 leads with proof, not a reminder that you emailed before.
- FU2 picks a different signal from the research brief — if opener used their blog, FU2 uses their LinkedIn or a recent hire.
- FU3 is not passive-aggressive. It's genuinely low-pressure. Short. Ends with "no worries either way."
- No em dashes in any email. No filler openers.

### Step 5: Output
Write results to `.tmp/emails_[date].csv` with columns:
```
name, email, company, subject_1, body_1, subject_2, body_2, subject_3, body_3, subject_4, body_4, status
```
Status = `draft` for all. Ryan reviews before anything goes into Instantly.

Flag leads where the research brief was weak — mark them `[NEEDS MANUAL REVIEW]` in all body columns rather than generating generic copy.

Report back: total processed, how many full sequences generated, how many flagged for manual review and why.

## Error handling
- If research returns no meaningful signal for a lead: flag it, write `[NEEDS MANUAL RESEARCH]` in the body column, continue
- If a lead has no website: attempt LinkedIn URL, if none, flag it
- Never skip a lead silently — always account for it in the output

## Script
Run from workspace root:
```bash
# Step 1 — score leads (if not already scored)
python catalyst-pipeline/scripts/score_leads.py --input catalyst-pipeline/inputs/<apollo_export>.csv

# Step 2 — personalise Priority + Standard leads
python catalyst-pipeline/scripts/personalise_emails.py --input catalyst-pipeline/outputs/<stem>_scored.csv
```

Output lands in `catalyst-pipeline/outputs/<stem>_personalised.csv`.
Review flagged `[NEEDS MANUAL REVIEW]` openers before uploading to Instantly.

## Self-annealing
If a prompt consistently produces generic-feeling output, update the `email-personaliser` agent instructions with tighter constraints. Document what changed and why.
