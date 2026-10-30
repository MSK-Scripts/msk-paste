import { NextRequest, NextResponse } from 'next/server'
import { jsonError, parseJsonBody, zodToApiError, buildPasteUrl, buildRawUrl } from '@/lib/apiHelpers'
import { createPasteSchema } from '@/lib/validation'
import { createPaste, PasteError } from '@/lib/paste'
import { checkCreateRateLimit, getClientIp, hashIp, hashIpBuffer } from '@/lib/rateLimit'
import { bearerKey } from '@/lib/apiKeys'
import { guardCreate, recordAccepted } from '@/lib/spamGuard'
import { ZodError } from 'zod'
import type { ApiError, CreatePasteResponse } from '@/types'

const MAX_PASTE_SIZE_BYTES = Number(process.env.MAX_PASTE_SIZE_BYTES ?? 1_048_576)

/**
 * POST /api/pastes
 * Create a new paste: from the site's form, or from a script with an API key
 * (see src/lib/spamGuard.ts).
 */
export async function POST(req: NextRequest) {
  // ─── Rate limit ─────────────────────────────────────────────────
  // Per address for the form; an API key has a limit of its own.
  const ip       = getClientIp(req.headers)
  const ipHashed = hashIp(ip)
  const limit    = bearerKey(req.headers) === null
    ? checkCreateRateLimit(ipHashed)
    : { allowed: true, resetAt: 0 }

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'rate-limit' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))),
        },
      },
    )
  }

  // ─── Body ───────────────────────────────────────────────────────
  const parsed = await parseJsonBody(req)
  if (!parsed.ok) return parsed.response

  let validated
  try {
    validated = createPasteSchema.parse(parsed.data)
  } catch (err) {
    if (err instanceof ZodError) return zodToApiError(err)
    return jsonError('Invalid request body', 400)
  }

  // Belt-and-braces size check (the Zod refine already rejects oversize content).
  if (Buffer.byteLength(validated.content, 'utf8') > MAX_PASTE_SIZE_BYTES) {
    return jsonError('Content exceeds maximum size', 413)
  }

  // ─── Spam guard ─────────────────────────────────────────────────
  const raw   = (typeof parsed.data === 'object' && parsed.data !== null ? parsed.data : {}) as Record<string, unknown>
  const guard = await guardCreate({
    headers: req.headers,
    content: validated.content,
    proof:   { website: raw.website, formStamp: raw.formStamp, turnstileToken: raw.turnstileToken },
    ip,
    ipHash:  hashIpBuffer(ip),
  })
  if (!guard.ok) {
    return NextResponse.json<ApiError>({ error: guard.message, code: guard.code }, { status: guard.status })
  }

  // ─── Create ─────────────────────────────────────────────────────
  try {
    const created = await createPaste({
      content:        validated.content,
      title:          validated.title,
      language:       validated.language,
      expiresIn:      validated.expiresIn,
      password:       validated.password,
      burnAfterRead:  validated.burnAfterRead,
      customId:       validated.customId,
      ipHash:         hashIpBuffer(ip),
    })
    recordAccepted(validated.content)

    const response: CreatePasteResponse = {
      pasteId:       created.pasteId,
      url:           buildPasteUrl(created.pasteId),
      rawUrl:        buildRawUrl(created.pasteId),
      deleteToken:   created.deleteToken,
      expiresAt:     created.expiresAt.toISOString(),
      hasPassword:   created.hasPassword,
      burnAfterRead: created.burnAfterRead,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (err) {
    if (err instanceof PasteError) {
      const status = err.code === 'ID_CONFLICT' ? 409 : 400
      return jsonError(err.message, status)
    }
    console.error('Failed to create paste:', err)
    return jsonError('Internal server error', 500)
  }
}
