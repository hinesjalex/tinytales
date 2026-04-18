/**
 * Best-effort in-memory IP rate limiter.
 *
 * NOTE: Vercel functions are stateless and scale horizontally, so this
 * counter is per-instance — the effective limit is higher than the
 * configured one. Good enough to stop casual abuse; for a hard ceiling,
 * swap this for Upstash / Vercel KV / Redis.
 */

const buckets = new Map();

export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkLimit(key, { max, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}
