import { createHmac, timingSafeEqual } from 'crypto'

/**
 * A signed timestamp the create form carries from the moment the page was
 * rendered. It tells a person, who needs a few seconds, from a script that
 * posts the instant it has the page, and it cannot be made up without the
 * server's secret.
 */

/** Below this the form was not filled in by a person. */
export const MIN_FILL_MS = 2_000

/** A page left open longer than this has to be reloaded. */
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000

export type StampVerdict = 'ok' | 'invalid' | 'too-fast' | 'expired'

function stampKey(): Buffer {
  const secret = process.env.IP_HASH_SECRET
  if (!secret) throw new Error('IP_HASH_SECRET is not set')
  // A key of its own, so a stamp signature is never a valid IP hash.
  return createHmac('sha256', secret).update('form-stamp').digest()
}

function sign(issuedAt: number): string {
  return createHmac('sha256', stampKey()).update(String(issuedAt)).digest('base64url')
}

/** A stamp for a form rendered now. */
export function issueFormStamp(now = Date.now()): string {
  return `${now}.${sign(now)}`
}

/** Checks a stamp sent with a form. */
export function checkFormStamp(stamp: unknown, now = Date.now()): StampVerdict {
  if (typeof stamp !== 'string') return 'invalid'
  const match = /^(\d{13})\.([A-Za-z0-9_-]{43})$/.exec(stamp)
  if (!match) return 'invalid'

  const issuedAt = Number(match[1])
  const expected = Buffer.from(sign(issuedAt))
  const given = Buffer.from(match[2]!)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid'

  const age = now - issuedAt
  if (age < MIN_FILL_MS) return 'too-fast'
  if (age > MAX_FORM_AGE_MS) return 'expired'
  return 'ok'
}
