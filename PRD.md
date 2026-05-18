# Tavus Pulse: PRD

## Why this exists

Application artifact for the Tavus Founders Associate role. The shipping bar: would the FA actually open this at 7am to start the day? Tavus Pulse is that dashboard. It surfaces what changed overnight, where unit economics are drifting, which customers need a touch, and produces the investor update that lands in front of Hassaan before standup.

Demo data is fabricated and flagged. The point is to demonstrate operator instinct, product understanding, and a working Day-1 toolkit, not to ship a real Tavus internal tool.

## Audience

- **Primary user (in-fiction):** the Founders Associate at Tavus, first-person framing. The dashboard greets its operator, not Hassaan. The fiction is "this is my morning workflow."
- **Real audience (out-of-fiction):** Hassaan Raza, Quinn Favret, and the Tavus recruiter evaluating the application. They should walk away thinking "this person understands our business model and would land Day 1."

## Tavus context the artifact assumes

Grounding facts the build will reference (lifted from research, captured in `data/tavus-facts.md` for Claude):

- Series B, $40M led by CRV (Nov 2025); total raised ~$64M
- Hassaan Raza (CEO), Quinn Favret (COO); team ~68
- Unit of consumption: conversation minutes (CVI)
- Pricing: Basic free, Starter $59/mo, Growth $397/mo, Enterprise custom
- Foundation models: Phoenix-4 (rendering, sub-600ms latency, 40fps @ 1080p), Raven-1 (perception), Sparrow-1 (dialogue)
- Public customers: Final Round AI (100K+ users, 1.2M+ practice minutes), Delphi, CareFlick; logo wall includes Deloitte, Amazon, OpenAI
- Founder obsessions surfaced in interviews: sub-500ms latency, gross margin per minute, platform adoption

## Scope: three views

### View 1: Daily Pulse (hero view)

The first thing the FA opens. Claude streams a 3-sentence morning briefing above the fold while the rest of the page loads.

**Hero row** (live ticker animation on the minutes counter only):
- Conversation minutes generated today vs 7-day average
- P95 end-to-end CVI latency (target line at 500ms)
- Phoenix-4 sustained fps at 1080p (target line at 40)
- Active developers (DAU)

**Below the fold:**
- Top 5 accounts by minutes today, with sparkline and WoW delta
- Anomaly callouts (auto-surfaced as part of the morning briefing)
- "Generate Investor Update" button: opens a side panel where Claude drafts a Tavus monthly investor update from the full dashboard state, two-pass (draft, then drift-check evaluator)

### View 2: Unit Economics

Hassaan's obsession, made visible. Four charts.

1. **Cost per conversation minute, trended 90 days** (inference compute cost line)
2. **Gross margin by tier**: Starter, Growth, Enterprise side-by-side
3. **The Squeeze**: inference cost vs price-per-minute, two lines over 90 days; the chart that tells the GM story in one glance
4. **Tier mix shift**: stacked area, % of revenue by tier over 90 days

Every chart has a "Why is this off?" affordance: click triggers Claude commentary based on the full dashboard state JSON.

### View 3: Customer Health

Sortable top-accounts table: minutes, $ spend, WoW change, churn risk flag, renewal date.

**Seeded customers (4 public, on the record):**
- Final Round AI: 100K+ users, 1.2M+ practice minutes documented
- Delphi: sub-1s latency deployment, scaling to thousands of AI humans
- CareFlick: senior loneliness companions (AgeTech)
- Deloitte: logo-wall enterprise account

**Plus 6–8 fabricated enterprise accounts** to fill out the table (plausible names; will be marked alongside the demo-data banner).

Each row expands to a card with:
- 90-day usage trend sparkline
- Claude one-liner per account (e.g., "Final Round AI spiked 34% in week 3, likely tied to April product launch; renewal in 47 days")
- NDR cohort, renewal date, account owner placeholder

## Claude intelligence layer

Four functions. All server-side via Anthropic SDK on `claude-sonnet-4-6`. Streaming where it makes sense. Every Claude call loads `data/tavus-facts.md` in the system prompt so grounding is consistent.

1. **Morning Briefing** (Daily Pulse hero). Streams 3 sentences synthesizing what changed overnight, what's anomalous, what to ask whom today. Cached per-day to respect the rate limit.
2. **Why is this off?** (Unit Econ and Customer Health). Click any metric; Claude reads the dashboard state and returns 3 ranked hypotheses with what to verify next.
3. **Customer one-liners** (Customer Health card expansion). Per-account synthesis; cached per account per day.
4. **Investor Update Drafter** (Daily Pulse button). Two-pass:
   - Pass 1: streams a Tavus monthly investor-update draft from full dashboard state, in the voice of a Series B AI infra founder update.
   - Pass 2: read-only evaluator returns structured JSON flagging drift, internal inconsistency, or fabricated specifics. Surface flags above the draft.

