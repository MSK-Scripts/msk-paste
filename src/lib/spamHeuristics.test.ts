import { describe, expect, it } from 'vitest'
import { randomBytes } from 'crypto'
import {
  checkContent,
  DuplicateTracker,
  isLinkSpam,
  longestEncodedRun,
  looksLikeEncodedBlob,
  MAX_ENCODED_RUN,
} from './spamHeuristics'

/** Base64 of random bytes, wrapped like a PEM or MIME body. */
function wrappedBase64(bytes: number, width: number): string {
  const flat = randomBytes(bytes).toString('base64')
  return flat.match(new RegExp(`.{1,${width}}`, 'g'))!.join('\n')
}

describe('encoded blobs', () => {
  it('rejects one unbroken run of base64 as long as the spam blocks', () => {
    const blob = randomBytes(400_000).toString('base64url')
    expect(looksLikeEncodedBlob(blob)).toBe(true)
    expect(checkContent(blob)).toEqual({ ok: false, reason: 'blob' })
  })

  it('measures the longest run of encoding characters', () => {
    expect(longestEncodedRun('abc def+/== x')).toBe(7)
    expect(longestEncodedRun('a'.repeat(MAX_ENCODED_RUN - 1))).toBe(MAX_ENCODED_RUN - 1)
  })

  it('rejects a large base64 file wrapped at 64 and 76 columns', () => {
    expect(looksLikeEncodedBlob(wrappedBase64(80_000, 64))).toBe(true)
    expect(looksLikeEncodedBlob(wrappedBase64(80_000, 76))).toBe(true)
  })

  it('keeps a certificate or a key, which are short', () => {
    const pem = `-----BEGIN CERTIFICATE-----\n${wrappedBase64(1_500, 64)}\n-----END CERTIFICATE-----`
    expect(looksLikeEncodedBlob(pem)).toBe(false)
  })

  it('keeps a large log and large code', () => {
    const line = '2026-10-30 15:16:31 [INFO] [msk_core] Player 12 joined the server (license:abc123)\n'
    expect(looksLikeEncodedBlob(line.repeat(2_000))).toBe(false)
    const code = 'local function add(a, b)\n  return a + b\nend\n'
    expect(looksLikeEncodedBlob(code.repeat(3_000))).toBe(false)
  })

  it('keeps large minified code, which has punctuation', () => {
    const minified = 'function a(b){return b.map(c=>c*2).filter(d=>d>3)};'.repeat(2_000)
    expect(looksLikeEncodedBlob(minified)).toBe(false)
  })
})

describe('link spam', () => {
  it('rejects text that is mostly links', () => {
    const spam = 'Great: https://example-shop.app/a https://example-shop.app/b https://example-shop.app/c'
    expect(isLinkSpam(spam)).toBe(true)
    expect(checkContent(spam)).toEqual({ ok: false, reason: 'links' })
  })

  it('rejects forum markup with several links', () => {
    const spam = '[url=https://a.example]a[/url] [url=https://b.example]b[/url] [url=https://c.example]c[/url]'
    expect(isLinkSpam(spam)).toBe(true)
  })

  it('keeps code or notes that mention a few links among a lot of text', () => {
    const text =
      'Install the resource and add it to server.cfg. Docs: https://docu.msk-scripts.de/msk_core\n' +
      'ensure oxmysql\nensure msk_core\n'.repeat(20) +
      'Source https://github.com/MSK-Scripts/msk_core and issues https://github.com/MSK-Scripts/msk_core/issues'
    expect(isLinkSpam(text)).toBe(false)
    expect(checkContent(text)).toEqual({ ok: true })
  })

  it('keeps two bare links', () => {
    expect(isLinkSpam('https://a.example https://b.example')).toBe(false)
  })
})

describe('DuplicateTracker', () => {
  it('flags the same content within the window and forgets it after', () => {
    const tracker = new DuplicateTracker(1_000)
    expect(tracker.isDuplicate('hello', 0)).toBe(false)
    tracker.record('hello', 0)
    expect(tracker.isDuplicate('hello', 500)).toBe(true)
    expect(tracker.isDuplicate('hello world', 500)).toBe(false)
    expect(tracker.isDuplicate('hello', 1_000)).toBe(false)
  })

  it('drops the oldest entries beyond its size', () => {
    const tracker = new DuplicateTracker(60_000, 2)
    tracker.record('a', 0)
    tracker.record('b', 1)
    tracker.record('c', 2)
    expect(tracker.isDuplicate('a', 3)).toBe(false)
    expect(tracker.isDuplicate('b', 3)).toBe(true)
    expect(tracker.isDuplicate('c', 3)).toBe(true)
  })
})
