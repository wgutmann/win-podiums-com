/**
 * Rate limiting for refresh endpoint using KV.
 * Max 10 requests per 60 seconds per user. KV is eventually consistent; occasional over-limit is acceptable for MVP.
 */
import type { KVNamespace } from "@cloudflare/workers-types";

const REFRESH_RATE_LIMIT_TTL = 60;
const REFRESH_RATE_LIMIT_MAX = 10;

export interface RefreshRateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

/**
 * Check and increment refresh rate limit for user. Returns allowed=true if under limit, false if exceeded.
 * Caller should return 429 with Retry-After: 60 when allowed is false.
 */
export async function checkRefreshRateLimit(
  kv: KVNamespace | undefined,
  userId: string
): Promise<RefreshRateLimitResult> {
  if (!kv) return { allowed: true };

  const key = `refresh:rate:${userId}`;
  const now = Math.floor(Date.now() / 1000);
  const windowEnd = now + REFRESH_RATE_LIMIT_TTL;

  const raw = await kv.get(key);
  let count = 0;
  let storedWindowEnd = 0;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { count: number; windowEnd: number };
      count = parsed.count ?? 0;
      storedWindowEnd = parsed.windowEnd ?? 0;
    } catch {
      // Invalid JSON, treat as new window
    }
  }

  // Reset window if expired
  if (storedWindowEnd < now) {
    count = 0;
  }

  if (count >= REFRESH_RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.max(1, storedWindowEnd - now) };
  }

  const newCount = count + 1;
  await kv.put(
    key,
    JSON.stringify({ count: newCount, windowEnd: Math.max(windowEnd, storedWindowEnd) }),
    { expirationTtl: REFRESH_RATE_LIMIT_TTL }
  );

  return { allowed: true };
}
