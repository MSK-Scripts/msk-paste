import { NextRequest, NextResponse } from 'next/server'
import { jsonError, parseJsonBody, zodToApiError } from '@/lib/apiHelpers'
import { verifyPasswordSchema } from '@/lib/validation'
import {
  consumeView,
  getPasteRow,
  isPasteExpired,
  pasteHasPassword,
  toPublicPaste,
  verifyPastePassword,
} from '@/lib/paste'
import { renderHighlightedHtml } from '@/lib/highlight'
import { ZodError } from 'zod'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/pastes/:id/verify
 * Verifies the password and returns the content + highlighted HTML on success.
 *
 * Returns the *same* shape regardless of whether the paste was password-
 * protected so the client can show the unlocked view inline.
 */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params

  const parsed = await parseJsonBody(req)
  if (!parsed.ok) return parsed.response

  let validated
  try {
    validated = verifyPasswordSchema.parse(parsed.data)
  } catch (err) {
    if (err instanceof ZodError) return zodToApiError(err)
    return jsonError('Invalid request body', 400)
  }

  const row = await getPasteRow(id)
  if (!row) return jsonError('Paste not found', 404)

  if (isPasteExpired(row)) {
    return jsonError('Paste has expired', 410)
  }

  if (pasteHasPassword(row)) {
    const match = await verifyPastePassword(row, validated.password)
    if (!match) {
      return jsonError('Invalid password', 401)
    }
  }

  const ok = await consumeView(row)
  if (!ok) return jsonError('Paste was already viewed', 410)

  const publicPaste = toPublicPaste(row)
  if (!row.burn_after_read) publicPaste.viewCount = row.view_count + 1

  const highlightedHtml = await renderHighlightedHtml(row.content, row.language)

  return NextResponse.json({
    paste: publicPaste,
    highlightedHtml,
  })
}
