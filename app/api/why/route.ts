import { NextRequest } from "next/server";
import { getAnthropic, buildSystem, MODEL } from "@/lib/anthropic";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { dashboardSnapshotForClaude } from "@/data/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WhyHypothesis = { rank: number; hypothesis: string; check: string };

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  const body = await req.json().catch(() => ({}));
  const metric: string = body?.metric ?? "this metric";
  const context: string = body?.context ?? "";

  const snapshot = dashboardSnapshotForClaude();

  const userPrompt = `Dashboard snapshot:

${JSON.stringify(snapshot, null, 2)}

The FA clicked "Why is this off?" on this metric: ${metric}
${context ? `Additional context: ${context}` : ""}

Return three ranked hypotheses for why this metric is where it is, and for each, one concrete thing the FA could check next (a dashboard, a person to ask, a query to run, a customer to look at).

Reply ONLY with valid JSON in this exact shape, no prose:
{
  "hypotheses": [
    { "rank": 1, "hypothesis": "...", "check": "..." },
    { "rank": 2, "hypothesis": "...", "check": "..." },
    { "rank": 3, "hypothesis": "...", "check": "..." }
  ]
}`;

  const anthropic = getAnthropic();
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: buildSystem(),
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = msg.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("");

    const parsed = parseHypotheses(text);
    return Response.json({ hypotheses: parsed }, {
      headers: { "X-RateLimit-Remaining": String(limit.remaining) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

function parseHypotheses(text: string): WhyHypothesis[] {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    if (Array.isArray(obj.hypotheses)) return obj.hypotheses.slice(0, 3);
  } catch {}
  return [{ rank: 1, hypothesis: "Claude returned malformed JSON. Click Retry.", check: "Review the network response in DevTools." }];
}
