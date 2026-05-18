import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const DAILY_LIMIT = 10;

type LimitResult = { success: boolean; remaining: number; reset: number };

// ---------- Upstash path ----------
let upstash: Ratelimit | null = null;
function getUpstash(): Ratelimit | null {
  if (upstash) return upstash;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  upstash = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "1 d"),
    prefix: "tavus-pulse",
  });
  return upstash;
}

// ---------- In-memory fallback ----------
type Bucket = { count: number; resetAt: number };
const memory = new Map<string, Bucket>();
const DAY_MS = 24 * 60 * 60 * 1000;

function memoryCheck(ip: string): LimitResult {
  const now = Date.now();
  const bucket = memory.get(ip);
  if (!bucket || bucket.resetAt < now) {
    memory.set(ip, { count: 1, resetAt: now + DAY_MS });
    return { success: true, remaining: DAILY_LIMIT - 1, reset: now + DAY_MS };
  }
  if (bucket.count >= DAILY_LIMIT) {
    return { success: false, remaining: 0, reset: bucket.resetAt };
  }
  bucket.count++;
  return { success: true, remaining: DAILY_LIMIT - bucket.count, reset: bucket.resetAt };
}

// ---------- Public ----------

export async function rateLimit(ip: string): Promise<LimitResult> {
  const u = getUpstash();
  if (u) {
    const r = await u.limit(ip);
    return { success: r.success, remaining: r.remaining, reset: r.reset };
  }
  return memoryCheck(ip);
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}

export function rateLimitResponse(reset: number) {
  const seconds = Math.max(1, Math.round((reset - Date.now()) / 1000));
  return new Response(
    JSON.stringify({ error: "Rate limit reached. 10 generations per IP per day. Try again in " + Math.ceil(seconds / 60) + " minutes." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(seconds) } },
  );
}
