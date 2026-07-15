# Catalyst Engine

The outbound methodology in `.claude/skills/` (this repo's parent directory), rebuilt as
software your team or clients run directly instead of booking as agency labor.

This is an **MVP scaffold** — three real, working tools, not mockups. It is not yet a
sellable multi-tenant SaaS. Read the "What's missing" section before pitching it as one.

## What's actually working

| Tool | Route | Logic | Ported from |
|---|---|---|---|
| List Grader | `/dashboard/list-grader` | Deterministic, in `lib/grading.ts` | `.claude/skills/lead-list-grader/SKILL.md` rubric |
| Deliverability Guard | `/dashboard/deliverability` | Deterministic, in `lib/deliverability.ts` | `.claude/skills/deliverability-guard/scripts/scan.py`, line for line |
| Sequence Generator | `/dashboard/sequences` | Calls Claude via `lib/sequence.ts` | `.claude/skills/COLD-EMAIL-PLAYBOOK.md`, Skills 1 & 2 |

All three are wired end to end: real upload, real API route, real computed/generated
output, no placeholder data. The two deterministic tools have been exercised against
sample CSVs and drafts and produce correct pass/fail and grade results — see git history
for the test cases used.

## Running it

```bash
npm install
cp .env.example .env.local   # only needed for the Sequence Generator
npm run dev
```

The Sequence Generator needs an Anthropic API key — either set `ANTHROPIC_API_KEY` in
`.env.local` as a server default, or paste one into the tool's own key field per request
(bring-your-own-key mode; the key is never persisted server-side).

## What's missing before this is a sellable SaaS

This scaffold deliberately skips everything that isn't "does the core logic work":

- **Auth / multi-tenancy** — there is no login. Everyone who reaches the app sees the
  same single workspace. A client-facing product needs accounts and per-client data
  isolation before anyone else touches it.
- **A database** — nothing persists. Grades, scans, and generated sequences live only
  in the browser tab that requested them. Add a real store (leads, campaigns, run
  history) before this is usable past a single session.
- **Billing** — no Stripe, no usage metering, no plan tiers.
- **Sending integration** — output still has to be manually exported and uploaded to
  Instantly (or wherever). No API integration exists yet.
- **Reply ingestion / classification** — `reply-classifier` and `cold-email-ops-rhythm`
  from the skills library aren't built here at all. They need an inbox/webhook source of
  real replies, which this scaffold has no connection to.
- **Offer generation, competitor profiling, lead-magnet builder** — the remaining three
  skills aren't ported. They're lower priority than the send-path tools above.
- **Rate limiting / abuse controls** on the Sequence Generator route, since it spends
  real API tokens on every call.

## Design system

Same visual language as the sales brief artifact from this build — graphite/parchment
ground, burnt-copper accent, serif display + mono utility labels — defined as CSS custom
properties in `app/globals.css` so both themes (light/dark) stay in sync automatically.
