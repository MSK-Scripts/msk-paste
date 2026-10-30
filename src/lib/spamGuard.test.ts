import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./paste', () => ({ recentVolumeByIp: vi.fn() }))
vi.mock('./turnstile', () => ({ verifyTurnstile: vi.fn() }))
vi.mock('./apiKeys', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./apiKeys')>()),
  findActiveApiKey: vi.fn(),
}))

import { findActiveApiKey } from './apiKeys'
import { issueFormStamp } from './formStamp'
import { recentVolumeByIp } from './paste'
import { guardCreate, recordAccepted } from './spamGuard'
import { verifyTurnstile } from './turnstile'

const ORIGIN = 'https://paste.msk-scripts.de'
const IP_HASH = Buffer.alloc(32)

function headers(values: Record<string, string>) {
  return { get: (name: string) => values[name.toLowerCase()] ?? null }
}

/** A stamp issued long enough ago to pass the fill-time check. */
function oldStamp() {
  return issueFormStamp(Date.now() - 10_000)
}

function formRequest(content: string, proof: Record<string, unknown> = {}) {
  return guardCreate({
    headers: headers({ origin: ORIGIN }),
    content,
    proof:   { formStamp: oldStamp(), turnstileToken: 'token', ...proof },
    ip:      '203.0.113.7',
    ipHash:  IP_HASH,
  })
}

let unique = 0
/** A content no earlier test has recorded. */
function text() {
  unique++
  return `console.log("snippet ${unique}")\nconst value = ${unique} * 2\n`
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', ORIGIN)
  vi.mocked(recentVolumeByIp).mockResolvedValue({ count: 0, bytes: 0 })
  vi.mocked(verifyTurnstile).mockResolvedValue('ok')
  vi.mocked(findActiveApiKey).mockResolvedValue(null)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('the form', () => {
  it('lets a person through', async () => {
    expect(await formRequest(text())).toEqual({ ok: true, via: 'form' })
  })

  it('sends a script without key and without origin to the API key', async () => {
    const result = await guardCreate({
      headers: headers({}),
      content: text(),
      proof:   {},
      ip:      '203.0.113.7',
      ipHash:  IP_HASH,
    })
    expect(result).toMatchObject({ ok: false, status: 401, code: 'api-key-required' })
    expect(verifyTurnstile).not.toHaveBeenCalled()
  })

  it('turns down another origin', async () => {
    const result = await guardCreate({
      headers: headers({ origin: 'https://evil.example' }),
      content: text(),
      proof:   { formStamp: oldStamp(), turnstileToken: 'token' },
      ip:      '203.0.113.7',
      ipHash:  IP_HASH,
    })
    expect(result).toMatchObject({ ok: false, code: 'origin' })
  })

  it('turns down a filled honeypot', async () => {
    expect(await formRequest(text(), { website: 'http://spam.example' })).toMatchObject({ ok: false, code: 'rejected' })
  })

  it('turns down a missing or fresh stamp', async () => {
    expect(await formRequest(text(), { formStamp: undefined })).toMatchObject({ code: 'stamp-invalid' })
    expect(await formRequest(text(), { formStamp: issueFormStamp() })).toMatchObject({ code: 'too-fast' })
  })

  it('turns down an encoded blob before spending the token', async () => {
    const blob = 'A'.repeat(20_000)
    expect(await formRequest(blob)).toMatchObject({ ok: false, status: 422, code: 'blob' })
    expect(verifyTurnstile).not.toHaveBeenCalled()
  })

  it('turns down the same content a second time', async () => {
    const content = text()
    expect(await formRequest(content)).toMatchObject({ ok: true })
    recordAccepted(content)
    expect(await formRequest(content)).toMatchObject({ ok: false, code: 'duplicate' })
  })

  it('turns down an address over its daily count or volume', async () => {
    vi.mocked(recentVolumeByIp).mockResolvedValue({ count: 20, bytes: 0 })
    expect(await formRequest(text())).toMatchObject({ ok: false, status: 429, code: 'daily-limit' })
    vi.mocked(recentVolumeByIp).mockResolvedValue({ count: 1, bytes: 5 * 1024 * 1024 })
    expect(await formRequest(text())).toMatchObject({ ok: false, code: 'daily-limit' })
  })

  it('needs a solved captcha and fails closed without Cloudflare', async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue('invalid')
    expect(await formRequest(text())).toMatchObject({ ok: false, status: 403, code: 'captcha' })
    vi.mocked(verifyTurnstile).mockResolvedValue('missing')
    expect(await formRequest(text())).toMatchObject({ ok: false, code: 'captcha' })
    vi.mocked(verifyTurnstile).mockResolvedValue('not-configured')
    expect(await formRequest(text())).toMatchObject({ ok: false, status: 503, code: 'captcha-unavailable' })
  })
})

describe('an API key', () => {
  function keyRequest(authorization: string, content = text()) {
    return guardCreate({
      headers: headers({ authorization }),
      content,
      proof:   {},
      ip:      '203.0.113.7',
      ipHash:  IP_HASH,
    })
  }

  it('lets a valid key through without form checks', async () => {
    vi.mocked(findActiveApiKey).mockResolvedValue({
      id: 1, key_prefix: 'mskp_abcdefgh', label: 'test',
      created_at: new Date(), last_used_at: null, revoked_at: null,
    })
    expect(await keyRequest('Bearer mskp_valid')).toEqual({ ok: true, via: 'api-key' })
    expect(verifyTurnstile).not.toHaveBeenCalled()
    expect(recentVolumeByIp).not.toHaveBeenCalled()
  })

  it('turns down an unknown or revoked key instead of falling back to the form', async () => {
    expect(await keyRequest('Bearer mskp_unknown')).toMatchObject({ ok: false, status: 401, code: 'api-key-invalid' })
    expect(await keyRequest('Basic abc')).toMatchObject({ ok: false, code: 'api-key-invalid' })
  })

  it('stops an address after ten wrong keys, before hashing again', async () => {
    const other = Buffer.alloc(32, 7)
    const attempt = () =>
      guardCreate({
        headers: headers({ authorization: 'Bearer mskp_wrong' }),
        content: text(),
        proof:   {},
        ip:      '198.51.100.9',
        ipHash:  other,
      })
    for (let i = 0; i < 10; i++) expect(await attempt()).toMatchObject({ status: 401 })
    vi.mocked(findActiveApiKey).mockClear()
    expect(await attempt()).toMatchObject({ ok: false, status: 429, code: 'key-attempts' })
    expect(findActiveApiKey).not.toHaveBeenCalled()
  })

  it('still runs the content checks', async () => {
    vi.mocked(findActiveApiKey).mockResolvedValue({
      id: 2, key_prefix: 'mskp_abcdefgh', label: 'test',
      created_at: new Date(), last_used_at: null, revoked_at: null,
    })
    expect(await keyRequest('Bearer mskp_valid', 'B'.repeat(20_000))).toMatchObject({ ok: false, code: 'blob' })
  })
})
