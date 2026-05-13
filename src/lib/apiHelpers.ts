import { NextResponse } from 'next/server'
import type { ApiError } from '@/types'
import { ZodError } from 'zod'

/**
 * Standardized error response.
 */
export function jsonError(
  message: string,
  status = 400,
  details?: Record<string, string[]>
): NextResponse<ApiError> {
  return NextResponse.json<ApiError>(
    { error: message, ...(details && { details }) },
    { status }
  )
}

/**
 * Converts Zod errors into our ApiError envelope.
 * In Zod 4 the property is named `issues` (not `errors`).
 */
export function zodToApiError(err: ZodError): NextResponse<ApiError> {
  const details: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const field = issue.path.join('.') || '_root'
    if (!details[field]) details[field] = []
    details[field].push(issue.message)
  }
  return jsonError('Validation error', 400, details)
}

/**
 * Parses a JSON request body or returns a 400 error envelope.
 */
export async function parseJsonBody<T = unknown>(
  req: Request
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse<ApiError> }> {
  try {
    const data = (await req.json()) as T
    return { ok: true, data }
  } catch {
    return { ok: false, response: jsonError('Invalid JSON', 400) }
  }
}

/**
 * Builds the public URL for a paste from NEXT_PUBLIC_BASE_URL.
 */
export function buildPasteUrl(pasteId: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3012'
  return `${base.replace(/\/$/, '')}/${pasteId}`
}

/**
 * Builds the raw URL for a paste.
 */
export function buildRawUrl(pasteId: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3012'
  return `${base.replace(/\/$/, '')}/raw/${pasteId}`
}
