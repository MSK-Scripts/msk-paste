import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { execute, queryOne } from './db'
import { generatePasteId, isValidCustomId } from './shortcode'
import { isReservedId } from './reserved'
import { expiresInToMs, type ExpiresInLiteral } from './validation'
import type { PasteRow, PublicPaste } from '@/types'

const BCRYPT_COST = 12
const MAX_ID_GENERATION_ATTEMPTS = 8

// ─── Insert ───────────────────────────────────────────────────────────

export interface CreatePasteParams {
  content:        string
  title:          string | null
  language:       string
  expiresIn:      ExpiresInLiteral
  password:       string | null
  burnAfterRead:  boolean
  customId:       string | null
  ipHash:         Buffer
}

export interface CreatedPaste {
  pasteId:        string
  deleteToken:    string
  expiresAt:      Date
  hasPassword:    boolean
  burnAfterRead:  boolean
}

/**
 * Creates a new paste. Throws on conflicting custom ID, reserved ID,
 * or if a random ID could not be generated after several attempts.
 */
export async function createPaste(params: CreatePasteParams): Promise<CreatedPaste> {
  let pasteId: string

  if (params.customId) {
    const trimmed = params.customId.trim()

    if (!isValidCustomId(trimmed)) {
      throw new PasteError('INVALID_CUSTOM_ID', 'Custom ID has an invalid format')
    }
    if (isReservedId(trimmed)) {
      throw new PasteError('RESERVED_ID', 'This ID is reserved')
    }

    const existing = await queryOne<{ paste_id: string }>(
      'SELECT paste_id FROM pastes WHERE paste_id = ?',
      [trimmed],
    )
    if (existing) {
      throw new PasteError('ID_CONFLICT', 'This ID is already in use')
    }

    pasteId = trimmed
  } else {
    pasteId = await generateUniquePasteId()
  }

  const expiresAt   = new Date(Date.now() + expiresInToMs(params.expiresIn))
  const deleteToken = `dk_${randomBytes(32).toString('hex')}`
  const sizeBytes   = Buffer.byteLength(params.content, 'utf8')

  const passwordHash = params.password
    ? await bcrypt.hash(params.password, BCRYPT_COST)
    : null

  await execute(
    `INSERT INTO pastes (
       paste_id, title, content, language,
       password_hash, expires_at, burn_after_read,
       delete_token, size_bytes, created_ip_hash
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pasteId,
      params.title,
      params.content,
      params.language,
      passwordHash,
      expiresAt,
      params.burnAfterRead ? 1 : 0,
      deleteToken,
      sizeBytes,
      params.ipHash,
    ],
  )

  return {
    pasteId,
    deleteToken,
    expiresAt,
    hasPassword:   passwordHash !== null,
    burnAfterRead: params.burnAfterRead,
  }
}

async function generateUniquePasteId(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ID_GENERATION_ATTEMPTS; attempt++) {
    const candidate = generatePasteId()
    if (isReservedId(candidate)) continue

    const existing = await queryOne<{ paste_id: string }>(
      'SELECT paste_id FROM pastes WHERE paste_id = ?',
      [candidate],
    )
    if (!existing) return candidate
  }
  throw new PasteError(
    'ID_GENERATION_FAILED',
    'Could not generate a unique paste ID — try again',
  )
}

// ─── Read ─────────────────────────────────────────────────────────────

export async function getPasteRow(pasteId: string): Promise<PasteRow | null> {
  return queryOne<PasteRow>(
    'SELECT * FROM pastes WHERE paste_id = ?',
    [pasteId],
  )
}

export function isPasteExpired(row: PasteRow): boolean {
  return row.expires_at.getTime() <= Date.now()
}

export function pasteHasPassword(row: PasteRow): boolean {
  return row.password_hash !== null && row.password_hash.length > 0
}

export async function verifyPastePassword(
  row:      PasteRow,
  password: string,
): Promise<boolean> {
  if (!row.password_hash) return false
  return bcrypt.compare(password, row.password_hash)
}

/**
 * Increments the view counter and (if applicable) deletes a
 * burn-after-read paste in a single atomic step. Returns true if
 * the caller may show the content.
 *
 * For burn-after-read pastes only the FIRST caller wins — subsequent
 * callers see "burned".
 */
export async function consumeView(row: PasteRow): Promise<boolean> {
  if (row.burn_after_read) {
    // Conditional delete: only succeeds if the paste is still there.
    const result = await execute(
      'DELETE FROM pastes WHERE paste_id = ?',
      [row.paste_id],
    )
    return result.affectedRows > 0
  }

  // Normal paste — just bump the counter.
  await execute(
    'UPDATE pastes SET view_count = view_count + 1 WHERE paste_id = ?',
    [row.paste_id],
  )
  return true
}

/**
 * Converts a DB row into the public representation (no secrets).
 */
export function toPublicPaste(row: PasteRow): PublicPaste {
  return {
    pasteId:       row.paste_id,
    title:         row.title,
    content:       row.content,
    language:      row.language,
    createdAt:     row.created_at.toISOString(),
    expiresAt:     row.expires_at.toISOString(),
    viewCount:     row.view_count,
    burnAfterRead: row.burn_after_read === 1,
    sizeBytes:     row.size_bytes,
  }
}

// ─── Delete ───────────────────────────────────────────────────────────

export async function deletePasteWithToken(
  pasteId:     string,
  deleteToken: string,
): Promise<boolean> {
  const result = await execute(
    'DELETE FROM pastes WHERE paste_id = ? AND delete_token = ?',
    [pasteId, deleteToken],
  )
  return result.affectedRows > 0
}

// ─── Error type ───────────────────────────────────────────────────────

export class PasteError extends Error {
  constructor(
    public code:    'INVALID_CUSTOM_ID' | 'RESERVED_ID' | 'ID_CONFLICT' | 'ID_GENERATION_FAILED',
    message: string,
  ) {
    super(message)
    this.name = 'PasteError'
  }
}
