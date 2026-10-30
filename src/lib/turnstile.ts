/**
 * Cloudflare Turnstile, the captcha of the create form.
 *
 * Required in production: without CAPTCHA_SITE_KEY and CAPTCHA_SECRET_KEY the
 * form cannot create anything there (fails closed). In development both may
 * be left out, then the check is skipped. Cloudflare's test keys
 * (site key 1x00000000000000000000AA, secret
 * 1x0000000000000000000000000000000AA) always pass.
 */

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/** The action the widget is rendered with; a token for another form fails. */
export const TURNSTILE_ACTION = 'create-paste'

export type TurnstileVerdict = 'ok' | 'missing' | 'invalid' | 'unavailable' | 'not-configured'

/** The public site key for the widget, or null when none is configured. */
export function turnstileSiteKey(): string | null {
  return process.env.CAPTCHA_SITE_KEY || null
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/** The host a token must have been solved on, from the public base URL. */
function expectedHostname(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? '').hostname
  } catch {
    return null
  }
}

interface SiteverifyResponse {
  success?:  boolean
  hostname?: string
  action?:   string
  metadata?: { result_with_testing_key?: boolean }
}

/**
 * Verifies a token with Cloudflare. Fails closed: a missing token, a token
 * for another host or action, and an unreachable Cloudflare all reject.
 */
export async function verifyTurnstile(token: unknown, ip: string): Promise<TurnstileVerdict> {
  const secret = process.env.CAPTCHA_SECRET_KEY
  if (!secret || !turnstileSiteKey()) return isProduction() ? 'not-configured' : 'ok'
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return 'missing'

  const body = new URLSearchParams({ secret, response: token })
  if (ip !== '0.0.0.0') body.set('remoteip', ip)

  let data: SiteverifyResponse
  try {
    const res = await fetch(SITEVERIFY, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal:  AbortSignal.timeout(8_000),
    })
    if (!res.ok) {
      console.error('[turnstile] siteverify returned HTTP', res.status)
      return 'unavailable'
    }
    data = (await res.json()) as SiteverifyResponse
  } catch (err) {
    console.error('[turnstile] verification failed:', (err as Error).message)
    return 'unavailable'
  }

  if (data.success !== true) return 'invalid'
  // Cloudflare's test keys pass any token and name no action or host. Fine
  // for local tests, never in production.
  if (data.metadata?.result_with_testing_key === true) return isProduction() ? 'invalid' : 'ok'
  if (data.action !== TURNSTILE_ACTION) return 'invalid'
  // Test keys answer with a placeholder host, so the host is checked in
  // production only.
  const host = expectedHostname()
  if (isProduction() && host && data.hostname !== host) return 'invalid'
  return 'ok'
}
