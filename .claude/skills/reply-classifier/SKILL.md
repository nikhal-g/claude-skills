---
name: reply-classifier
description: >
  Classifies cold email replies into categories that dictate what happens next: hot lead, warm
  follow-up, OOO, negative, bounce, or unsubscribe. Use when replies come in from a campaign and you
  need to decide what to do with each one. Triggers on "classify replies", "score these responses",
  "what do I do with these replies", "analyze campaign replies", "sort my responses".
---

# Reply Classifier

Every reply to a cold email deserves a response — but not every reply deserves the same response.

This skill classifies each reply into a category, then tells you what action to take. The goal is simple: make sure hot leads don't fall through the cracks, and every other reply gets handled appropriately.

---

## When to Use

- When replies come in from an active campaign
- When doing the Monday reply triage (see `/cold-email-ops-rhythm`)
- When someone asks "what do I do with these replies?", "classify my responses", "analyze my campaign replies"
- Before calculating positive reply rate for campaign performance

---

## The Six Categories

Every reply goes into one of these buckets:

| Category | What It Means | Action |
|----------|---------------|--------|
| **Hot Lead** | Direct interest, wants to talk, asked for a meeting | Immediate response + calendar link + CRM entry |
| **Warm Follow-Up** | Positive signal, but no commitment yet | Reply with next step, continue sequence |
| **Curious** | Engaged but wants more info before committing | Send requested info, then set next step |
| **Out of Office** | Automatic reply, vacation, OOO | Stop sequence, resume after their return date |
| **Negative** | Not interested, wrong fit, too busy | Remove from sequence, suppress from future campaigns |
| **Bounce** | Email undeliverable | Remove from list, don't retry from another address |

---

## Hot Lead Indicators

These phrases signal genuine interest:

**Meeting request:**
- "Let's hop on a call"
- "Are you free Tuesday?"
- "Can we schedule 15 minutes?"
- "Happy to chat — here's my calendar"
- "Yes, interested. When works for you?"

**Direct positive:**
- "We actually need this"
- "This is something we're looking at"
- "We're in the market for [X]"
- "Tell me more about [specific feature]"

**Referral:**
- "You should talk to [specific person]"
- "Our [department/role] handles this"
- "I'll connect you with [name]"

