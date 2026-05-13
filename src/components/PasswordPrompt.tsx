'use client'

import { useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import type { PublicPaste } from '@/types'
import { PasteView } from './PasteView'

interface PasswordPromptProps {
  pasteId: string
  origin:  string
}

interface VerifyResponse {
  paste:           PublicPaste
  highlightedHtml: string
}

/**
 * Renders either the password prompt or — after a successful unlock —
 * the paste content inline. The verify endpoint already returns the
 * highlighted HTML so we never re-fetch the paste.
 */
export function PasswordPrompt({ pasteId, origin }: PasswordPromptProps) {
  const t = useTranslations('password')

  const [password,   setPassword]   = useState('')
  const [show,       setShow]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [unlocked,   setUnlocked]   = useState<VerifyResponse | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return

    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch(`/api/pastes/${encodeURIComponent(pasteId)}/verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })

      if (res.status === 401) {
        setError(t('wrong'))
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null) as { error?: string } | null
        setError(data?.error ?? t('wrong'))
        return
      }

      const data = await res.json() as VerifyResponse
      setUnlocked(data)
    } catch {
      setError(t('wrong'))
    } finally {
      setSubmitting(false)
    }
  }

  if (unlocked) {
    return (
      <PasteView
        paste={unlocked.paste}
        highlightedHtml={unlocked.highlightedHtml}
        origin={origin}
      />
    )
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md mx-auto space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex w-14 h-14 rounded-full bg-msk-accent/10 items-center justify-center mb-4">
          <svg className="w-7 h-7 text-msk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl text-msk-text">{t('title')}</h1>
        <p className="text-sm text-msk-muted mt-1">{t('subtitle')}</p>
      </div>

      <div>
        <label htmlFor="pw" className="block text-sm font-medium text-msk-text mb-2">
          {t('label')}
        </label>
        <div className="relative">
          <input
            id="pw"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            autoFocus
            required
            className="w-full px-4 py-3 pr-12 bg-msk-surface border border-msk-border rounded-lg text-msk-text focus:border-msk-accent focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-msk-muted hover:text-msk-text transition-colors"
            tabIndex={-1}
            aria-label={show ? t('hidePassword') : t('showPassword')}
          >
            {show ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-msk-danger">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="w-full px-4 py-3 bg-msk-accent hover:bg-msk-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
