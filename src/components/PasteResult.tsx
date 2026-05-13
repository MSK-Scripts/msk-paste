'use client'

import { useTranslations } from 'next-intl'
import type { CreatePasteResponse } from '@/types'
import { CopyButton } from './CopyButton'

interface PasteResultProps {
  result:  CreatePasteResponse
  onReset: () => void
}

export function PasteResult({ result, onReset }: PasteResultProps) {
  const t = useTranslations('result')

  return (
    <div className="w-full space-y-5 animate-fade-in">
      <div className="px-4 py-3 bg-msk-accent/10 border border-msk-accent/30 rounded-lg flex items-center gap-3">
        <svg className="w-5 h-5 text-msk-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium text-msk-text">{t('title')}</span>
      </div>

      <Field label={t('urlLabel')} value={result.url} variant="primary" />
      <Field label={t('rawUrlLabel')} value={result.rawUrl} />
      <Field label={t('deleteTokenLabel')} value={result.deleteToken} hint={t('deleteTokenHint')} />

      <button
        type="button"
        onClick={onReset}
        className="w-full px-4 py-3 bg-msk-surface hover:bg-msk-surface2 border border-msk-border text-msk-text rounded-lg text-sm font-medium transition-colors"
      >
        {t('createAnother')}
      </button>
    </div>
  )
}

interface FieldProps {
  label:    string
  value:    string
  hint?:    string
  variant?: 'primary' | 'default'
}

function Field({ label, value, hint, variant = 'default' }: FieldProps) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-msk-muted mb-1.5">
        {label}
      </label>
      <div className={`flex items-stretch ${variant === 'primary' ? 'border-msk-accent/40' : 'border-msk-border'} border rounded-lg overflow-hidden`}>
        <input
          type="text"
          value={value}
          readOnly
          className="flex-1 px-4 py-2.5 bg-msk-surface text-sm text-msk-text font-mono outline-none truncate"
        />
        <CopyButton
          value={value}
          className="px-4 bg-msk-surface2 hover:bg-msk-surface border-l border-msk-border text-msk-muted hover:text-msk-text text-sm font-medium transition-colors flex items-center justify-center"
        />
      </div>
      {hint && (
        <p className="mt-1.5 text-xs text-msk-muted">{hint}</p>
      )}
    </div>
  )
}
