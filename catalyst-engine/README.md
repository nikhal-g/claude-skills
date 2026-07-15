# Catalyst Engine

The outbound methodology in `.claude/skills/` (this repo's parent directory), rebuilt as
software your team or clients run directly instead of booking as agency labor.

This is an **MVP with real auth and persistence**, not yet a billable multi-tenant SaaS.
Read the "What's missing" section before pitching it as one.

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

**Auth and persistence are real**, not stubbed:
- Email/password accounts — `lib/auth.ts`, sessions in an httpOnly cookie, passwords
  hashed with `scrypt` (Node's built-in `node:crypto`, no extra dependency)
- `/dashboard/*` is gated server-side in `app/dashboard/layout.tsx` — no session, no access
- Every API route checks the session and returns 401 if there isn't one
- Every run (grade, scan, sequence batch) is persisted per-user and shown as recent-run
  history on its tool page — verified end to end, including that it survives a server
  restart (see git history for the test transcript)

The datastore is `lib/db.ts`, using Node's built-in `node:sqlite` — no ORM, no native
compile step. **This is a development/demo datastore, not a production one**: the `.db`
file lives on local disk, and serverless platforms (Vercel/Netlify functions) have
ephemeral filesystems, so it will not persist in that kind of deployment. Every caller
goes through the functions in `lib/db.ts`, not raw SQL, specifically so swapping in a
hosted Postgres (Neon, Supabase) or libSQL/Turso for production is contained to that one
file rather than a rewrite.

## Running it

```bash
npm install
cp .env.example .env.local   # only needed for the Sequence Generator
npm run dev
```

Sign up at `/signup` to get into the dashboard — there's no seeded account. The Sequence
Generator additionally needs an Anthropic API key — either set `ANTHROPIC_API_KEY` in
`.env.local` as a server default, or paste one into the tool's own key field per request
(bring-your-own-key mode; the key is never persisted server-side).

## What's missing before this is a sellable SaaS

This scaffold deliberately skips everything beyond "does the core logic work, with real
accounts and real persistence":

- **Multi-tenancy / workspaces** — every user sees only their own runs (enforced via
  `user_id` on every table), but there's no team/workspace concept yet — one login,
  one owner, no seat sharing or role permissions.
- **A production database** — see the datastore note above. Local SQLite works for
  development; production on serverless hosting needs a hosted DB swapped in.
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
