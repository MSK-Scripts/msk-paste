import { z } from 'zod'
import { SUPPORTED_LANGUAGES } from './languages'

const MAX_CONTENT_BYTES = Number(process.env.MAX_PASTE_SIZE_BYTES ?? 1_048_576) // 1 MB

export const EXPIRES_IN_VALUES = ['10min', '1h', '1d', '1w', '1mo', '1y'] as const
export type ExpiresInLiteral = (typeof EXPIRES_IN_VALUES)[number]

/**
 * Maps `expiresIn` to a number of milliseconds.
 */
export function expiresInToMs(value: ExpiresInLiteral): number {
  switch (value) {
    case '10min': return 10 * 60 * 1000
    case '1h':    return     60 * 60 * 1000
    case '1d':    return     24 * 60 * 60 * 1000
    case '1w':    return  7 * 24 * 60 * 60 * 1000
    case '1mo':   return 30 * 24 * 60 * 60 * 1000
    case '1y':    return 365 * 24 * 60 * 60 * 1000
  }
}

/**
 * Schema for POST /api/pastes.
 */
export const createPasteSchema = z.object({
  content: z.string()
    .min(1, { error: 'Content must not be empty' })
    .refine(
      (s) => Buffer.byteLength(s, 'utf8') <= MAX_CONTENT_BYTES,
      { error: `Content exceeds maximum size (${MAX_CONTENT_BYTES} bytes)` }
    ),

  title: z.string()
    .trim()
    .max(100, { error: 'Title must be 100 characters or fewer' })
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),

  language: z.enum(SUPPORTED_LANGUAGES as readonly [string, ...string[]], {
    error: 'Unsupported language',
  }).default('plaintext'),

  expiresIn: z.enum(EXPIRES_IN_VALUES, {
    error: 'Invalid expiration window',
  }),

  password: z.string()
    .min(1, { error: 'Password must not be empty' })
    .max(128, { error: 'Password is too long' })
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),

  burnAfterRead: z.boolean().optional().default(false),

  customId: z.string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
})

export type CreatePasteInput = z.infer<typeof createPasteSchema>

/**
 * Schema for POST /api/pastes/:id/verify.
 */
export const verifyPasswordSchema = z.object({
  password: z.string().min(1, { error: 'Password is required' }),
})

export type VerifyPasswordInput = z.infer<typeof verifyPasswordSchema>
