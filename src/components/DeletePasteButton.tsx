'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface DeletePasteButtonProps {
  pasteId: string
}

export function DeletePasteButton({ pasteId }: DeletePasteButtonProps) {
  const t       = useTranslations('deletePaste')
  const tView   = useTranslations('viewPaste')
  const tCommon = useTranslations('common')
  const router  = useRouter()

  const [open,       setOpen]       = useState(false)
  const [token,      setToken]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [done,       setDone]       = useState(false)

  async function submit() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/pastes/${encodeURIComponent(pasteId)}?token=${encodeURIComponent(token.trim())}`,
        { method: 'DELETE' },
      )
      if (!res.ok) {
        setError(t('errorInvalidToken'))
        return
      }
      setDone(true)
      window.setTimeout(() => router.push('/'), 1500)
    } catch {
      setError(t('errorNetwork'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-msk-danger/80 hover:text-msk-danger transition-colors"
      >
        {tView('deletePaste')}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-msk-surface border border-msk-border rounded-xl p-6 animate-slide-up"
          >
            {done ? (
              <div className="text-center py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-msk-accent/15 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-msk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-heading text-lg text-msk-text">{t('successTitle')}</h2>
                <p className="text-sm text-msk-muted mt-1">{t('successText')}</p>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-lg text-msk-text mb-4">{t('title')}</h2>
                <label className="block text-sm text-msk-muted mb-2">{t('tokenLabel')}</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t('tokenPlaceholder')}
                  disabled={submitting}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-msk-bg border border-msk-border rounded-lg text-msk-text placeholder:text-msk-dim focus:border-msk-accent focus:outline-none font-mono text-sm disabled:opacity-50"
                />
                {error && (
                  <p className="mt-2 text-sm text-msk-danger">{error}</p>
                )}
                <div className="flex items-center justify-end gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 text-sm text-msk-muted hover:text-msk-text transition-colors"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || token.trim().length === 0}
                    className="px-4 py-2 text-sm bg-msk-danger/90 hover:bg-msk-danger disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {submitting ? t('submitting') : t('submit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
