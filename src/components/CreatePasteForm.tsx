'use client'

import { useMemo, useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import type { ApiError, CreatePasteResponse, ExpiresIn } from '@/types'
import { SUPPORTED_LANGUAGES } from '@/lib/languages'
import { PasteResult } from './PasteResult'

const MAX_BYTES = 1_048_576 // 1 MB (kept in sync with .env)
const EXPIRES_IN_OPTIONS: ExpiresIn[] = ['10min', '1h', '1d', '1w', '1mo', '1y']
const DEFAULT_EXPIRES: ExpiresIn = '1w'

export function CreatePasteForm() {
  const t  = useTranslations('createForm')
  const tl = useTranslations('languages')

  // ─── State ──────────────────────────────────────────────────────
  const [content,       setContent]       = useState('')
  const [title,         setTitle]         = useState('')
  const [language,      setLanguage]      = useState<string>('plaintext')
  const [expiresIn,     setExpiresIn]     = useState<ExpiresIn>(DEFAULT_EXPIRES)
  const [password,      setPassword]      = useState('')
  const [burnAfterRead, setBurnAfterRead] = useState(false)
  const [customId,      setCustomId]      = useState('')

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [result,      setResult]      = useState<CreatePasteResponse | null>(null)

  const usedBytes = useMemo(
    () => (typeof window === 'undefined' ? content.length : new Blob([content]).size),
    [content],
  )

  // ─── Submit ─────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsLoading(true)

    try {
      const res = await fetch('/api/pastes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          content,
          title:         title.trim() || undefined,
          language,
          expiresIn,
          password:      password || undefined,
          burnAfterRead,
          customId:      customId.trim() || undefined,
        }),
      })

      const data = await res.json() as CreatePasteResponse | ApiError

      if (!res.ok) {
        const err = data as ApiError
        setError(err.error)
        if (err.details) setFieldErrors(err.details)
        return
      }

      setResult(data as CreatePasteResponse)
    } catch {
      setError(t('networkError'))
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setContent('')
    setTitle('')
    setLanguage('plaintext')
    setExpiresIn(DEFAULT_EXPIRES)
    setPassword('')
    setBurnAfterRead(false)
    setCustomId('')
    setShowAdvanced(false)
    setShowPassword(false)
    setError(null)
    setFieldErrors({})
  }

  if (result) {
    return <PasteResult result={result} onReset={handleReset} />
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 animate-fade-in">

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-msk-text mb-2">
          {t('titleLabel')}{' '}
          <span className="text-msk-muted font-normal">({t('optional' as never) || 'optional'})</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          maxLength={100}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-msk-surface border border-msk-border rounded-lg text-msk-text placeholder:text-msk-dim focus:border-msk-accent focus:outline-none transition-colors disabled:opacity-50"
        />
        {fieldErrors.title && (
          <p className="mt-1.5 text-sm text-msk-danger">{fieldErrors.title.join(', ')}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-msk-text">
            {t('contentLabel')}
          </label>
          <span className={`text-xs font-mono ${usedBytes > MAX_BYTES ? 'text-msk-danger' : 'text-msk-muted'}`}>
            {t('sizeUsed', { bytes: usedBytes, max: MAX_BYTES })}
          </span>
        </div>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('contentPlaceholder')}
          required
          rows={16}
          disabled={isLoading}
          spellCheck={false}
          className="w-full px-4 py-3 bg-msk-surface border border-msk-border rounded-lg text-msk-text placeholder:text-msk-dim focus:border-msk-accent focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm leading-relaxed resize-y"
        />
        {fieldErrors.content && (
          <p className="mt-1.5 text-sm text-msk-danger">{fieldErrors.content.join(', ')}</p>
        )}
      </div>

      {/* Language + Expiration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-msk-text mb-2">
            {t('languageLabel')}
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-msk-surface border border-msk-border rounded-lg text-msk-text focus:border-msk-accent focus:outline-none transition-colors disabled:opacity-50"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{tl(lang)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="expiresIn" className="block text-sm font-medium text-msk-text mb-2">
            {t('expirationLabel')}
          </label>
          <select
            id="expiresIn"
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value as ExpiresIn)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-msk-surface border border-msk-border rounded-lg text-msk-text focus:border-msk-accent focus:outline-none transition-colors disabled:opacity-50"
          >
            {EXPIRES_IN_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{t(`expiration.${opt}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-msk-muted hover:text-msk-accent transition-colors flex items-center gap-1.5"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {t('advancedToggle')}
      </button>

      {showAdvanced && (
        <div className="animate-slide-up space-y-5 pl-5 border-l-2 border-msk-border">

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-msk-text mb-2">
              {t('passwordLabel')}{' '}
              <span className="text-msk-muted font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                minLength={1}
                maxLength={128}
                disabled={isLoading}
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 bg-msk-surface border border-msk-border rounded-lg text-msk-text placeholder:text-msk-dim focus:border-msk-accent focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-msk-muted hover:text-msk-text transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
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
            {fieldErrors.password && (
              <p className="mt-1.5 text-sm text-msk-danger">{fieldErrors.password.join(', ')}</p>
            )}
          </div>

          {/* Burn after read */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={burnAfterRead}
                onChange={(e) => setBurnAfterRead(e.target.checked)}
                disabled={isLoading}
                className="mt-1 accent-msk-accent w-4 h-4 cursor-pointer"
              />
              <span>
                <span className="block text-sm font-medium text-msk-text">{t('burnLabel')}</span>
                <span className="block text-xs text-msk-muted mt-0.5">{t('burnHint')}</span>
              </span>
            </label>
          </div>

          {/* Custom ID */}
          <div>
            <label htmlFor="customId" className="block text-sm font-medium text-msk-text mb-2">
              {t('customIdLabel')}{' '}
              <span className="text-msk-muted font-normal">(optional)</span>
            </label>
            <div className="flex items-stretch">
              <span className="px-3 inline-flex items-center bg-msk-surface2 border border-r-0 border-msk-border rounded-l-lg text-sm text-msk-muted font-mono">
                paste.msk-scripts.de/
              </span>
              <input
                id="customId"
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder={t('customIdPlaceholder')}
                pattern="[a-zA-Z0-9_-]{4,32}"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-msk-surface border border-msk-border rounded-r-lg text-msk-text placeholder:text-msk-dim focus:border-msk-accent focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm"
              />
            </div>
            <p className="mt-1.5 text-xs text-msk-muted">{t('customIdHint')}</p>
            {fieldErrors.customId && (
              <p className="mt-1.5 text-sm text-msk-danger">{fieldErrors.customId.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-msk-danger/10 border border-msk-danger/30 rounded-lg text-sm text-msk-danger animate-fade-in">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !content.trim() || usedBytes > MAX_BYTES}
        className="w-full px-6 py-3.5 bg-msk-accent hover:bg-msk-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {t('submitting')}
          </>
        ) : (
          <>
            {t('submit')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}
