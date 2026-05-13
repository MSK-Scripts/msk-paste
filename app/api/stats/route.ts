import { NextResponse } from 'next/server'
import { getGlobalStats } from '@/lib/stats'

/**
 * GET /api/stats
 * Returns global aggregate statistics (no per-user data).
 */
export async function GET() {
  try {
    const stats = await getGlobalStats()
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    console.error('Failed to load stats:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
