'use client'

import { useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import type { PublicPaste } from '@/types'
import { PasteView } from './PasteView'
import { Eye, EyeSlash, LockSimple } from '@/components/icons'

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
        <div className="inline-flex w-14 h-14 rounded-full bg-accent-soft items-center justify-center mb-4">
          <LockSimple className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-display text-2xl text-foreground">{t('title')}</h1>
        <p className="text-small text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <div>
        <label htmlFor="pw" className="block text-small font-medium text-foreground mb-2">
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
            className="w-full px-4 py-3 pr-12 bg-card border-[1.5px] border-input rounded-md text-foreground focus-visible:border-primary transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={show ? t('hidePassword') : t('showPassword')}
          >
            {show ? (
              <EyeSlash className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-small text-danger">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="w-full px-4 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg font-medium transition-colors"
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
