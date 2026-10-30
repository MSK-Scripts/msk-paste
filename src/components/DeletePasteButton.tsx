'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Check } from '@/components/icons'

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
        className="text-small text-danger/80 hover:text-danger transition-colors"
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
            className="w-full max-w-md bg-card border border-border rounded-xl p-6 animate-fade-in"
          >
            {done ? (
              <div className="text-center py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-lg text-foreground">{t('successTitle')}</h2>
                <p className="text-small text-muted-foreground mt-1">{t('successText')}</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-lg text-foreground mb-4">{t('title')}</h2>
                <label className="block text-small text-muted-foreground mb-2">{t('tokenLabel')}</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t('tokenPlaceholder')}
                  disabled={submitting}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:border-primary font-mono text-small disabled:opacity-50"
                />
                {error && (
                  <p className="mt-2 text-small text-danger">{error}</p>
                )}
                <div className="flex items-center justify-end gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 text-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || token.trim().length === 0}
                    className="px-4 py-2 text-small bg-danger/90 hover:bg-danger disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg font-medium transition-colors"
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
