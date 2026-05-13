import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PasswordPrompt } from '@/components/PasswordPrompt'
import { StatusPanel } from '@/components/StatusPanel'
import { getPasteRow, isPasteExpired, pasteHasPassword } from '@/lib/paste'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Standalone password page (used by deep links / `?` redirects).
 * When a paste happens to have no password set, we just redirect back
 * to the main view.
 */
export default async function PasswordPage({ params }: PageProps) {
  const { id } = await params

  const row = await getPasteRow(id)
  if (!row) {
    return (
      <Page><StatusPanel variant="notFound" /></Page>
    )
  }

  if (isPasteExpired(row)) {
    return (
      <Page><StatusPanel variant="expired" /></Page>
    )
  }

  if (!pasteHasPassword(row)) {
    redirect(`/${encodeURIComponent(row.paste_id)}`)
  }

  const origin = await getOrigin()

  return (
    <Page>
      <PasswordPrompt pasteId={row.paste_id} origin={origin} />
    </Page>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 px-6 py-16">
        <div className="max-w-md mx-auto">{children}</div>
      </div>
      <Footer />
    </main>
  )
}

async function getOrigin(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const h     = await headers()
  const host  = h.get('host') ?? 'localhost:3012'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}