**What to do with Hot Leads:**
1. Reply within 2 hours (or set up an auto-reply with your calendar)
2. Send calendar link immediately
3. Enter into CRM with full context
4. Remove from campaign sequence (don't continue nurturing — go direct)
5. If no meeting set within 48 hours, follow up ONCE

---

## Warm Follow-Up Indicators

These phrases indicate interest but need nurturing:

**Soft positive:**
- "Interesting approach"
- "We've looked at something similar"
- "Not a no, just need to think about it"
- "Remind me in a quarter"
- "We're not actively looking right now, but keep me posted"

**Question-based:**
- "How does [X] work?"
- "What's the pricing?"
- "Who are some of your current customers?"
- "What's the implementation timeline?"

**What to do with Warm Follow-Ups:**
1. Reply with the requested information
2. If they asked a question, answer it and ask a qualifying question back
3. Don't pressure for a meeting yet
4. Continue the sequence — let the next step in the campaign do the work
5. If the sequence ends without a meeting, mark for manual follow-up in 90 days

---

## Curious Indicators

These replies indicate the person opened and read the email, but haven't committed:

**Engagement without commitment:**
- "Thanks for reaching out"
- "I'll take a look at your site"
- "Forwarded to my colleague"
- "Added to my to-do list"
- "Interesting — I'll keep this in mind"

**What to do with Curious replies:**
1. Acknowledge briefly (1-2 sentences max)
2. Add value with one specific detail ("Since you mentioned [X], you might be interested in [Y]")
3. Keep the door open with a soft ask
4. Continue in the sequence — these often turn into Warm or Hot after a few touches

---

## Out of Office Indicators

**Standard OOO:**
- "I'm out of the office until [date]"
- "Away until [date], limited email access"
- "Currently on vacation"
- Auto-reply with return date

**What to do with OOO:**
1. Log their return date
2. Pause all campaign sequences for this person
3. Set a reminder to resume contact 2-3 days after their return date
4. If no specific return date, wait 2 weeks, then resume at a lighter cadence

---

## Negative Indicators

**Soft no:**
- "Not interested"
- "Not a good fit"
- "We're all set"
- "Too busy right now"
- "Not looking for this right now"

**Hard no:**
- "Stop emailing me"
- "Remove me from your list"
- "This is spam"
- "Do not contact again"

**What to do with Negatives:**
1. Soft no: Reply briefly ("Understood, removed from our list"), then suppress from this campaign AND any future campaigns
2. Hard no: Do not reply, immediately suppress everywhere
3. Never: argue, guilt-trip, pressure, or continue the sequence
4. Never: add them to another campaign or try from a different address

---

## Bounce Indicators

**Hard bounce:**
- "Mailbox not found"
- "User unknown"
- "Address not found"
- "This domain does not exist"

**Soft bounce:**
- "Mailbox full"
- "Message too large"
- Temporary server error

**What to do with Bounces:**
1. Hard bounce: Remove immediately from all campaigns, never email this address again
2. Soft bounce: Remove from current campaign, pause for 7 days, retry once if it's a high-value lead
3. Log the bounce — if the same domain keeps bouncing, suppress the entire domain

---

## Classification Template

When classifying a batch of replies, use this format:

```
REPLY CLASSIFICATION REPORT
============================
Campaign: [campaign name]
Date: [date]
Total replies: [X]

HOT LEADS: [X] (respond within 2 hours)
- [email] — [one-line reason]
- [email] — [one-line reason]

WARM FOLLOW-UPS: [X] (continue sequence)
- [email] — [one-line reason]
- [email] — [one-line reason]

CURIOUS: [X] (add value, stay in sequence)
- [email] — [one-line reason]
- [email] — [one-line reason]

OUT OF OFFICE: [X] (pause, resume after return date)
- [email] — [return date or "unknown"]
- [email] — [return date]

NEGATIVE: [X] (suppress from all campaigns)
- [email] — [one-line reason]
- [email] — [one-line reason]

BOUNCE: [X] (remove from list)
- [email] — [hard/soft]
- [email] — [hard/soft]

METRICS:
- Positive reply rate: [X%]
- OOO rate: [X%]
- Negative rate: [X%]
- Bounce rate: [X%]
```

---

## Positive Reply Rate Calculation

The north star metric for cold email is **positive reply rate**:

```
Positive Reply Rate = (Hot Leads + Warm Follow-Ups) ÷ Total Replies
```

NOT included in positive rate:
- Curious (they engaged, but didn't indicate interest)
- OOO (not a response to your content)
- Negative (explicit disinterest)
- Bounce (didn't even reach them)

**What good looks like:**
- Under 50 emails sent: Not enough data yet
- 50-200 emails sent: Positive rate ≥ 3% is solid
- 200-1000 emails sent: Positive rate ≥ 5% is good
- 1000+ emails sent: Positive rate ≥ 8% is excellent

If your positive reply rate is below these thresholds after the sample size, investigate:
1. Is the list well-targeted? (See `/lead-list-grader`)
2. Is the copy resonating? (See `/copy-audit-framework`)
3. Is the offer relevant? (See `/offer-idea-generator`)

---

## What to Do Next

**If you have Hot Leads:** Respond immediately, set meetings, enter into CRM.

**If you have mostly Warm/Curious:** Continue the sequence, let the campaign nurture them.

**If you have mostly Negative:** Review targeting and copy before next send (see `/lead-list-grader` and `/copy-audit-framework`).

**If positive reply rate is low:** Run `/copy-audit-framework` on your current copy, then refresh the scripts (see `/script-refresher`).

---

## Related Skills

- `/cold-email-ops-rhythm` — Where this fits in the weekly ops cadence
- `/copy-audit-framework` — Fix copy when reply rates are low
- `/lead-list-grader` — Check list quality before it causes poor reply rates
- `/offer-idea-generator` — Refresh your offer when the target isn't biting