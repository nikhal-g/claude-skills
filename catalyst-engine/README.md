# Catalyst Engine

The outbound methodology in `.claude/skills/` (this repo's parent directory), rebuilt as
software your team or clients run directly instead of booking as agency labor.

This is an **MVP with real auth and persistence**, not yet a billable multi-tenant SaaS.
Read the "What's missing" section before pitching it as one.

## What's actually working

All six of the outbound-relevant skills from `.claude/skills/` are now ported:

| Tool | Route | Logic | Ported from |
|---|---|---|---|
| List Grader | `/dashboard/list-grader` | Deterministic, `lib/grading.ts` | `.claude/skills/lead-list-grader/SKILL.md` rubric |
| Deliverability Guard | `/dashboard/deliverability` | Deterministic, `lib/deliverability.ts` | `.claude/skills/deliverability-guard/scripts/scan.py`, line for line |
| Sequence Generator | `/dashboard/sequences` | Reasoning, `lib/sequence.ts` | `.claude/skills/COLD-EMAIL-PLAYBOOK.md`, Skills 1 & 2 |
| Offer Generator | `/dashboard/offers` | Reasoning, `lib/offers.ts` | `.claude/skills/offer-idea-generator/SKILL.md` |
| Competitor Profiler | `/dashboard/competitor` | Fetch + reasoning, `lib/competitor.ts` | `.claude/skills/competitor-profiling/SKILL.md` |
| Lead Magnet Builder | `/dashboard/leadmagnet` | Reasoning, `lib/leadmagnet.ts` | `.claude/skills/lead-magnet-builder/SKILL.md` |

Not ported: `reply-classifier` and `cold-email-ops-rhythm` need a real inbox/webhook
source of replies this app doesn't have a connection to yet — see "What's missing."

Two deliberate departures from the source skills, both worth knowing about:

- **Competitor Profiler** only fetches pages you give it a URL for. The source skill
  also pulls G2/Capterra/Reddit review intelligence via web search, which needs a search
  API this app doesn't have — the tool says so in its own copy, and the model is
  instructed not to invent weaknesses it has no evidence for in the fetched text.
- **Lead Magnet Builder** was written for one operator in the source skill (hardcoded
  Calendly link, LinkedIn, and Catalyst Workflows' own case studies like Kanopy). This
  version takes booking link, contact name, and proof point as inputs instead, and
  never fabricates a case study for a client whose actual results it doesn't have.
  Notion publishing from the source skill isn't wired up — output is markdown you copy,
  export, or paste in yourself.

All six are wired end to end: real input, real API route, real computed/generated
output, no placeholder data. The two deterministic tools have been exercised against
sample CSVs and drafts and produce correct pass/fail and grade results — see git history
for the test cases used. The four reasoning tools are correct by code review and a clean
build but need a live Anthropic key to exercise end to end, same caveat as always for
anything that calls out to Claude.

### Sending: Instantly integration

The Sequence Generator page has a "Push to Instantly" panel (`lib/instantly.ts`,
`app/api/instantly/route.ts`) that adds each generated lead to an existing Instantly
campaign as a lead with custom variables (`opener_subject`, `opener_body`,
`touch2_subject`, etc.) — your Instantly campaign's own email steps need to reference
those variables to actually send the generated copy. It requires the caller's own
Instantly API key and campaign ID, pushes nothing automatically, and only runs when a
signed-in user explicitly submits the form.

**This is written against Instantly's documented v2 API shape from general knowledge,
not verified against a live account** — this sandbox's network policy blocks outbound
calls to arbitrary external hosts (confirmed: a real push attempt returns "Host not in
allowlist: api.instantly.ai" from the sandbox's own proxy), so it could not be exercised
end to end against `api.instantly.ai`. What *is* verified end to end: auth gating,
input validation (missing campaign ID, missing key, no pushable leads, leads with no
email), and that a failed push surfaces Instantly's raw error per lead instead of
failing silently or crashing — see git history for the test transcript. Confirm the
endpoint and field names against your own Instantly API key before relying on this.

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

Sign up at `/signup` to get into the dashboard — there's no seeded account. The four
reasoning tools (Sequence Generator, Offer Generator, Competitor Profiler, Lead Magnet
Builder) additionally need an Anthropic API key — either set `ANTHROPIC_API_KEY` in
`.env.local` as a server default, or paste one into any tool's own key field per request
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
- **Instantly integration is unverified against a live account** — see the "Sending"
  section above. Confirm the API shape before depending on it.
- **Reply ingestion / classification** — `reply-classifier` and `cold-email-ops-rhythm`
  from the skills library aren't built here at all. They need an inbox/webhook source of
  real replies, which this scaffold has no connection to.
- **Notion publishing** for the Lead Magnet Builder — output is markdown, not a live page.
- **Review-site research** for the Competitor Profiler — only fetches pages you give it.
- **Rate limiting / abuse controls** on every route that calls Claude, since each spends
  real API tokens per request.

## Design system

Same visual language as the sales brief artifact from this build — graphite/parchment
ground, burnt-copper accent, serif display + mono utility labels — defined as CSS custom
properties in `app/globals.css` so both themes (light/dark) stay in sync automatically.
The dashboard is a sidebar layout (not a top nav) grouped by mechanism — Deterministic
tools vs. Reasoning tools — since six tools stopped fitting comfortably in a header bar.
The overview page (`app/dashboard/page.tsx`) pulls real per-tool run counts and last
activity from `getOverviewStats()` in `lib/db.ts`, not static placeholder cards.

Surfaces (cards, result panels, the dimension table) use a shadow-based `.surface`
utility instead of hard 1px borders on every box — softer elevation, larger radius
(`rounded-xl`/`rounded-lg` throughout instead of the default 4px), and a visible
focus-visible ring on every interactive element (`.field-input`, `.btn-focus`) instead
of relying on the browser default. Verified visually with Playwright screenshots against
the running app (landing, dashboard, list grader in both empty and populated result
states) — not just "the build passed."
