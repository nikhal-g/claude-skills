---
name: cold-email-ops-rhythm
description: >
  The operational playbook for running cold email campaigns on a consistent schedule. Defines
  what to check on Monday, Wednesday, Friday, monthly, and quarterly to keep campaigns healthy.
  Use when running cold email campaigns regularly, onboarding a new team member on operations,
  or when campaigns are running but reply rates are inconsistent. Triggers on "ops cadence",
  "weekly routine", "campaign management", "what should I check", "how to run cold email continuously".
---

# Cold Email Ops Rhythm

Most cold email campaigns die because there's no operational rhythm. Someone sends an initial batch, gets a few replies, then forgets about it until reply rates drop to zero.

This skill defines the checks, actions, and decisions that keep campaigns running — and learning — over time.

---

## Why Rhythm Matters

The difference between hobbyists and operators running cold email as a growth channel:

- **Hobbyists** send a batch, wait for replies, give up when they don't get enough
- **Operators** have a system: they monitor weekly, fix what's broken, test new angles, and compound learnings over months

This skill is that system.

---

## When to Use

- Setting up operations for a new cold email program
- Onboarding someone on campaign management
- When reply rates are inconsistent across campaigns
- When you have multiple campaigns running and need a repeatable process
- Triggered by: "ops cadence", "what should I check weekly", "campaign management routine"

---

## Daily Check (5 minutes)

Run every day you're sending:

1. **Check send volume** — Did emails go out as scheduled? Any blocked inboxes?
2. **Quick reply scan** — Are there any urgent replies (meeting requests, complaints, unsubscribe requests)?
3. **Flag anomalies** — Bounce spike? Zero sends? Unexpected pause?

If something looks wrong, escalate to the Incident section below.

**This is a sanity check, not a deep dive.** Five minutes max.

---

## Monday Check (15-20 minutes)

Monday is the start of the work week. Start by understanding what happened over the weekend.

### 1. Weekend Reply Triage
- Check all campaigns for new replies since Friday
- Classify each reply (see `/reply-classifier`)
- Flag any positive replies for immediate follow-up
- Pull OOO and bounces to clean the list

### 2. Campaign Health Snapshot
- Reply rate by campaign (replies ÷ sent)
- Bounce rate by campaign (should be under 3%)
- Unsubscribe rate (should be under 0.5%)
- Warmup status on sending inboxes

### 3. Quick Decisions
- Any campaign with bounce rate > 5% → pause and investigate
- Any inbox with reputation issues → swap out
- Positive reply rate below 1% → flag for experiment review

---

## Wednesday Check (10-15 minutes)

Mid-week pause to catch problems before they compound.

### 1. Reply Rate Drift
- Compare reply rates to last week
- If any campaign dropped more than 30%, investigate (subject line change? list quality issue?)

### 2. Sequence Engagement
- Which step in your sequence is getting the most replies?
- This tells you what angle is working — double down on it

### 3. Inbox Status
- Any warmup inboxes getting blocked?
- Are new inboxes being warmed properly?

### 4. Experiment Check
- Any A/B tests running? Are they reaching statistical significance?
- If yes, declare a winner and move all traffic to the winning variant

---

## Friday Check (15 minutes)

End of week wrap-up and prep for next week.

### 1. Weekly Summary
- Total replies, positive replies, meetings booked
- Top-performing subject line of the week
- Bottom-performing campaign (why?)

### 2. List Prep
- Any new leads to add to active campaigns?
- Any leads to suppress (replied, bounced, unsubscribed)?
- New prospects from research done this week?

### 3. Next Week Preview
- Any campaign launches planned?
- Any sequences ending (time to refresh)?
- Any experiments to start?

### 4. Slack/Notification Check
- Make sure all campaign alerts are going to the right place
- Review any automated rules that fired this week

---

## Monthly Review (30-60 minutes)

The monthly check is where you learn, not just monitor.

### 1. Campaign Performance Trends
- Reply rate trend (up, down, flat)
- Positive reply rate trend
- Cost per positive reply
- Which campaigns are worth continuing vs. killing

