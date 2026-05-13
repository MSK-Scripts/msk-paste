import { NextRequest, NextResponse } from 'next/server'
import { jsonError, parseJsonBody, zodToApiError, buildPasteUrl, buildRawUrl } from '@/lib/apiHelpers'
import { createPasteSchema } from '@/lib/validation'
import { createPaste, PasteError } from '@/lib/paste'
import { checkCreateRateLimit, getClientIp, hashIp, hashIpBuffer } from '@/lib/rateLimit'
import { ZodError } from 'zod'
import type { CreatePasteResponse } from '@/types'

const MAX_PASTE_SIZE_BYTES = Number(process.env.MAX_PASTE_SIZE_BYTES ?? 1_048_576)

/**
 * POST /api/pastes
 * Create a new paste.
 */
export async function POST(req: NextRequest) {
  // ─── Rate limit ─────────────────────────────────────────────────
  const ip       = getClientIp(req.headers)
  const ipHashed = hashIp(ip)
  const limit    = checkCreateRateLimit(ipHashed)

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
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
