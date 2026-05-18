import { NextRequest } from "next/server";
import { getAnthropic, buildSystem, MODEL } from "@/lib/anthropic";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { customers } from "@/data/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  const body = await req.json().catch(() => ({}));
  const id: string = body?.id;
  const account = customers.find((c) => c.id === id);
  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  const compact = {
    name: account.name,
    isPublic: account.isPublic,
    tier: account.tier,
    vertical: account.vertical,
    minutesMTD: account.minutesMTD,
    minutesPrevMonth: account.minutesPrevMonth,
    monthOverMonthChange: +(((account.minutesMTD - account.minutesPrevMonth) / account.minutesPrevMonth) * 100).toFixed(1),
    spendMTD: account.spendMTD,
    wowChange: +(account.wowChange * 100).toFixed(1),
    renewalInDays: account.renewalInDays,
    ndr: account.ndr,
    churnRisk: account.churnRisk,
    notes: account.notes,
    last30DaysHistory: account.history.slice(-30),
  };

  const userPrompt = `Customer snapshot:

${JSON.stringify(compact, null, 2)}

Write a one-sentence operator briefing for this account. Lead with what happened (number + direction), then the most likely reason or implication, then optionally one watch-out. Under 35 words. No greeting. No markdown. No em dashes.`;

  const anthropic = getAnthropic();
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 160,
      system: buildSystem(),
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = msg.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("")
      .trim();
    return Response.json({ oneLiner: text }, {
      headers: { "X-RateLimit-Remaining": String(limit.remaining) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
