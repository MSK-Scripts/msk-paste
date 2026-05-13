import { NextRequest, NextResponse } from 'next/server'
import { jsonError } from '@/lib/apiHelpers'
import {
  consumeView,
  deletePasteWithToken,
  getPasteRow,
  isPasteExpired,
  pasteHasPassword,
  toPublicPaste,
} from '@/lib/paste'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/pastes/:id
 * Returns the paste content or 403 if a password is required.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params

  const row = await getPasteRow(id)
  if (!row) return jsonError('Paste not found', 404)

  if (isPasteExpired(row)) {
    return jsonError('Paste has expired', 410)
  }

  if (pasteHasPassword(row)) {
    return NextResponse.json({ passwordRequired: true }, { status: 403 })
  }

  // Burn-after-read pastes need to be consumed atomically.
  const ok = await consumeView(row)
  if (!ok) return jsonError('Paste was already viewed', 410)

  // After consumeView the counter has been incremented. Reflect that in the
  // response without an extra round-trip.
  const publicPaste = toPublicPaste(row)
  if (!row.burn_after_read) {
    publicPaste.viewCount = row.view_count + 1
  }

  return NextResponse.json(publicPaste)
}

/**
 * DELETE /api/pastes/:id?token=<deleteToken>
 */
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { id }      = await ctx.params
  const token       = req.nextUrl.searchParams.get('token')

  if (!token) {
    return jsonError('Missing delete token', 400)
  }

  const ok = await deletePasteWithToken(id, token)
  if (!ok) return jsonError('Paste not found or invalid token', 404)

  return new NextResponse(null, { status: 204 })
}
