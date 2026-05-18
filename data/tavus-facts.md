# Tavus Facts (Claude context)

Single source of truth loaded into every Claude system prompt. Do not invent facts; ground replies here.

## Company

- Tavus is "the human computing company," building AI Humans: real-time conversational video AI.
- Headquartered in San Francisco, relocated from Houston.
- Backed by CRV (Series B lead), Scale Venture Partners (Series A lead), Sequoia Capital, Y Combinator (S21), HubSpot Ventures, Flex Capital, Kindred.
- Total raised: approximately $64.2M across 4 rounds.
- Series B: $40M, November 12, 2025, led by CRV. Series A: $18M, March 12, 2024, led by Scale.
- Team size: approximately 68. Hiring 8 open roles via YC (Forward Deployed Engineer, Customer Engineer, Data Engineer, Technical CSM, Marketer).

## Founders

- Hassaan Raza, Co-founder and CEO. UT Austin CS. Ex-Google TPM, ex-Apple EPM, prior PM/SWE at JPMorgan, Cox Automotive, HPE.
- Quinn Favret, Co-founder and COO.
- Hassaan's stated obsessions in public interviews: sub-500ms conversational latency, gross margin per minute (inference cost reduction via model distillation), avoiding the uncanny valley, "platform for AI replicas across the SaaS ecosystem."

## Products

### Foundation models (proprietary)
- **Phoenix-4** (launched February 2026): Gaussian-diffusion rendering. Sub-600ms end-to-end latency. 40 fps sustained at 1080p. First real-time model to natively generate emotional states and listening behavior in a unified pipeline.
- **Raven-1**: Multimodal perception (emotion detection, gaze, on-screen context).
- **Sparrow-1**: Dialogue model handling turn-taking and conversational timing.

### Developer surface
- **CVI (Conversational Video Interface)**: the flagship. Real-time face-to-face AI video. Marketed at <500ms end-to-end latency. Two composable primitives: **Persona** (behavior, voice, LLM config) and **Replica** (the digital twin).
- **Video Generation**: async script-to-video using Replicas (legacy product).
- **PALs (Personal Affective Links)**: newer consumer-ish layer for AI companions that remember context across sessions. Sold as B2C ($20 Plus, $50 Max) and as the emotional-memory framework for enterprise CVI.

### Pricing
- **Basic**: $0. 25 CVI minutes/mo, 5 video-gen mins, 25 stock replicas, concurrency 1.
- **Starter**: $59/mo. 100 CVI mins, 10 gen mins, 3 trainings/mo, concurrency 3. Overage $0.37/min CVI, $1.00/min gen.
- **Growth**: $397/mo. 1,250 CVI mins, 100 gen mins, 7 trainings/mo, 100+ stock, concurrency 10. Overage $0.32/min CVI, $0.90/min gen.
- **Enterprise**: custom. Unlimited replicas, custom concurrency, SLA, white-label, SOC2/HIPAA.

### Units of consumption
- Primary: conversation minutes (CVI).
- Secondary: video generation minutes.
- Discrete: custom replica trainings, concurrent streams.

## Customers (publicly disclosed)

- **Final Round AI**: interview prep platform. 100K+ users, 1.2M+ practice minutes logged via Tavus CVI. Best public usage benchmark.
- **Delphi**: "FaceTime with your AI twin." Launched at 125 AI humans, scaling to thousands. Sub-1s latency. Times Square billboard.
- **CareFlick**: AgeTech, senior loneliness companions.
- **Logo-wall enterprises**: Deloitte, Amazon, OpenAI/ChatGPT.

Stated Series B traction: "over 100,000 developers and enterprises" using the platform (read as cumulative signups).

## Competitive position

- **HeyGen** ($22M ARR May 2024, async script-to-video): Tavus differentiates via real-time CVI; HeyGen has no real-time product.
- **Synthesia** (70% enterprise revenue, 140+ avatars, async): same wedge, Synthesia is pre-rendered.
- **D-ID**: most direct head-to-head on conversational. Tavus differentiates on latency and emotional perception (Raven-1).
- **Soul Machines, Inworld, Hour One, Argil, Captions**: Tavus rarely positions against directly.

Stated moat: sub-500ms latency, Phoenix + Raven + Sparrow unified stack (perception + dialogue + rendering as one pipeline), and the developer-platform posture (vs. HeyGen/Synthesia's end-user SaaS model).

## Founder voice notes (for drafting in Hassaan's tone)

- Hassaan writes plainly. Short sentences. Specific numbers, not adjectives.
- Frames Tavus as research lab plus developer platform, not SaaS company.
- Uses phrases like "human computing," "AI Humans," "closing the gap between people and machines."
- Talks gross margin and inference cost openly. Does not hedge on numbers.
- When discussing competition, names the category, not the rival.
- Investor updates open with the metric that moved most, not a greeting.

## Voice guidance for Claude generations

- No em dashes. Use commas, semicolons, periods, or parentheses.
- Tabular numerics in any rendered output: 1,287,400 not 1.287M unless brevity is required.
- Sub-500ms is the latency aspiration; sub-600ms is the Phoenix-4 published spec.
- Refer to customers by name (Final Round AI, Delphi, CareFlick) when grounded; never invent customer names.
- Never claim a metric is real; the dashboard is a Founders Associate application artifact with fabricated demo data.
