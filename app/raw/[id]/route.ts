import { NextRequest, NextResponse } from 'next/server'
import {
  consumeView,
  getPasteRow,
  isPasteExpired,
  pasteHasPassword,
} from '@/lib/paste'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /raw/:id
 * Raw text response. Returns 403 for password-protected pastes —
 * the client should use the API or visit the HTML page first.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params

  const row = await getPasteRow(id)
  if (!row) {
    return new NextResponse('Paste not found', { status: 404 })
  }

  if (isPasteExpired(row)) {
    return new NextResponse('Paste has expired', { status: 410 })
  }

  if (pasteHasPassword(row)) {
    return new NextResponse('Password required', { status: 403 })
  }

  const ok = await consumeView(row)
  if (!ok) {
    return new NextResponse('Paste was already viewed', { status: 410 })
  }

  return new NextResponse(row.content, {
    status: 200,
    headers: {
      'Content-Type':           'text/plain; charset=utf-8',
      'Cache-Control':          'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
