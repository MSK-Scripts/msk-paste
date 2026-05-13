import { customAlphabet } from 'nanoid'

/**
 * URL-safe alphabet (no ambiguous chars like 0/O, 1/l/I).
 */
const ALPHABET = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'

/**
 * Default paste ID length (8 chars → ~3.5 × 10^13 combinations).
 */
export const DEFAULT_PASTE_ID_LENGTH = Number(process.env.PASTE_ID_LENGTH ?? 8)

/**
 * Generates a random paste ID with the configured length.
 */
export function generatePasteId(length = DEFAULT_PASTE_ID_LENGTH): string {
  return customAlphabet(ALPHABET, length)()
}

/**
 * Custom paste ID format: `[a-zA-Z0-9_-]{4,32}` (length validated separately).
 */
const CUSTOM_ID_REGEX = /^[a-zA-Z0-9_-]+$/

export const CUSTOM_ID_MIN = Number(process.env.PASTE_ID_MIN_CUSTOM ?? 4)
export const CUSTOM_ID_MAX = Number(process.env.PASTE_ID_MAX_CUSTOM ?? 32)

export function isValidCustomId(id: string): boolean {
  if (id.length < CUSTOM_ID_MIN || id.length > CUSTOM_ID_MAX) return false
  return CUSTOM_ID_REGEX.test(id)
}
