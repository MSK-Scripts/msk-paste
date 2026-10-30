import { createHash, randomBytes } from 'crypto'
import { execute, queryOne } from './db'

/**
 * API keys for creating pastes from scripts. Only the operator issues them,
 * with scripts/api-key.sh on the server (help, list, create, revoke, delete). The table holds
 * the SHA-256 of a key, never the key: a key is 32 random bytes, so a fast
 * hash is enough and a leaked table reveals nothing usable.
 */

export const API_KEY_PREFIX = 'mskp_'

/** Characters of the key shown in listings, to tell keys apart. */
const SHOWN_CHARS = 8

export interface ApiKeyRow {
  id:           number
  key_prefix:   string
  label:        string
  created_at:   Date
  last_used_at: Date | null
  revoked_at:   Date | null
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key, 'utf8').digest('hex')
}

/** A new key and what is stored of it. */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = API_KEY_PREFIX + randomBytes(32).toString('base64url')
  return { key, prefix: key.slice(0, API_KEY_PREFIX.length + SHOWN_CHARS), hash: hashApiKey(key) }
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
  if (!key.startsWith(API_KEY_PREFIX) || key.length > 128) return null
  const row = await queryOne<ApiKeyRow>(
    `SELECT id, key_prefix, label, created_at, last_used_at, revoked_at
       FROM api_keys
      WHERE key_hash = ? AND revoked_at IS NULL`,
    [hashApiKey(key)],
  )
  if (!row) return null
  await execute('UPDATE api_keys SET last_used_at = NOW() WHERE id = ?', [row.id])
  return row
}
