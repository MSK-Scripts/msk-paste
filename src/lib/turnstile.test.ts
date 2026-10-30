import { afterEach, describe, expect, it, vi } from 'vitest'
import { TURNSTILE_ACTION, verifyTurnstile } from './turnstile'

function answer(body: object, status = 200) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status })))
}

function configure() {
  vi.stubEnv('CAPTCHA_SITE_KEY', 'site')
  vi.stubEnv('CAPTCHA_SECRET_KEY', 'secret')
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://paste.msk-scripts.de')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('verifyTurnstile', () => {
  it('fails closed in production without keys', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('CAPTCHA_SITE_KEY', '')
    vi.stubEnv('CAPTCHA_SECRET_KEY', '')
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('not-configured')
  })

  it('is skipped in development without keys', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('CAPTCHA_SITE_KEY', '')
    vi.stubEnv('CAPTCHA_SECRET_KEY', '')
    expect(await verifyTurnstile(undefined, '203.0.113.7')).toBe('ok')
  })

  it('needs a token', async () => {
    configure()
    expect(await verifyTurnstile(undefined, '203.0.113.7')).toBe('missing')
    expect(await verifyTurnstile('', '203.0.113.7')).toBe('missing')
  })

  it('accepts a token solved on this host for this action', async () => {
    configure()
    vi.stubEnv('NODE_ENV', 'production')
    answer({ success: true, action: TURNSTILE_ACTION, hostname: 'paste.msk-scripts.de' })
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('ok')
  })

  it('turns down a token for another action or another host', async () => {
    configure()
    vi.stubEnv('NODE_ENV', 'production')
    answer({ success: true, action: 'submit-form', hostname: 'paste.msk-scripts.de' })
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('invalid')
    answer({ success: true, action: TURNSTILE_ACTION, hostname: 'forms.msk-scripts.de' })
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('invalid')
  })

  it('takes a test-key result outside production only', async () => {
    configure()
    const testing = { success: true, hostname: 'example.com', metadata: { result_with_testing_key: true } }
    answer(testing)
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('ok')
    vi.stubEnv('NODE_ENV', 'production')
    answer(testing)
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('invalid')
  })

  it('turns down a failed check', async () => {
    configure()
    answer({ success: false, action: TURNSTILE_ACTION })
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('invalid')
  })

  it('fails closed when Cloudflare cannot be reached', async () => {
    configure()
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNRESET') }))
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('unavailable')
    answer({}, 500)
    expect(await verifyTurnstile('token', '203.0.113.7')).toBe('unavailable')
  })
})
