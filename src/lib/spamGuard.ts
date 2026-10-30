import { bearerKey, findActiveApiKey } from './apiKeys'
import { envInt } from './env'
import { checkFormStamp } from './formStamp'
import { checkRateLimit } from './rateLimit'
import { recentVolumeByIp } from './paste'
import { checkContent, DuplicateTracker } from './spamHeuristics'
import { verifyTurnstile } from './turnstile'

/**
 * Who may create a paste, and what they may create.
 *
 * Two ways in, nothing else:
 * - the site's own form: same origin, an untouched honeypot, a signed form
 *   stamp at least a few seconds old, a solved Turnstile and a daily volume
 *   per address;
 * - a script with an API key from scripts/api-key.sh, limited per key.
 * Both pass the content checks (encoded blobs, link spam, duplicates).
 *
 * Cheap checks run first. Turnstile runs last, because verifying a token
 * spends it: a paste turned down for its content keeps its token and can be
 * sent again after fixing it.
 */

export type GuardCode =
  | 'api-key-required'
  | 'api-key-invalid'
  | 'origin'
  | 'rejected'
  | 'stamp-invalid'
  | 'too-fast'
  | 'stamp-expired'
  | 'links'
  | 'blob'
  | 'duplicate'
  | 'daily-limit'
  | 'key-limit'
  | 'key-attempts'
  | 'captcha'
  | 'captcha-unavailable'

export type GuardResult =
  | { ok: true; via: 'form' | 'api-key' }
  | { ok: false; status: number; code: GuardCode; message: string }

/** Fields the create form sends besides the paste. */
export interface FormProof {
  website?:        unknown
  formStamp?:      unknown
  turnstileToken?: unknown
}

const duplicates = new DuplicateTracker()

// ─── Wrong keys per address ──────────────────────────────────────────
// Checking a key costs a scrypt hash, so an address that keeps sending wrong
// keys is stopped before hashing: 10 wrong keys per 10 minutes.
const KEY_FAILURE_LIMIT = 10
const KEY_FAILURE_WINDOW_MS = 10 * 60 * 1000
const keyFailures = new Map<string, { count: number; resetAt: number }>()

function keyFailuresExceeded(address: string, now = Date.now()): boolean {
  const entry = keyFailures.get(address)
  return entry !== undefined && entry.resetAt > now && entry.count >= KEY_FAILURE_LIMIT
}

function recordKeyFailure(address: string, now = Date.now()): void {
  const entry = keyFailures.get(address)
  if (entry && entry.resetAt > now) {
    entry.count++
    return
  }
  if (keyFailures.size > 10_000) {
    for (const [key, value] of keyFailures) if (value.resetAt <= now) keyFailures.delete(key)
  }
  keyFailures.set(address, { count: 1, resetAt: now + KEY_FAILURE_WINDOW_MS })
}

function deny(status: number, code: GuardCode, message: string): GuardResult {
  return { ok: false, status, code, message }
}

function expectedOrigin(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? '').origin
  } catch {
    return null
  }
}

function checkContentAndRepeats(content: string): GuardResult | null {
  const verdict = checkContent(content)
  if (!verdict.ok && verdict.reason === 'links') {
    return deny(422, 'links', 'The paste consists mostly of links')
  }
  if (!verdict.ok && verdict.reason === 'blob') {
    return deny(422, 'blob', 'Encoded files and binary data cannot be pasted')
  }
  if (duplicates.isDuplicate(content)) {
    return deny(409, 'duplicate', 'The same content was pasted recently')
  }
  return null
}

/** Checks a create request before anything is stored. */
export async function guardCreate(params: {
  headers: { get(name: string): string | null }
  content: string
  proof:   FormProof
  ip:      string
  ipHash:  Buffer
}): Promise<GuardResult> {
  const { headers, content, proof, ip, ipHash } = params

  // ─── A script with an API key ───────────────────────────────────
  const key = bearerKey(headers)
  if (key !== null) {
    const address = ipHash.toString('hex')
    if (keyFailuresExceeded(address)) {
      return deny(429, 'key-attempts', 'Too many invalid API keys, try again later')
    }
    const row = await findActiveApiKey(key)
    if (!row) {
      recordKeyFailure(address)
      return deny(401, 'api-key-invalid', 'Invalid API key')
    }

    const refused = checkContentAndRepeats(content)
    if (refused) return refused

    const perHour = envInt('API_KEY_CREATE_PER_HOUR', 120)
    if (!checkRateLimit(`api-key:${row.id}`, perHour, 60 * 60 * 1000).allowed) {
      return deny(429, 'key-limit', 'Hourly limit of this API key reached')
    }
    return { ok: true, via: 'api-key' }
  }

  // ─── The site's own form ────────────────────────────────────────
  const origin = headers.get('origin')
  if (!origin) {
    return deny(401, 'api-key-required', 'Creating pastes through the API requires an API key')
  }
  if (process.env.NODE_ENV === 'production' && origin !== expectedOrigin()) {
    return deny(403, 'origin', 'Request from another site')
  }

  // A field people never see; whatever fills it is a bot.
  if (typeof proof.website === 'string' && proof.website.length > 0) {
    return deny(400, 'rejected', 'Request rejected')
  }

  const stamp = checkFormStamp(proof.formStamp)
  if (stamp === 'invalid') return deny(400, 'stamp-invalid', 'Reload the page and try again')
  if (stamp === 'too-fast') return deny(400, 'too-fast', 'Please wait a moment and send again')
  if (stamp === 'expired') return deny(400, 'stamp-expired', 'The page is too old, reload it')

  const refused = checkContentAndRepeats(content)
  if (refused) return refused

  const volume = await recentVolumeByIp(ipHash)
  const maxCount = envInt('DAILY_PASTES_PER_IP', 20)
  const maxBytes = envInt('DAILY_BYTES_PER_IP', 5 * 1024 * 1024)
  if (volume.count >= maxCount || volume.bytes + Buffer.byteLength(content, 'utf8') > maxBytes) {
    return deny(429, 'daily-limit', 'Daily limit for your address reached')
  }

  const captcha = await verifyTurnstile(proof.turnstileToken, ip)
  if (captcha === 'unavailable' || captcha === 'not-configured') {
    return deny(503, 'captcha-unavailable', 'The spam check is unavailable, try again later')
  }
  if (captcha !== 'ok') return deny(403, 'captcha', 'Captcha not solved')

  return { ok: true, via: 'form' }
}

/** Remembers an accepted content, so the same block is not taken again. */
export function recordAccepted(content: string): void {
  duplicates.record(content)
}
