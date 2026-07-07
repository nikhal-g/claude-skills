---
name: copy-audit-framework
description: >
  A five-question audit framework for evaluating cold email copy before it goes out. Tests whether
  the message will actually land in a busy inbox — not just pass spam filters, but resonate with the
  recipient. Use after writing initial copy, before running /deliverability-guard, or when
  reviewing someone else's cold email drafts. Triggers on "audit this copy", "review my email", "does
  this sound right", "check if this will work", "evaluate this sequence".
---

# Copy Audit Framework

Most cold email fails not because it gets blocked — but because it gets ignored. The recipient scans it in 3 seconds, decides it's noise, and moves on.

This framework asks five questions that predict whether your email survives that 3-second scan.

---

## When to Use

- After writing initial cold email copy
- Before running `/deliverability-guard`
- When reviewing sequence drafts
- When someone says "does this sound right?", "will this work?", "audit this copy"
- When a campaign's reply rates are lower than expected

---

## The Five Questions

Run through these in order. If you answer "no" to any question, fix that problem before moving to the next.

---

### Question 1: Is there a specific person?

Cold emails get ignored when they feel broadcast. The recipient needs to feel like you're talking to *them specifically*.

**What to check:**
- Does the subject line name them, their company, or a specific fact about them?
- Is there a detail in the opener that only applies to them? (Not "I noticed your company" — that's generic. Something like "I saw you launched X in March" or "Your team is hiring for Y role")
- Does the email contain any personalization that shows you did research?

**Fix if failing:** Add one specific detail about them in the subject or opener. A title, a product, a recent announcement, a metric from their website. Anything that says "I looked at *you* specifically."

**Strong opener example:**
> "Saw that [Company] hit 500 customers last month — that's a jump from 200 this time last year."

**Weak opener example:**
> "I came across your company and thought our solution might be a great fit."

---

### Question 2: Is the value specific?

Vague value propositions get dismissed. "I help companies grow" is noise. Specific outcomes with conditions and context are signal.

**What to check:**
- Does the email state a specific outcome? (Revenue, time saved, efficiency gained, problem solved)
- Is there a condition or context that makes it believable? ("for companies with 10-50 employees" not "for all companies")
- Does the value connect to something the recipient likely cares about based on their role or industry?

**Fix if failing:** Replace generic benefit claims with specifics. "Save time" → "Cut reporting time from 4 hours to 20 minutes." "Grow revenue" → "Add $50K-$200K in recurring revenue for B2B SaaS companies under $5M ARR."

**Strong value example:**
> "We help logistics companies cut their carrier reconciliation time by 60% — typically saving a 3-person finance team 15 hours a week."

**Weak value example:**
> "We help businesses streamline their operations and save money."

---

### Question 3: Is the ask clear?

Confusion kills response rates. If the recipient isn't sure what you want them to do, they won't do anything.

**What to check:**
- Is there ONE clear next step? (Not "let me know if you're interested or if you'd like to chat or if you have any questions")
- Does the ask have a low commitment threshold? (15-minute call is easier than "partner with us")
- Is the ask placed near the end of the email, not buried in the middle?

**Fix if failing:** Strip the email to one ask. If you have multiple CTAs, cut all but one. The first email's job is to start a conversation, not close a deal.

**Strong CTA example:**
> "Worth a 15-minute call to see if this applies to what you're building?"

**Weak CTA examples:**
- "Let me know if you're interested!"
- "Feel free to check out our website and get back to me if you have any questions."
- "I can send over a proposal if you'd like to learn more."

---

### Question 4: Does it sound human?

Emails that sound like they were written by a committee, a template, or a robot get filtered mentally before they're fully read.

**What to check:**
- Does the sentence structure vary? (Not every sentence starts with "I" or "We")
- Is there a conversational aside or casual observation?
- Would someone actually say this to a colleague or peer?
- Are there contractions? ("we're" not "we are")
- Does the tone match the recipient's likely personality? (A CEO gets a different tone than a marketing manager)

**Fix if failing:** Read the email out loud. If it sounds like a form letter, rewrite any phrase that sounds templated. Add one observation or opinion that a template couldn't generate.

**Strong human touch:**
> "I'm probably not your first cold email this week — most of what lands in your inbox probably reads the same. This one is different because..."

**Weak formula:**
> "I hope this email finds you well. I am reaching out because I believe our solution could be of great value to your organization. I would love to schedule a call at your convenience."

---

### Question 5: Would you reply to this?

The final test. If you received this email in your own inbox, would you respond?

**What to check:**
- Would the subject line make you curious enough to open?
- Does the body make you want to know more, or does it already say everything?
- Is the ask one you'd actually do given your current workload?
- Would you feel annoyed, neutral, or intrigued after reading it?

**Fix if failing:** This question usually fails because of cumulative issues — vague value + multiple asks + templated tone. Go back through questions 1-4 and fix the root cause.

---

## Audit Report Template

When you've completed the audit, structure your feedback as:

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

---

## Common Failure Patterns

| Failure | Root Cause | Fix |
|---------|-----------|-----|
| Opens but no replies | Subject line overpromises, body underdelivers | Tighten subject to match body content exactly |
| Low open rate | Subject too generic or promotional | Add recipient-specific detail |
| Replies but wrong intent | Value too vague, attracts curious-but-not-qualified | Sharpen ICP fit in value prop |
| Unsubscribe spike | Too many emails, no perceived value | Add more value per email, reduce frequency |
| Marked as spam | Spammy language or fake urgency | Run `/deliverability-guard` |

---

## What to Do Next

**If all 5 pass:** Run `/deliverability-guard` to check for technical spam triggers.

**If 1-2 failures:** Fix those specific questions, then re-audit.

**If 3+ failures:** Consider starting fresh with new copy rather than patching — too many failures usually means the underlying angle is wrong, not just the execution.

---

## Related Skills

- `/deliverability-guard` — Technical spam check after copy audit passes
- `/cold-email-ops-rhythm` — Ongoing campaign management cadence
- `/reply-classifier` — What to do with responses once they come in
- `/offer-idea-generator` — When value props need a refresh