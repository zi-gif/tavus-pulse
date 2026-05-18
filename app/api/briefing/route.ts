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

  const userPrompt = `Here is this morning's dashboard snapshot:

${JSON.stringify(snapshot, null, 2)}

Write the Morning Briefing for the Founders Associate. Exactly three sentences.

Sentence 1: lead with the single metric that moved most overnight or that demands attention today. Be specific. Include the number and the comparison.
Sentence 2: name one risk or anomaly worth flagging. Reference a specific customer, metric, or system signal from the snapshot.
Sentence 3: a concrete first action the FA should take today (a call to make, a thread to start, a number to verify). Address the FA directly.

Do not greet. Do not number the sentences. Plain prose. No markdown.`;

  const anthropic = getAnthropic();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.stream({
          model: MODEL,
          max_tokens: 400,
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
