import { createHash } from 'crypto'

/**
 * Content checks against the spam MSK Paste actually receives. They look at
 * what arrives, so they apply to the form and to API keys alike.
 *
 * Measured on the production data in October 2026: 95 % of all pastes were
 * ~0.5 MB blocks of base64-like text from one address, i.e. the service was
 * used as free file storage. The rest was SEO and comment spam built around
 * links.
 */

export type ContentVerdict =
  | { ok: true }
  | { ok: false; reason: 'blob' | 'links' }

/** Characters of base64, base64url and hex encodings. */
const ENCODED_CHAR = /[A-Za-z0-9+/=_-]/

/** An unbroken run this long is an encoded file, not text a person reads. */
export const MAX_ENCODED_RUN = 16 * 1024

/** From this size, a paste made almost only of encoded lines is a file too. */
export const WRAPPED_BLOB_MIN_BYTES = 64 * 1024

/** Length of the longest run of encoding characters without a break. */
export function longestEncodedRun(content: string): number {
  let longest = 0
  let current = 0
  for (const char of content) {
    if (ENCODED_CHAR.test(char)) {
      current++
      if (current > longest) longest = current
    } else {
      current = 0
    }
  }
  return longest
}

/**
 * True for an encoded file: one long unbroken run, or (wrapped at 64 or 76
 * columns) a large paste with almost no whitespace besides line breaks and
 * almost nothing but encoding characters. Logs, code and minified files fail
 * the second test through their spaces or their punctuation.
 */
export function looksLikeEncodedBlob(content: string): boolean {
  if (longestEncodedRun(content) >= MAX_ENCODED_RUN) return true
  if (Buffer.byteLength(content, 'utf8') < WRAPPED_BLOB_MIN_BYTES) return false

  let whitespace = 0
  let encoded = 0
  let other = 0
  for (const char of content) {
    if (/\s/.test(char)) whitespace++
    else if (ENCODED_CHAR.test(char)) encoded++
    else other++
  }
  const total = whitespace + encoded + other
  const visible = encoded + other
  return whitespace / total < 0.03 && visible > 0 && encoded / visible >= 0.98
}

const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'\])]+/gi
const MARKUP_LINK = /\[url=|<a\s+href=/gi

/** The http(s) links in a text. */
export function findUrls(content: string): string[] {
  return content.match(URL_PATTERN) ?? []
}

/**
 * True for text that exists to carry links: three or more links that make up
 * at least half of it, or forum markup with three or more links (BBCode
 * `[url=` or `<a href=`), the classic shape of comment spam.
 */
export function isLinkSpam(content: string): boolean {
  const markupLinks = content.match(MARKUP_LINK)?.length ?? 0
  if (markupLinks >= 3) return true

  const urls = findUrls(content)
  if (urls.length < 3) return false
  const urlChars = urls.reduce((sum, url) => sum + url.length, 0)
  const textChars = content.replace(/\s+/g, '').length
  return textChars > 0 && urlChars / textChars >= 0.5
}

/** Runs the content checks in order of cost. */
export function checkContent(content: string): ContentVerdict {
  if (isLinkSpam(content)) return { ok: false, reason: 'links' }
  if (looksLikeEncodedBlob(content)) return { ok: false, reason: 'blob' }
  return { ok: true }
}

// ─── Duplicates ───────────────────────────────────────────────────────

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000
const DUPLICATE_MAX_ENTRIES = 10_000

/**
 * Remembers the hashes of recent contents (in memory, so per process and
 * reset by a restart; enough against a script posting the same block again).
 */
export class DuplicateTracker {
  private seen = new Map<string, number>()

  constructor(
    private readonly windowMs = DUPLICATE_WINDOW_MS,
    private readonly maxEntries = DUPLICATE_MAX_ENTRIES,
  ) {}

  static hash(content: string): string {
    return createHash('sha256').update(content, 'utf8').digest('hex')
  }

  /** True when the same content was recorded within the window. */
  isDuplicate(content: string, now = Date.now()): boolean {
    const at = this.seen.get(DuplicateTracker.hash(content))
    return at !== undefined && now - at < this.windowMs
  }

  /** Records a content that was accepted. */
  record(content: string, now = Date.now()): void {
    const key = DuplicateTracker.hash(content)
    this.seen.delete(key)
    this.seen.set(key, now)
    // Map keeps insertion order: the first entries are the oldest.
    for (const [oldKey, at] of this.seen) {
      if (this.seen.size <= this.maxEntries && now - at < this.windowMs) break
      this.seen.delete(oldKey)
    }
  }
}
