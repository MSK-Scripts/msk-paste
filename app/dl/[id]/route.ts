import { NextRequest, NextResponse } from 'next/server'
import {
  consumeView,
  getPasteRow,
  isPasteExpired,
  pasteHasPassword,
} from '@/lib/paste'
import { extensionFor } from '@/lib/languages'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /dl/:id
 * Forces a file download. Filename comes from the title (if any) or paste ID.
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

  const ext      = extensionFor(row.language)
  const safeBase = sanitizeFilename(row.title || row.paste_id)
  const filename = `${safeBase}.${ext}`

  return new NextResponse(row.content, {
    status: 200,
    headers: {
      'Content-Type':           'application/octet-stream',
      'Content-Disposition':    `attachment; filename="${filename}"`,
      'Cache-Control':          'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

/**
 * Strips path separators and other unsafe characters from a filename.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'paste'
}
