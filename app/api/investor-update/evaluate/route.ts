import { NextRequest } from "next/server";
import { getAnthropic, buildSystem, MODEL } from "@/lib/anthropic";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { dashboardSnapshotForClaude } from "@/data/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Flag = { severity: "info" | "watch" | "issue"; label: string; detail: string };

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  const body = await req.json().catch(() => ({}));
  const draft: string = body?.draft ?? "";
  if (!draft || draft.length < 80) {
    return Response.json({ error: "Draft is empty or too short to evaluate." }, { status: 400 });
  }

  const snapshot = dashboardSnapshotForClaude();

  const userPrompt = `Evaluator pass. You did NOT write this draft. You are reading it fresh and checking it against the dashboard snapshot for factual drift and internal consistency.

Dashboard snapshot (the source of truth):

${JSON.stringify(snapshot, null, 2)}

Draft to evaluate:

"""
${draft}
"""

Find:
- Any numbers in the draft that do not match the snapshot.
- Any customers named that are not in the snapshot's topAccounts list.
- Any claims that contradict the Tavus facts (model names, pricing tiers, funding stage).
- Em dashes (the project banned them).
- Vague hedging that should be a specific number.
- Strong wins worth highlighting that the draft buried.

Reply ONLY with valid JSON in this exact shape:
{
  "flags": [
    { "severity": "info" | "watch" | "issue", "label": "short label", "detail": "one sentence specific finding" }
  ],
  "summary": "one sentence overall verdict (clean / minor drift / material drift)"
}

Use "issue" for factual contradictions, "watch" for stylistic or borderline calls, "info" for praise or non-blocking observations. If everything checks out, return one info-level flag with summary "clean".`;

  const anthropic = getAnthropic();
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 900,
      system: buildSystem("In evaluator mode you are read-only. You do not rewrite or paraphrase the draft. You return JSON only."),
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = msg.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("");
    const parsed = parseFlags(text);
    return Response.json(parsed, {
      headers: { "X-RateLimit-Remaining": String(limit.remaining) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

function parseFlags(text: string): { flags: Flag[]; summary: string } {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    if (Array.isArray(obj.flags)) {
      return { flags: obj.flags, summary: obj.summary ?? "" };
    }
  } catch {}
  return {
    flags: [{ severity: "watch", label: "Evaluator parse error", detail: "Drift check returned malformed JSON. Click Re-evaluate." }],
    summary: "evaluator unavailable",
  };
}
