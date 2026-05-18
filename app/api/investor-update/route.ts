import { NextRequest } from "next/server";
import { getAnthropic, buildSystem, MODEL } from "@/lib/anthropic";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { dashboardSnapshotForClaude } from "@/data/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(ip);
  if (!limit.success) return rateLimitResponse(limit.reset);

  const snapshot = dashboardSnapshotForClaude();

  const userPrompt = `Dashboard snapshot (use ONLY these numbers; do not invent metrics):

${JSON.stringify(snapshot, null, 2)}

Draft a Tavus monthly investor update from Hassaan Raza to the CRV / Sequoia / Scale / YC cap table. Series B, post-$40M round.

Structure:
1. **Opening line.** Lead with the single metric that moved most this month. No "Hi all" or "Hope you had a great week." Open with a number.
2. **The number.** Two to three sentences on top-line growth (conversation minutes, ARR run rate). Use the actual numbers from the snapshot.
3. **Product.** What shipped or what's in flight. Reference Phoenix-4 maturity, latency improvements, fps. Use real model names.
4. **Customers.** Two to three named customer beats. Use ONLY customers in the snapshot's topAccounts. Lead with the win, name the customer, give the number.
5. **Economics.** One paragraph on gross margin and cost per minute. Compare to 90 days ago using the snapshot's economics.costPerMinute90dAgo.
6. **Asks.** One short paragraph with 2-3 specific asks (intros to a named function at named accounts, a hire we need, a metric we want feedback on).

Voice: Hassaan. Short sentences. Specific numbers, no adjectives where a number works. No em dashes. No markdown headers, but you may use bold for the section labels (Opening, Numbers, Product, Customers, Economics, Asks).

Length: 350-450 words.`;

  const anthropic = getAnthropic();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.stream({
          model: MODEL,
          max_tokens: 1400,
          system: buildSystem(),
          messages: [{ role: "user", content: userPrompt }],
        });
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\n[error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-RateLimit-Remaining": String(limit.remaining),
    },
  });
}
