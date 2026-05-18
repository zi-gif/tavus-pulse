# Tavus Pulse

The morning dashboard a Tavus Founders Associate opens at 7am.

This is an application artifact for the **Tavus Founders Associate** role. It is not a real Tavus internal tool. All numbers are fabricated and flagged with a persistent demo-data banner. Public customers (Final Round AI, Delphi, CareFlick, Deloitte) are seeded with their publicly disclosed footprint; everything else is synthetic.

The product question it answers: would the FA actually open this at 7am to start the day? Three views, four Claude functions, one operator workflow.

## Three views

**Daily Pulse.** Hero metrics (conversation minutes, P95 latency, Phoenix-4 fps, active developers), top accounts by minutes today, anomaly callouts, and a Claude-generated Morning Briefing that streams above the fold. One-click "Generate Investor Update" produces a draft from the full dashboard state.

**Unit Economics.** The four charts Hassaan opens before every CRV board meeting: cost per conversation minute trended 90 days, gross margin by tier, the price-cost squeeze, and revenue mix shift. Every chart has a "Why is this off?" affordance that asks Claude for three ranked hypotheses.

**Customer Health.** Twelve accounts sorted any way you like, filterable to Watch/At Risk or public customers. Click a row to expand: 90-day usage chart, MTD vs prior month, NDR, renewal countdown, and a Claude one-liner generated on demand.

## Four Claude functions

1. **Morning Briefing.** Streams a three-sentence synthesis of overnight changes, anomalies, and the first concrete action of the day. Cached per session to respect the rate limit.
2. **Why is this off?** Click any chart. Claude reads the full dashboard state and returns three ranked hypotheses with what to check next.
3. **Customer one-liners.** Per-account synthesis on demand. Reads 30-day history, MTD vs prior month, NDR, renewal date, and notes.
4. **Investor Update Drafter.** Two-pass. Pass 1 streams a Tavus monthly investor update from the dashboard in Hassaan's voice. Pass 2 is a read-only evaluator that flags factual drift, em dashes, vague hedging, and customer names not in the snapshot.

All Claude calls load `data/tavus-facts.md` in the system prompt so grounding is consistent: real model names (Phoenix-4, Raven-1, Sparrow-1), real pricing tiers, real funding stage, real public customers.

## Local setup

```bash
bun install
cp .env.local.example .env.local
# add ANTHROPIC_API_KEY
bun run dev
```

Open `http://localhost:3000`.

Optional Upstash rate limiting: add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Without those, the app uses an in-memory `Map` with the same cap (10 generations per IP per day).

## Stack

Next.js 15 (app router) on Bun, TypeScript, Tailwind v4 (CSS `@theme` tokens, no `tailwind.config.js`), Recharts, `@anthropic-ai/sdk` with streaming via server routes, `@upstash/ratelimit` plus in-memory fallback.

Aesthetic pulled from `tavus.io`: wine-black background (`#140206`), cream text (`#f7f4ef`), sand secondary (`#c9bdaa`), electric green (`#38f261`) for positive deltas, coral (`#ff6183`) for warnings, lavender (`#e4e0f2`) for Claude-generated content. Type substitutes for the licensed Suisse Intl + FK Raster Grotesk + Perfectly Nineties stack: Inter, Space Grotesk, Fraunces, Geist Mono.

## Day-1 plan (wiring this to real sources)

The artifact uses seeded data. The shape of the dashboard maps to real Tavus systems as follows:

| View / metric | Real source |
| --- | --- |
| Conversation minutes, latency, fps, error rate | Internal telemetry (Datadog / Grafana / proprietary metrics pipeline) |
| Cost per minute, gross margin | Internal cost-accounting plus GPU cost feed from infra |
| Tier mix, ARR run rate | Stripe billing events plus Salesforce / HubSpot for enterprise contracts |
| Customer health (MTD minutes, NDR, renewal) | Product analytics plus contract data in CRM |
| Hiring (if added) | Ashby or Greenhouse |

Pass 1 of the Investor Update reads from this same internal-system snapshot. Pass 2 (drift check) becomes meaningfully more valuable when the snapshot is real: it catches Hassaan's first draft contradicting a number in the same email thread the previous month.

## Out of scope

- No real Tavus API integration
- No multi-user, no auth
- No persistence beyond browser `sessionStorage` for the cached briefing
- Desktop-first; gracefully shrinks to tablet
- Views from earlier brainstorm (Funnel, Hiring, Board Prep) deliberately cut. Board Prep merged into the Investor Update Drafter on Daily Pulse.

## Files of interest

- `app/page.tsx` — Daily Pulse
- `app/unit-economics/page.tsx` — Unit Economics
- `app/customer-health/page.tsx` — Customer Health
- `app/api/briefing/route.ts` — Morning Briefing (streaming)
- `app/api/investor-update/route.ts` — Investor Update Pass 1 (streaming)
- `app/api/investor-update/evaluate/route.ts` — Pass 2 (drift check, JSON)
- `app/api/why/route.ts` — Why-is-this-off (JSON)
- `app/api/customer/route.ts` — Customer one-liner (JSON)
- `data/metrics.ts` — 90-day seeded snapshots, customers, tier mix, cost structure
- `data/tavus-facts.md` — Shared Claude context (product, pricing, customers, voice)
- `lib/anthropic.ts` — SDK client and system prompt loader
- `lib/rate-limit.ts` — Upstash with in-memory fallback
- `PRD.md` — Full product spec

## Built by

Zi, applying for the Founders Associate role.
