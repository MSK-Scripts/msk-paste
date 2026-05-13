import { createHash } from 'crypto'
import { envInt } from './env'

// ─── In-memory rate limit (suitable for single-server setups) ─────────
// For multi-instance deployments Redis would be better, but a single
// Node process is enough for this app.

type Bucket = {
  count:   number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Cleanup interval: drop expired entries every 5 minutes.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, CLEANUP_INTERVAL_MS).unref?.()
}

/**
 * Hashes an IP address with the secret pepper (GDPR-compliant).
 */
export function hashIp(ip: string): string {
  const secret = process.env.IP_HASH_SECRET
  if (!secret) {
    throw new Error('IP_HASH_SECRET is not set')
  }
  return createHash('sha256').update(ip + secret).digest('hex')
}

/**
 * Returns the hashed IP as a Buffer (for storage in VARBINARY(32)).
 */
export function hashIpBuffer(ip: string): Buffer {
  const secret = process.env.IP_HASH_SECRET
  if (!secret) {
    throw new Error('IP_HASH_SECRET is not set')
  }
  return createHash('sha256').update(ip + secret).digest()
}

/**
 * Checks the rate limit for a given identifier (e.g. an IP hash).
 */
export function checkRateLimit(
  key:      string,
  limit:    number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now    = Date.now()
  const bucket = buckets.get(key)

  // New bucket or expired
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  // Limit reached
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt }
  }

  // Increment
  bucket.count++
  return {
    allowed:   true,
    remaining: limit - bucket.count,
    resetAt:   bucket.resetAt,
  }
}

/**
 * Convenience wrapper for paste creation.
 */
export function checkCreateRateLimit(ipHash: string) {
  const limit  = envInt('RATE_LIMIT_CREATE_PER_HOUR', 10)
  const window = 60 * 60 * 1000 // 1 hour
  return checkRateLimit(`create:${ipHash}`, limit, window)
}

/**
 * Extracts the real client IP from request headers.
 * Honours Apache2 reverse proxy headers (X-Forwarded-For, X-Real-IP)
 * and Cloudflare (CF-Connecting-IP).
 */
export function getClientIp(headers: { get(name: string): string | null }): string {
  const xff    = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfIp   = headers.get('cf-connecting-ip')

  if (cfIp)   return cfIp.trim()
  if (xff)    return xff.split(',')[0]!.trim()
  if (realIp) return realIp.trim()

  return '0.0.0.0'
}
