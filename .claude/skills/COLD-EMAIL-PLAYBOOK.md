# Cold Email Skills Playbook

Six skills. Complete cold email lifecycle. Built by Catalyst Workflows.

---

## Order of Operations

1. Write the opener
2. Build the 3-touch sequence
3. Audit the copy (5 questions)
4. Run deliverability guard (spam scan)
5. Send
6. Classify replies
7. Run weekly ops rhythm

---

## Core Rules

- No em dashes anywhere in copy or messages
- Never say "just following up"
- Never start with "I" or "We"
- Under 100 words for openers, under 75 for follow-ups, under 50 for exits
- Infrastructure logic beats clever copy — lead with the math or the mechanism

---

# Skill 1 — Opener Writing

**Trigger:** Writing the first message to a cold prospect.

## The Formula

**Line 1:** "Good news / bad news — which do you want first?"

**Bad news (2-3 words):** Name what this is. "Bad news — this is a cold message." Disarms resistance immediately.

**Good news (1-2 sentences):** Specific technical insight tied to their visible pain. Sound like a doctor who already diagnosed the leak, not a vendor guessing.

## Rules

- Never say "I" in the opener
- Mirror any specific language the prospect used (use their words back exactly)
- Infrastructure logic beats clever copy — lead with the math
- No fluff, no pleasantries, no "hope this finds you well"
- Under 100 words total
- Tone: war-room directness, peer-to-peer authority

## Output Format

```
Opener:

Good news / bad news — which do you want first?

Bad news — [one line naming what this is]

Good news — [1-2 sentences, specific to their pain signal]
```

After writing the opener, offer the 3-touch sequence (see Skill 2).

---

# Skill 2 — Sequence Building

**Trigger:** Building the full 3-touch follow-up after an opener is written.

## The Three Touches

**Touch 1 — Pattern Interrupt (Day 1)**
Use the opener formula above. Under 80 words.

**Touch 2 — The Proof (Day 3-4)**
Don't follow up on Touch 1. Start completely fresh.
Lead with a specific result: "One of the agencies we work with went from 15 hours/week of manual research to 45 minutes."
Ask if the math lands for them.

**Touch 3 — The Exit (Day 7-8)**
Close the door. Make it easy to say no — this creates urgency.
Example: "Last message on this — if it's not a fit right now, no problem. Just reply 'not now' and I'll leave you alone."
This is the highest-converting touch in the sequence.

## Rules

- Never say "just following up" — that phrase is disqualifying
- Each touch must stand alone — no "as I mentioned"
- Touch 3 exit language is non-negotiable, do not soften it
- Mirror any specific language you know about the prospect
- Under 100 words per touch

## Output Format

```
Sequence — [Name] at [Company]
Angle: [scaling / team-capacity / manual-work / time-drain]

---
Touch 1 (Day 1) — Pattern Interrupt
[message]

---
Touch 2 (Day 3) — Proof
[message]

---
Touch 3 (Day 7) — Exit
[message]
```

---

# Skill 3 — Copy Audit

**Trigger:** Before any email goes out. Run this after writing, before deliverability guard.

Five questions in order. If any answer is no, fix it before moving on.

## Q1 — Is there a specific person?

Check:
- Does the subject line name them, their company, or a specific fact about them?
- Is there a detail in the opener that only applies to them?
- Does the email contain personalisation that proves you looked at them specifically?

Fix: Add one specific detail — a title, a product, a recent announcement, a metric from their website.

**Strong:** "Saw that [Company] hit 500 customers last month — that's a jump from 200 this time last year."
**Weak:** "I came across your company and thought our solution might be a great fit."

## Q2 — Is the value specific?

Check:
- Does the email state a specific outcome?
- Is there a condition that makes it believable?
- Does the value connect to something the recipient likely cares about?

Fix: Replace generic benefit claims with specifics. "Save time" → "Cut reporting time from 4 hours to 20 minutes."

**Strong:** "We help logistics companies cut carrier reconciliation time by 60% — typically saving a 3-person finance team 15 hours a week."
**Weak:** "We help businesses streamline their operations and save money."

## Q3 — Is the ask clear?

Check:
- Is there ONE clear next step?
- Is the ask low-commitment?
- Is it near the end, not buried in the middle?

Fix: Strip to one ask. The first email's job is to start a conversation, not close a deal.

**Strong:** "Worth a 15-minute call to see if this applies to what you're building?"
**Weak:** "Let me know if you're interested!" / "Feel free to check out our website."

## Q4 — Does it sound human?

Check:
- Does sentence structure vary?
- Would someone actually say this to a peer?
- Are there contractions?
- Does the tone match the recipient's likely personality?

Fix: Read it out loud. If it sounds like a form letter, rewrite any phrase a template could have generated.

## Q5 — Would you reply to this?

The final test. If you received this in your own inbox, would you respond?

Fix: If this fails, it usually means cumulative issues — go back through Q1-Q4 and find the root cause.

## Audit Report Format

