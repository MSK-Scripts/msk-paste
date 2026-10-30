'use client'

import { useCallback, useMemo, useState, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import type { ApiError, CreatePasteResponse, ExpiresIn } from '@/types'
import { SUPPORTED_LANGUAGES } from '@/lib/languages'
import { PasteResult } from './PasteResult'
import { TurnstileWidget } from './TurnstileWidget'
import { ArrowRight, CaretRight, CircleNotch, Eye, EyeSlash } from '@/components/icons'

const MAX_BYTES = 1_048_576 // 1 MB (kept in sync with .env)
const EXPIRES_IN_OPTIONS: ExpiresIn[] = ['10min', '1h', '1d', '1w', '1mo', '1y']
const DEFAULT_EXPIRES: ExpiresIn = '1w'

/** Must match TURNSTILE_ACTION in src/lib/turnstile.ts. */
const TURNSTILE_ACTION = 'create-paste'

/** Spam guard codes (src/lib/spamGuard.ts) and their message keys. */
const GUARD_MESSAGES: Record<string, string> = {
  'origin':              'rejected',
  'rejected':            'rejected',
  'api-key-required':    'rejected',
  'stamp-invalid':       'reload',
  'stamp-expired':       'reload',
  'too-fast':            'tooFast',
  'links':               'links',
  'blob':                'blob',
  'duplicate':           'duplicate',
  'rate-limit':          'rateLimit',
  'daily-limit':         'dailyLimit',
  'captcha':             'captcha',
  'captcha-unavailable': 'captchaUnavailable',
}

/** After these the token may be spent, so the widget gets a fresh one. */
const RENEW_CAPTCHA = new Set(['captcha', 'captcha-unavailable'])

export function CreatePasteForm({
  siteKey,
  formStamp,
}: {
  /** Turnstile site key, null where no captcha is configured (development). */
  siteKey:   string | null
  /** Signed render time, see src/lib/formStamp.ts. */
  formStamp: string
}) {
  const t       = useTranslations('createForm')
  const tSpam   = useTranslations('createForm.spam')
  const tCommon = useTranslations('common')
  const tl      = useTranslations('languages')

  // ─── State ──────────────────────────────────────────────────────
  const [content,       setContent]       = useState('')
  const [title,         setTitle]         = useState('')
  const [language,      setLanguage]      = useState<string>('plaintext')
  const [expiresIn,     setExpiresIn]     = useState<ExpiresIn>(DEFAULT_EXPIRES)
  const [password,      setPassword]      = useState('')
  const [burnAfterRead, setBurnAfterRead] = useState(false)
  const [customId,      setCustomId]      = useState('')
  const [website,       setWebsite]       = useState('')

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey,   setCaptchaKey]   = useState(0)
  const onCaptchaToken = useCallback((token: string | null) => setCaptchaToken(token), [])

  function renewCaptcha() {
    setCaptchaToken(null)
    setCaptchaKey((k) => k + 1)
  }

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
          website,
          formStamp,
          turnstileToken: captchaToken ?? undefined,
        }),
      })

      const data = await res.json() as CreatePasteResponse | ApiError

      if (!res.ok) {
        const err = data as ApiError
        const key = err.code ? GUARD_MESSAGES[err.code] : undefined
        setError(key ? tSpam(key) : err.error)
        if (err.details) setFieldErrors(err.details)
        if (res.status >= 500 || (err.code && RENEW_CAPTCHA.has(err.code))) renewCaptcha()
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
    // The last token was spent on the paste just created.
    renewCaptcha()
  }

  if (result) {
    return <PasteResult result={result} onReset={handleReset} />
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 animate-fade-in">

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-small font-medium text-foreground mb-2">
          {t('titleLabel')}{' '}
          <span className="text-muted-foreground font-normal">({tCommon('optional')})</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          maxLength={100}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-card border-[1.5px] border-input rounded-md text-foreground placeholder:text-muted-foreground focus-visible:border-primary transition-colors disabled:opacity-50"
        />
        {fieldErrors.title && (
          <p className="mt-1.5 text-small text-danger">{fieldErrors.title.join(', ')}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="content" className="block text-small font-medium text-foreground">
            {t('contentLabel')}
          </label>
          <span className={`text-small font-mono ${usedBytes > MAX_BYTES ? 'text-danger' : 'text-muted-foreground'}`}>
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
          className="w-full px-4 py-3 bg-card border-[1.5px] border-input rounded-md text-foreground placeholder:text-muted-foreground focus-visible:border-primary transition-colors disabled:opacity-50 font-mono text-small leading-relaxed resize-y"
        />
        {fieldErrors.content && (
          <p className="mt-1.5 text-small text-danger">{fieldErrors.content.join(', ')}</p>
        )}
      </div>

      {/* Language + Expiration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="language" className="block text-small font-medium text-foreground mb-2">
            {t('languageLabel')}
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-card border-[1.5px] border-input rounded-md text-foreground focus-visible:border-primary transition-colors disabled:opacity-50"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{tl(lang)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="expiresIn" className="block text-small font-medium text-foreground mb-2">
            {t('expirationLabel')}
          </label>
          <select
            id="expiresIn"
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value as ExpiresIn)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-card border-[1.5px] border-input rounded-md text-foreground focus-visible:border-primary transition-colors disabled:opacity-50"
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
        className="text-small text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
      >
        <CaretRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
        {t('advancedToggle')}
      </button>

      {showAdvanced && (
        <div className="animate-fade-in space-y-5 pl-5 border-l-2 border-border">

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-small font-medium text-foreground mb-2">
              {t('passwordLabel')}{' '}
              <span className="text-muted-foreground font-normal">({tCommon('optional')})</span>
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
                className="w-full px-4 py-3 pr-12 bg-card border-[1.5px] border-input rounded-md text-foreground placeholder:text-muted-foreground focus-visible:border-primary transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlash className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-small text-danger">{fieldErrors.password.join(', ')}</p>
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
                className="mt-1 accent-primary w-4 h-4 cursor-pointer"
              />
              <span>
                <span className="block text-small font-medium text-foreground">{t('burnLabel')}</span>
                <span className="block text-small text-muted-foreground mt-0.5">{t('burnHint')}</span>
              </span>
            </label>
          </div>

          {/* Custom ID */}
          <div>
            <label htmlFor="customId" className="block text-small font-medium text-foreground mb-2">
              {t('customIdLabel')}{' '}
              <span className="text-muted-foreground font-normal">({tCommon('optional')})</span>
            </label>
            <div className="flex items-stretch">
              <span className="px-3 inline-flex items-center bg-muted border border-r-0 border-input rounded-l-md text-small text-muted-foreground font-mono">
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
                className="flex-1 px-4 py-3 bg-card border-[1.5px] border-input rounded-r-md text-foreground placeholder:text-muted-foreground focus-visible:border-primary transition-colors disabled:opacity-50 font-mono text-small"
              />
            </div>
            <p className="mt-1.5 text-small text-muted-foreground">{t('customIdHint')}</p>
            {fieldErrors.customId && (
              <p className="mt-1.5 text-small text-danger">{fieldErrors.customId.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* A field people never see (off-screen, out of the tab order); bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {siteKey && (
        <TurnstileWidget
          key={captchaKey}
          siteKey={siteKey}
          action={TURNSTILE_ACTION}
          onToken={onCaptchaToken}
        />
      )}

      {error && (
        <div role="alert" className="px-4 py-3 bg-danger/8 border border-danger/40 rounded-lg text-small text-danger animate-fade-in">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !content.trim() || usedBytes > MAX_BYTES || (siteKey !== null && !captchaToken)}
        className="w-full px-6 py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <CircleNotch className="w-4 h-4 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          <>
            {t('submit')}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  )
}