### 2. List Quality Review
- Are you targeting the right ICP?
- Are certain lead sources outperforming others?
- Any title segments with zero replies (suppress those titles)?

### 3. Copy Performance Review
- What subject lines are working best?
- What angles are getting positive replies?
- What's getting negative responses (and why)?
- Are any sequences getting stale?

### 4. Infrastructure Health
- Domain reputation across all sending domains
- Inbox health: any inboxes showing fatigue?
- Are new inboxes being added to replace aging ones?

### 5. Strategic Decisions
- Kill any campaigns with negative reply rate trend for 3+ weeks
- Launch 1-2 new experiments (new angle, new list segment, new offer)
- Refresh scripts for campaigns running 6+ weeks (see `/script-refresher`)

---

## Quarterly Deep Dive (1-2 hours)

Quarterly reviews are for big-picture decisions.

### 1. Channel Assessment
- Is cold email still the right channel? What are conversion rates to pipeline to revenue?
- What's the ROI? (Cost of tools + ops time vs. pipeline generated)
- Should you shift budget to other channels?

### 2. ICP Review
- Is your ICP still accurate?
- Are the leads you're targeting actually buying?
- What changes to targeting would improve lead quality?

### 3. Tech Stack Audit
- Are your sending tools performing? Any that should be replaced?
- Are you using the best lead sources?
- Any new tools worth testing?

### 4. Team Operations
- What processes are working?
- What's taking too much time?
- What should be automated vs. manual?

### 5. Competitive Intel
- What's changed in your market?
- New players? Changed positioning?
- Any new angles or offers your competitors are using?

---

## Incident Response

When something breaks, follow this priority order:

### Bounce Spike
1. Pause affected campaign immediately
2. Check if it's a list issue (bad lead source) or domain issue (your sending domain)
3. Clean bounced leads from list
4. Resume at 50% volume, monitor for 48 hours
5. If bounce rate stays elevated, investigate domain reputation

### Deliverability Drop
1. Run `/email-deliverability-audit`
2. Check domain authentication (SPF/DKIM/DMARC)
3. Reduce send volume until reputation recovers
4. Add more warmup time to inboxes

### Reply Rate Drop
1. Check if it's campaign-specific or system-wide
2. Review recent subject line/content changes
3. Check if ICP targeting has drifted
4. Consider a script refresh if running 6+ weeks

### Inbox Blocked
1. Stop sending from affected inbox immediately
2. Warm up a replacement inbox
3. Don't send from that inbox for 2-4 weeks
4. When reusing, ramp slowly

---

## The One-Page Ops Summary

Print this and keep it visible:

```
COLD EMAIL OPS RHYTHM
======================
Daily (5 min):  Volume check, urgent replies
Monday (20 min): Weekend triage, health snapshot, quick decisions
Wednesday (15 min): Reply drift, sequence engagement, experiments
Friday (15 min): Weekly summary, list prep, next week preview
Monthly (60 min): Trends, ICP review, infrastructure health, strategic decisions
Quarterly (2 hrs): Channel assessment, big picture review

KEY METRICS TO TRACK:
- Reply rate (2-5% solid, 5%+ strong, 10%+ exceptional)
- Bounce rate (max: 3%)
- Unsubscribe rate (max: 0.5%)
- Positive reply rate (target: 1%+)
- Cost per positive reply

RED FLAGS:
- Bounce rate > 5% → pause immediately
- Reply rate drop > 30% week-over-week → investigate
- Positive reply rate < 1% → refresh script or list
```

---

## What to Do Next

**If you're starting fresh:** Run `/client-intake` to define your ICP, then `/offer-idea-generator` to nail your offer, then build your first campaign.

**If campaigns are running:** Start with the Monday check today. Set up recurring calendar blocks for each check.

**If something is broken:** Jump to the Incident Response section above.

---

## Related Skills

- `/reply-classifier` — How to handle responses once they come in
- `/copy-audit-framework` — Review copy quality when reply rates drop
- `/deliverability-guard` — Technical checks when deliverability is the issue
- `/script-refresher` — Refresh sequences running 6+ weeks