---
name: lead-list-grader
description: >
  Pre-send quality scorecard for cold email lead lists. Grades the list on duplicate rate, title
  diversity, catch-all domain density, ICP fit, and email verification coverage before it goes out.
  Outputs a letter grade and specific fixes so you catch bad lists before they burn your inboxes.
  Use after enrichment but before upload to your sending platform. Triggers on "grade my list",
  "check list quality", "is this list any good", "validate lead list", "list quality score".
---

# Lead List Grader

Bad lead lists are the #1 reason cold email campaigns fail. Sending to low-quality lists burns your sender reputation, tanks deliverability, and gets you blocked before you can even test your copy.

This skill grades your lead list before you send — catching problems while you can still fix them.

---

## When to Use

- After enrichment, before upload to your sending platform
- When reply rates are lower than expected
- When bounce rates spike unexpectedly
- When someone asks "is this list any good?", "grade my list", "check list quality"
- Monthly audit of your existing lead sources

---

## The Five Scoring Dimensions

Each dimension gets scored separately, then combined into an overall grade.

---

### Dimension 1: Duplicate Rate

**Why it matters:** Sending the same person multiple times is annoying at best, a spam violation at worst. Duplicate detection shows if your lead source or enrichment process has quality control issues.

**How to score:**
- 0% duplicates: A (perfect)
- 1-3% duplicates: B (acceptable)
- 4-10% duplicates: C (needs cleaning)
- 11%+ duplicates: F (significant quality issue)

**What to do:**
- Run deduplication on email address before sending
- If duplicates came from your lead source, flag that source as low-quality
- Check if enrichment process is creating duplicates

---

### Dimension 2: Title Diversity

**Why it matters:** If every lead has the same job title, your targeting is too narrow (won't scale) or too broad (wrong people). Good lists have titles clustered around your ICP but with enough variety to show you've done real research.

**How to score:**
- 5+ unique titles with >10% each: A
- 3-4 unique titles or one dominant (>70%): B
- 2 titles dominating (>85%): C
- All same title: F (lazy scraping, wrong data)

**What to do:**
- If too narrow: Broaden your title search criteria
- If too homogeneous: Add more job function diversity
- If titles look fake or gibberish: Your lead source has data quality issues

---

### Dimension 3: Catch-All Domain Density

**Why it matters:** Catch-all domains accept any email address and will never bounce — but they'll never deliver either. Your email goes into a void. High catch-all density means most of your "verified" emails might never reach a real inbox.

**How to score:**
- 0-5% catch-all domains: A (excellent)
- 6-15% catch-all domains: B (acceptable)
- 16-30% catch-all domains: C (concerning)
- 31%+ catch-all domains: F (dangerous — pause and investigate)

**What to do:**
- Catch-all domains are not immediately fatal, but high rates mean you need more volume to hit real inboxes
- If rate is above 15%, consider switching to a higher-quality lead source
- Verify catch-alls with a tool that does MX lookup validation

---

### Dimension 4: ICP Fit

**Why it matters:** Even a clean, diverse list can be full of the wrong people. ICP fit measures whether your leads actually match who you're trying to reach.

**How to score (by ICP dimension):**

Company size:
- Most leads in your target range: A
- Some outside range: B
- Most outside range: F

Industry:
- Matches your industry targeting: A
- Mixed but includes target industry: B
- Wrong industry: F

Geography:
- In your target geography: A
- Some outside: B
- Mostly outside: F

Job function:
- Decision-maker or influencer titles: A
- Related but non-decision roles: B
- Wrong function entirely: F

**What to do:**
- If ICP fit is low: Reconsider your lead source or targeting criteria
- Low ICP fit usually means the lead source has weak filtering options
- Consider running `/icp-prompt-builder` to get clearer on your ICP

---

### Dimension 5: Email Verification Coverage

**Why it matters:** Leads with no verification are guesses. Leads with full verification (MX + syntax + catch-all check) are real addresses you can trust.

**How to score:**
- 90%+ verified: A
- 70-89% verified: B
- 50-69% verified: C
- Below 50% verified: F

**What to do:**
- Below 70% verification: Run the list through a verification tool before sending
- No verification data: Treat as 50% potential bounce
- If bounce rate from a lead source exceeds 10%, drop that source

---

## The Overall Grade

Calculate the overall grade by combining the five dimensions:

```
Overall Grade = Weighted Average
- ICP Fit: 40%
- Email Verification: 25%
- Catch-All Density: 15%
- Title Diversity: 10%
- Duplicate Rate: 10%
```

| Grade | Meaning | Action |
|-------|---------|--------|
| **A** | Send immediately | Ready to go |
| **B** | Minor fixes needed | Clean duplicates, verify catch-alls |
| **C** | Significant issues | Fix before sending, expect lower performance |
| **D** | Major problems | Don't send — rebuild the list |
| **F** | Don't send | Fundamental quality failure |

---

## List Quality Report Template

```
LEAD LIST QUALITY REPORT
========================
List name: [filename or source]
Date graded: [date]
Total leads: [X]
Total unique emails: [X]

DIMENSION SCORES:
1. Duplicate Rate: [X%] — [Grade]
2. Title Diversity: [X unique titles] — [Grade]
3. Catch-All Density: [X%] — [Grade]
4. ICP Fit: [qualitative] — [Grade]
5. Email Verification: [X%] — [Grade]

OVERALL GRADE: [A/B/C/D/F]

CRITICAL ISSUES (must fix before sending):
- [Issue 1]
- [Issue 2]

RECOMMENDED FIXES:
- [Fix 1]
- [Fix 2]

READY TO SEND: [YES/NO]

If NO, block until fixes are applied.
```

---

## Quick Win Fixes

If your list grades below B, these are the fastest ways to improve it:

**Deduplication:**
```bash
# Remove exact email duplicates
sort -u leads.csv | grep -v "^email" > leads_deduped.csv

# Remove duplicate domains at high volume (keep first instance)
awk -F'@' '!seen[$2]++' leads.csv > leads_domain_deduped.csv
```

**Catch-All Detection:**
Use an MX lookup tool or API to flag catch-all domains. Remove or segment them separately.

**Title Normalization:**
Standardize titles before scoring (e.g., "VP of Sales" = "Vice President of Sales" = "Head of Sales" = Senior Sales Leader). Use the normalized version for scoring.

---

## What to Do Next

**If grade is A:** Ready to send. Upload to your platform and launch.

**If grade is B:** Apply the recommended fixes, then re-grade.

**If grade is C or below:** Don't send yet. Work through the critical issues first, or consider a different lead source.

**Before next campaign:** Source leads from a higher-quality provider, then run through this grader before sending.

---

## Related Skills

- `/cold-email-ops-rhythm` — Where this fits in the weekly/monthly ops cadence
- `/reply-classifier` — What to do with the replies you get
- `/copy-audit-framework` — If copy quality is the problem, not the list
- `/offer-idea-generator` — When the list is good but the offer isn't resonating