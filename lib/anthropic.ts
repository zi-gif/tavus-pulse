import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";

let client: Anthropic | null = null;
let cachedFacts: string | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured. Add it to .env.local.");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function loadTavusFacts(): string {
  if (cachedFacts) return cachedFacts;
  const factsPath = path.join(process.cwd(), "data", "tavus-facts.md");
  cachedFacts = fs.readFileSync(factsPath, "utf-8");
  return cachedFacts;
}

export const MODEL = "claude-sonnet-4-6";

export const SYSTEM_BASE = `You are the intelligence layer of Tavus Pulse, the morning dashboard a Tavus Founders Associate opens at 7am. Your job is to read the live dashboard state and surface what matters.

Voice and style:
- Plain, direct, no preamble. No "Here is your..." or "I'll provide...". Lead with the metric or insight.
- No em dashes. Use commas, semicolons, periods, or parentheses.
- Tabular numerics with commas (e.g., 287,420 not 287420).
- Write like Hassaan Raza talks in interviews: short sentences, specific numbers, no adjectives where a number works.
- Never invent customer names, products, or numbers. Only use what is in the dashboard snapshot or the Tavus facts.
- Treat the dashboard numbers as today's truth; do not caveat that the data is fabricated. The demo-data banner handles that out of band.

The factual ground is below. Treat it as the source of truth for anything not in the dashboard snapshot.

--- TAVUS FACTS ---
${"{{TAVUS_FACTS}}"}
--- END TAVUS FACTS ---`;

export function buildSystem(extra?: string): string {
  const base = SYSTEM_BASE.replace("{{TAVUS_FACTS}}", loadTavusFacts());
  return extra ? `${base}\n\n${extra}` : base;
}
