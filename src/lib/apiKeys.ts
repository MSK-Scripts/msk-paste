import { randomBytes, scrypt } from 'crypto'
import { execute, queryOne } from './db'

/**
 * API keys for creating pastes from scripts. Only the operator issues them,
 * with scripts/api-key.sh on the server (help, list, create, revoke, delete).
 *
 * The table holds a scrypt hash of a key, never the key. A key is 32 random
 * bytes, so a fast hash would do; scrypt is the slower, password-grade choice
 * and keeps a leaked table useless even against a weaker key. Its cost is
 * bounded: a key that does not have the exact format is turned down before
 * hashing, and src/lib/spamGuard.ts stops an address after a few wrong keys.
 * The salt is fixed per app, because a key is looked up by its hash.
 */

export const API_KEY_PREFIX = 'mskp_'

/** `mskp_` and 32 random bytes in base64url. */
export const API_KEY_FORMAT = /^mskp_[A-Za-z0-9_-]{43}$/

/** Characters of the key shown in listings, to tell keys apart. */
const SHOWN_CHARS = 8

const KEY_SALT = 'msk-paste/api-key/v1'

/** Node's scrypt defaults, written out: 16 MB and a few milliseconds per hash. */
const SCRYPT_PARAMS = { N: 2 ** 14, r: 8, p: 1 }

export interface ApiKeyRow {
  id:           number
  key_prefix:   string
  label:        string
  created_at:   Date
  last_used_at: Date | null
  revoked_at:   Date | null
}

/** The stored form of a key: scrypt, 32 bytes, as hex. Runs off the main thread. */
export function hashApiKey(key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(key, KEY_SALT, 32, SCRYPT_PARAMS, (err, derived) => (err ? reject(err) : resolve(derived.toString('hex'))))
  })
}

/** A new key and what is stored of it. */
export async function generateApiKey(): Promise<{ key: string; prefix: string; hash: string }> {
  const key = API_KEY_PREFIX + randomBytes(32).toString('base64url')
  return { key, prefix: key.slice(0, API_KEY_PREFIX.length + SHOWN_CHARS), hash: await hashApiKey(key) }
}

/**
 * The key from `Authorization: Bearer <key>`, or null when the request
 * carries none. A header that is present but not a well-formed key is
 * returned as is, so it fails as a wrong key instead of falling back to the
 * form's checks.
 */
export function bearerKey(headers: { get(name: string): string | null }): string | null {
  const header = headers.get('authorization')
  if (!header) return null
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim())
  return match ? match[1]! : header
}

/** The active (not revoked) key a request presents, or null. Marks it as used. */
export async function findActiveApiKey(key: string): Promise<ApiKeyRow | null> {
  if (!API_KEY_FORMAT.test(key)) return null
  const row = await queryOne<ApiKeyRow>(
    `SELECT id, key_prefix, label, created_at, last_used_at, revoked_at
       FROM api_keys
      WHERE key_hash = ? AND revoked_at IS NULL`,
    [await hashApiKey(key)],
  )
  if (!row) return null
  await execute('UPDATE api_keys SET last_used_at = NOW() WHERE id = ?', [row.id])
  return row
}
