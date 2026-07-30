// In-memory fixed-window rate limiter. This is a real gap that existed until now:
// every route that spends Anthropic API tokens, plus login/signup, had zero request
// throttling — any authenticated user could hammer the AI routes without limit, and
// anyone could brute-force login or spam-create accounts.
//
// Known limitation: state lives in process memory, so it resets on every deploy/
// restart and does not share state across multiple server instances. That's an
// acceptable MVP tradeoff for a single-process app (matches the SQLite datastore's
// own documented limitation) — production behind a load balancer with multiple
// instances needs a shared store (Redis, or a DB-backed limiter) instead.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic sweep so the map doesn't grow unbounded from one-off keys (e.g. many
// distinct IPs hitting login once). Runs at most once per minute, on whichever
// request happens to trigger it.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return Response.json(
    { error: `Too many requests. Try again in ${retryAfterSec}s.` },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}

// x-forwarded-for can carry a client-supplied list; the first entry is what the
// nearest trusted proxy reported, which is good enough for a rate-limit key (not an
// authorization decision) — worst case an attacker only limits themselves.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
