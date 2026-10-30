import { headers } from 'next/headers'
import { SiteFrame } from '@/components/site/SiteFrame'
import { PasteView } from '@/components/PasteView'
import { PasswordPrompt } from '@/components/PasswordPrompt'
import { StatusPanel } from '@/components/StatusPanel'
import {
  consumeView,
  getPasteRow,
  isPasteExpired,
  pasteHasPassword,
  toPublicPaste,
} from '@/lib/paste'
import { renderHighlightedHtml } from '@/lib/highlight'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * GET /[id] — main paste view page.
 *
 * Server-rendered: looks up the paste, handles expired / burn / password
 * states and renders the highlighted view on success.
 */
export default async function PastePage({ params }: PageProps) {
  const { id } = await params

  const row = await getPasteRow(id)
  if (!row) {
    return (
      <Page>
        <StatusPanel variant="notFound" />
      </Page>
    )
  }

  if (isPasteExpired(row)) {
    return (
      <Page>
        <StatusPanel variant="expired" />
      </Page>
    )
  }

  const origin = await getOrigin()

  if (pasteHasPassword(row)) {
    return (
      <Page>
        <PasswordPrompt pasteId={row.paste_id} origin={origin} />
      </Page>
    )
  }

  // Consume the view (deletes burn-after-read pastes atomically).
  const ok = await consumeView(row)
  if (!ok) {
    return (
      <Page>
        <StatusPanel variant="burned" />
      </Page>
    )
  }

  const publicPaste = toPublicPaste(row)
  if (!row.burn_after_read) publicPaste.viewCount = row.view_count + 1

  const highlightedHtml = await renderHighlightedHtml(row.content, row.language)

  return (
    <Page wide>
      <PasteView
        paste={publicPaste}
        highlightedHtml={highlightedHtml}
        origin={origin}
      />
    </Page>
  )
}

function Page({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <SiteFrame>
      <div className={`${wide ? 'container-page' : 'tool-column'} py-[var(--space-section)]`}>
        {children}
      </div>
    </SiteFrame>
  )
}

async function getOrigin(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const h     = await headers()
  const host  = h.get('host')         ?? 'localhost:3012'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return {
    title: `Paste ${id}`,
  }
}