```
COPY AUDIT REPORT
=================
Subject: [the subject line]

Q1 - Specific person? [PASS/FAIL]
  Finding: [what you found]
  Fix: [if failing, what to change]

Q2 - Specific value? [PASS/FAIL]
  Finding: [what you found]
  Fix: [if failing, what to change]

Q3 - Clear ask? [PASS/FAIL]
  Finding: [what you found]
  Fix: [if failing, what to change]

Q4 - Sounds human? [PASS/FAIL]
  Finding: [what you found]
  Fix: [if failing, what to change]

Q5 - Would you reply? [PASS/FAIL]
  Finding: [what you found]
  Fix: [if failing, what to change]

Overall: [PASS TO DELIVERABILITY GUARD / REWRITE REQUIRED]
```

**If all 5 pass:** Run deliverability guard (Skill 4).
**If 1-2 fail:** Fix those questions, re-audit.
**If 3+ fail:** Start fresh — too many failures usually means the angle is wrong, not just the execution.

---

# Skill 4 — Deliverability Guard

**Trigger:** After copy audit passes. Before uploading to Instantly.

Also run via script directly on a draft file:
```bash
python deliverability-guard/scripts/scan.py --file draft.txt
```
Exit 0 = PASS. Exit 1 = FAIL (flags printed to stdout).

## Banned Single Words

- Pressure: `guarantee`, `instant`, `limited`, `urgent`, `act now`, `exclusive`, `risk-free`
- Money/fraud: `cash`, `bonus`, `discount`, `free`, `credit`, `investment`, `profit`, `earn`, `income`
- Filler: `amazing`, `incredible`, `unbelievable`, `fantastic`, `winner`, `congratulations`

**Rule:** If the root word is still recognisable after splitting, treat it as banned. `free-dom` → still `free` → banned.

## Banned Phrases

- Urgency: "Act now", "Limited time offer", "While supplies last", "Last chance", "Final notice"
- Money: "100% free", "100% guaranteed", "Cash bonus", "Extra income"
- Phishing-adjacent: "Click here now", "Verify your account", "Confirm your details"
- Spammy openers: "I hope this email finds you", "I came across your profile", "Just wanted to reach out"

## High-Risk Patterns

| Pattern | Risk |
|---------|------|
| ALL CAPS | High |
| Multiple !! | Medium |
| `$` or `$$$` in body | High |
| Short links | High |
| Heavy HTML formatting | Medium |
| Em dashes | Medium |

## Subject Line Rules

**Banned:**
- `Re: [topic]` — don't fake a reply thread
- `FW: [topic]` — don't fake a forward
- Questions with urgency ("Are you free now?")
- "Free" anywhere in subject
- Numbers with `%` or `$`

**Safe patterns:**
- Personal observation: "[Company] raised [metric]"
- Specific question: "Quick question about [relevant topic]"
- Simple statement: "Idea for [specific outcome]"
- Specific data point: "[Metric] at [Company]"

## Unsubscribe Line Rules

**Banned (silence-conditional):**
- "I'll take silence as a no"
- "If I don't hear back, I'll leave you alone"
- "No reply means no interest"

**Allowed (action-conditional):**
- "Reply 'no' if you'd rather not hear from me"
- "Just say the word and I'll stop"
- "If this isn't relevant, just let me know"

## Pre-Send Checklist

- [ ] Subject line has no banned words or patterns
- [ ] No urgency language
- [ ] No money/percentage spam signals
- [ ] No fake reply/forward markers in subject
- [ ] Plain text or minimal formatting
- [ ] Max one link
- [ ] Unsubscribe line uses action-conditional wording
- [ ] No em dashes
- [ ] No ALL CAPS
- [ ] Max one exclamation mark
- [ ] Body reads like a person, not a promotion

---

# Skill 5 — Reply Classification

**Trigger:** When replies come in from an active campaign. Run during Monday triage.

## The Six Categories

| Category | What it means | Action |
|----------|---------------|--------|
| Hot Lead | Direct interest, wants to talk, asked for a meeting | Respond within 2 hours, send calendar link, enter into CRM |
| Warm Follow-Up | Positive signal but no commitment yet | Reply with next step, continue sequence |
| Curious | Engaged but no commitment | Add value, soft ask, stay in sequence |
| OOO | Out of office auto-reply | Pause sequence, resume 2-3 days after return date |
| Negative | Not interested, wrong fit | Suppress from all campaigns, never follow up |
| Bounce | Undeliverable | Remove immediately, never retry |

## Hot Lead Signals

- "Let's hop on a call"
- "Are you free Tuesday?"
- "We actually need this"
- "This is something we're looking at"
- "Tell me more about [specific feature]"
- "You should talk to [specific person]"

**Hot lead actions:**
1. Reply within 2 hours
2. Send calendar link immediately
3. Enter into CRM with full context
4. Remove from campaign sequence — go direct
5. If no meeting set within 48 hours, follow up once

## Warm Follow-Up Signals

- "Interesting approach"
- "Not a no, just need to think about it"
- "Remind me in a quarter"
- "How does [X] work?"
- "What's the pricing?"

**Actions:** Reply with the requested information, ask a qualifying question back, continue the sequence.

## Negative Handling