## Data model

`data/metrics.ts`, 90 daily snapshots, deterministic seeded RNG so trends look real on every load. Single TypeScript module exporting:

- `dailyMetrics: DailySnapshot[]` (90 entries: minutes, latency, fps, DAU, active customers)
- `customers: CustomerAccount[]` (10–12 accounts; 4 public, 6–8 fabricated)
- `tierMix: TierMixSnapshot[]` (90 entries: % revenue from Starter / Growth / Enterprise)
- `costStructure: CostSnapshot[]` (90 entries: inference cost per minute, blended price per minute, GM%)

Plausibility constraints:
- Minutes-per-developer ratios stay sane
- Tier mix evolves smoothly, no overnight cliffs
- Cost-per-minute trends downward consistent with Hassaan's stated focus
- Customer concentration around Final Round AI (it's their public hero customer)
- Latency P95 hugs the 500ms target with occasional excursions to generate Claude anomaly callouts

`data/tavus-facts.md`, shared Claude context. Product surface area, pricing tiers, model architecture (Phoenix / Raven / Sparrow), public customer list, founder voice notes pulled from podcast interviews. Loaded into every Claude system prompt.

## Tech stack

Web Project Defaults from CLAUDE.md:

- Next.js 16 (app router) + TypeScript + Tailwind v4 (`@theme` CSS tokens, no `tailwind.config.js`) + Bun
- `@anthropic-ai/sdk` for Claude, streaming via server route, decoded on client with a `ReadableStream` reader
- `@upstash/ratelimit` + `@upstash/redis`, 10 generations per IP per day, in-memory `Map` fallback for local dev
- Recharts for charts (decide at build time; lean Recharts unless The Squeeze chart needs something custom)
- Vercel deploy from GitHub `main`, Zi owns the dashboard

Repo: `/Users/juliapuzzo/Desktop/Cursor/Tavus/`. Files at root.

Secrets, all server-side only: `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## Aesthetic

Pull from tavus.io before writing CSS:

- Font stack: inspect `<link rel="preload">` and the CSS chunk for font-family declarations
- Palette: `grep -oE "#[0-9a-fA-F]{3,8}" site.css | sort -u`
- Tavus reads dark, refined, with an electric/violet accent and a product-engineering posture (not SaaS-pastel)

Match temperature and density, not just hex codes. Persistent demo-data banner on every page, non-dismissible, ideally a top strip in muted text so it doesn't fight the metrics.

Type: editorial-but-functional. Tabular numerics for every metric (JetBrains Mono or whatever monospace Tavus uses). Variable-axis serif optional for section labels if Tavus's site warrants it.

## Out of scope (explicit cuts)

- No real Tavus API integration; no live data
- No multi-user, no auth
- No persistence beyond browser localStorage for view state
- No mobile; desktop-first, gracefully shrinks to tablet
- No Hiring view, no Board Prep view (consolidated into the Investor Update Drafter on Daily Pulse)
- No Funnel view

## Build phases

1. **Phase 0** (foundation): pull tavus.io aesthetic, scaffold Next.js + Tailwind v4, write `data/tavus-facts.md` and seeded `data/metrics.ts`, set up Anthropic SDK server route, demo-data banner component
2. **Phase 1** (Daily Pulse): hero row with ticker animation, top-accounts section, Morning Briefing streaming above the fold
3. **Phase 2** (Unit Economics): four charts, Why-is-this-off Claude affordance
4. **Phase 3** (Customer Health): table, expansion cards, per-account Claude one-liners
5. **Phase 4** (Investor Update Drafter): two-pass generator, side-panel UI, drift flags
6. **Phase 5** (ship): README, rate limit on Upstash, Vercel deploy, final aesthetic polish

Target: end-to-end shippable in ~2 days.

## README framing

README explicitly says this is an application artifact for the Tavus Founders Associate role, calls out that data is fabricated for illustration, and ends with a "how I'd wire this to real sources Day 1" section (Stripe for revenue, internal telemetry for latency/fps, Ashby/Greenhouse for hiring if we extend, etc.). Sprint duration stays out of UI copy; that lives in the README only.

## Open decisions for build time

- Recharts vs Visx (decide after sketching The Squeeze)
- Morning Briefing cache strategy: once-per-day vs once-per-session
- Specific names for the 6–8 fabricated enterprise accounts
- Whether "Why is this off?" caches per metric per day or runs fresh each click

## Success criteria

The recruiter forwards a link to Hassaan with a one-line note. Hassaan opens it, reads the Morning Briefing, clicks Generate Investor Update, watches Claude draft it in his voice from the metrics, and forwards both the artifact and Zi's application to Quinn.
