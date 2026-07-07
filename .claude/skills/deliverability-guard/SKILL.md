---
name: deliverability-guard
description: >
  Always-on guardrails for cold email deliverability. Scans subject lines, openers, body copy, and
  CTAs for patterns that get emails filtered, flagged, or blocked. Apply whenever writing or reviewing
  cold outreach — triggers on "check this for spam", "deliverability review", "QA copy", "scan subject line",
  "is this safe to send". Also run automatically whenever cold email copy is being generated.
---

# Deliverability Guard

Every cold email that lands in spam is a lead you'll never talk to. This skill catches the patterns that trigger spam filters, inbox algorithms, and human skepticism — before you send.

---

## When to Use

- Writing new cold email copy (subject lines, openers, bodies, follow-ups, CTAs)
- Reviewing existing sequences before launch
- When someone asks to "check this for spam", "QA this copy", "scan for deliverability issues"
- Any time cold email copy is being generated or revised

---

## The Four Filters

Every piece of cold email goes through four filters before it reaches the inbox:

1. **Spam filter** — Gmail/Outlook/Apple Mail blocking known spam patterns
2. **Algorithmic filter** — AI-driven spam detection trained on engagement signals
3. ** human filter** — The recipient deciding in 3 seconds if this looks like junk
4. **Domain reputation filter** — Whether your sending domain is warm enough to deliver

This skill covers filters 1-3. Filter 4 (domain reputation) requires `/email-warmup` and `/inbox-health`.

---

## Banned Single Words

These words, standing alone or as part of a compound, signal promotional intent:

- **Pressure words:** `guarantee`, `instant`, `limited`, `urgent`, `act now`, `hurry`, `exclusive`, `risk-free`, `no obligation`
- **Money/fraud signals:** `cash`, `bonus`, `discount`, `free`, `credit`, `investment`, `profit`, `earn`, `income`
- **Health/weightspam:** `lose weight`, `diet`, `supplement`, `miracle`, `cure`
- **Filler/promotional:** `amazing`, `incredible`, `unbelievable`, `fantastic`, `winner`, `congratulations`
- **Pharma:** Any prescription drug name, `no prescription`, `online pharmacy`

**Rule:** If the root word is still recognizable after hyphenation or splitting, treat it as banned:
- `cash-flow` → still `cash` → banned
- `free-dom` → still `free` → banned
- `discount-ed` → still `discount` → banned

---

## Banned Phrases

These phrases are so associated with spam that their presence alone triggers filters:

**Urgency/fake scarcity:**
- `Act now`
- `Limited time offer`
- `While supplies last`
- `Today only`
- `Don't miss out`
- `Last chance`
- `Final notice`

**Money claims:**
- `100% free`
- `100% guaranteed`
- `Double your money`
- `No cost or obligation`
- `Cash bonus`
- `Extra income`

**Too-good-to-be-true:**
- `You have been selected`
- `Congratulations winner`
- `Secret formula`
- `Medical breakthrough`
- `Lose weight fast`

**Phishing-adjacent:**
- `Verify your account`
- `Click here now`
- `Update your payment`
- `Confirm your details`
- `Password reset`

**Spammy openers:**
- `I hope this email finds you`
- `Hope you're having a great week`
- `I came across your profile`
- `Just wanted to reach out`

---

## High-Risk Patterns

These aren't always banned, but they increase risk significantly:

| Pattern | Risk Level | Why |
|---------|------------|-----|
| ALL CAPS | High | Shouting signal, often flagged |
| Multiple exclamation marks | Medium | promotional tone |
| Excessive emoji | Medium | Looks unprofessional at scale |
| `$` or `$$$` in body | High | Financial spam signal |
| `Save $X` or `Get $X off` | High | Classic discount spam |
| `%` off | High | Price reduction spam |
| `Reply STOP to unsubscribe` | Medium | Compliance language that outs you as bulk sender |
| Short links | High | Link masking = phishing association |
| Heavy HTML formatting | Medium | Bulk mail aesthetic |

---

## Formatting Rules

1. **No em dashes** — They read as promotional in long emails
2. **No ALL CAPS** — Even single words in caps trigger filters
3. **Max one exclamation mark** — If you need more, rewrite the sentence
4. **Plain text or minimal HTML** — No heavy formatting
5. **One clear link per email** — If there are 3+ links, it's a bulk send
6. **No attachment mentions** — "I've attached..." without attachment = phishing signal

---

## Subject Line Rules

Subject lines have the highest deliverability impact. Rules:

**Banned subject patterns:**
- `Re: [topic]` — Don't fake a reply thread
- Questions with urgency: `Are you free now?`
- All caps words
- Emoji-only subjects
- Numbers with `%` or `$`
- "Free" anywhere in the subject
- `FW: [topic]` — Don't fake forwards

**Safe subject patterns:**
- Personal observation: `[Company] raised [metric]`
- Specific question: `Quick question about [relevant topic]`
- Simple statement: `Idea for [specific outcome]`
- Name-drop with context: `[Mutual connection] + [reason]`
- Specific data point: `[Metric] at [Company]`

---

## Unsubscribe Line Rules

Never promise to stop based on silence. You follow up — that's the point. Silence-based promises mislead recipients and fail to match your behavior.

**Banned:**
- "I'll take silence as a no"
- "If I don't hear back, I'll leave you alone"
- "No reply means no interest"
- "I'll assume this isn't a fit"

**Allowed:**
- "Reply 'no' if you'd rather not hear from me"
- "Just say the word and I'll stop"
- "Feel free to ignore this"
- "If this isn't relevant, just let me know"

**Rule:** The recipient must take explicit action for the sequence to stop. Silence keeps the cadence running.

---

## The Plain-Language Rewrite

When in doubt, rewrite promotional language into observational language:

| Banned | Rewrite |
|--------|---------|
| `Act now for 50% off` | `If timing works, happy to share details` |
| `Limited time offer` | `Not sure if this is relevant to you` |
| `Guaranteed results` | `This depends on your specific situation` |
| `Click here for free consultation` | `Happy to connect if it makes sense` |
| `Increase revenue` | `Support [specific business outcome]` |
| `Amazing opportunity` | `Something I wanted to flag` |

---

## Copy Audit Checklist

Before sending, run through:

- [ ] Subject line has no banned words or patterns
- [ ] No urgency language (act now, limited, don't miss)
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

## What to Do Next

**If flags cleared:** Copy is ready for upload. Run `/spintax-generator` if you want variation across sends.

**If flags fired:** Rewrite the flagged lines using the plain-language rewrite table above, then re-run this check.

---

## Related Skills

- `/copy-audit-framework` — Deeper copy analysis before writing
- `/cold-email-ops-rhythm` — Ongoing cadence for campaign management
- `/reply-classifier` — What to do with responses once they come in