- Soft no: Reply briefly ("Understood, removed from our list"), suppress everywhere
- Hard no ("stop emailing me"): Do not reply, immediately suppress everywhere
- Never argue, guilt-trip, pressure, or continue the sequence
- Never add them to another campaign or try from a different address

## Classification Report Format

```
REPLY CLASSIFICATION REPORT
============================
Campaign: [name]
Date: [date]
Total replies: [X]

HOT LEADS: [X]
- [email] — [one-line reason]

WARM FOLLOW-UPS: [X]
- [email] — [one-line reason]

CURIOUS: [X]
- [email] — [one-line reason]

OUT OF OFFICE: [X]
- [email] — [return date]

NEGATIVE: [X]
- [email] — [one-line reason]

BOUNCE: [X]
- [email] — hard/soft

METRICS:
- Positive reply rate: [X%]
- Bounce rate: [X%]
- Negative rate: [X%]
```

## Positive Reply Rate Benchmarks

```
Positive Reply Rate = (Hot Leads + Warm Follow-Ups) / Total Replies
```

- Under 50 sent: Not enough data
- 50-200 sent: >= 3% is solid
- 200-1000 sent: >= 5% is good
- 1000+ sent: >= 8% is excellent

If below benchmark: check list quality (lead grader), then copy quality (copy audit), then offer relevance.

---

# Skill 6 — Ops Rhythm

**Trigger:** Running campaigns week-over-week. Onboarding someone on campaign ops.

## Daily Check (5 minutes)

1. Did emails go out as scheduled? Any blocked inboxes?
2. Any urgent replies (meeting requests, complaints, unsubscribes)?
3. Any anomalies — bounce spike, zero sends, unexpected pause?

This is a sanity check. Five minutes max.

## Monday (15-20 minutes)

1. **Weekend reply triage** — classify all replies since Friday (see Skill 5)
2. **Campaign health snapshot** — reply rate, bounce rate (target < 3%), unsubscribe rate (target < 0.5%), warmup status
3. **Quick decisions:**
   - Bounce rate > 5% on any campaign → pause and investigate
   - Any inbox with reputation issues → swap it out
   - Positive reply rate < 1% → flag for experiment review

## Wednesday (10-15 minutes)

1. **Reply rate drift** — compare to last week. Drop > 30%? Investigate.
2. **Sequence engagement** — which step is getting the most replies? Double down on that angle.
3. **Inbox status** — any warming inboxes getting blocked?
4. **Experiment check** — any A/B tests at statistical significance? Declare a winner.

## Friday (15 minutes)

1. **Weekly summary** — total replies, positive replies, meetings booked, top subject line, worst campaign
2. **List prep** — new leads to add, leads to suppress (replied, bounced, unsubscribed)
3. **Next week preview** — campaign launches, sequences ending, experiments to start

## Monthly Review (60 minutes)

1. Campaign performance trends (reply rate, positive reply rate, cost per positive reply)
2. List quality review — right ICP? Which lead sources outperform?
3. Copy performance — what subject lines and angles are working?
4. Infrastructure health — domain reputation, inbox fatigue, new inboxes being added?
5. Strategic decisions — kill campaigns with negative trend for 3+ weeks, launch 1-2 new experiments

## Quarterly Deep Dive (2 hours)

1. Is cold email still the right channel? ROI check.
2. ICP review — are the leads you're targeting actually buying?
3. Tech stack audit — are your sending tools performing?
4. Competitive intel — what's changed in your market?

## Incident Response

**Bounce spike:**
1. Pause campaign immediately
2. Check if it's a list issue or domain issue
3. Clean bounced leads
4. Resume at 50% volume, monitor 48 hours

**Deliverability drop:**
1. Check domain authentication (SPF/DKIM/DMARC)
2. Reduce volume until reputation recovers
3. Add more warmup time

**Reply rate drop:**
1. Campaign-specific or system-wide?
2. Check recent subject line / content changes
3. Check if ICP targeting has drifted
4. Consider script refresh if running 6+ weeks

**Inbox blocked:**
1. Stop sending from affected inbox immediately
2. Warm a replacement
3. Don't use that inbox for 2-4 weeks

## One-Page Summary

```
COLD EMAIL OPS RHYTHM
======================
Daily (5 min):    Volume check, urgent replies
Monday (20 min):  Weekend triage, health snapshot, quick decisions
Wednesday (15m):  Reply drift, sequence engagement, experiments
Friday (15 min):  Weekly summary, list prep, next week preview
Monthly (60 min): Trends, ICP review, infrastructure health
Quarterly (2 hr): Channel assessment, big picture

KEY METRICS:
- Reply rate target:          2-5% solid, 5%+ strong, 10%+ exceptional
- Bounce rate max:            3%
- Unsubscribe rate max:       0.5%
- Positive reply rate target: 1%+

RED FLAGS:
- Bounce > 5%           → pause immediately
- Reply drop > 30% WoW  → investigate
- Positive rate < 1%    → refresh script or list
```

---

*Built by Catalyst Workflows — [LinkedIn](https://www.linkedin.com/in/ryan-paul-795179357/)*
