'use client'

import { useTranslations } from 'next-intl'
import type { CreatePasteResponse } from '@/types'
import { CopyButton } from './CopyButton'
import { Check } from '@/components/icons'

interface PasteResultProps {
  result:  CreatePasteResponse
  onReset: () => void
}

export function PasteResult({ result, onReset }: PasteResultProps) {
  const t = useTranslations('result')

  return (
    <div className="w-full space-y-5 animate-fade-in">
      <div className="px-4 py-3 bg-accent-soft border border-primary/40 rounded-lg flex items-center gap-3">
        <Check className="w-5 h-5 text-primary flex-shrink-0" />
        <span className="text-small font-medium text-foreground">{t('title')}</span>
      </div>

      <Field label={t('urlLabel')} value={result.url} variant="primary" />
      <Field label={t('rawUrlLabel')} value={result.rawUrl} />
      <Field label={t('deleteTokenLabel')} value={result.deleteToken} hint={t('deleteTokenHint')} />

      <button
        type="button"
        onClick={onReset}
        className="w-full px-4 py-3 bg-card hover:bg-muted border border-border text-foreground rounded-lg text-small font-medium transition-colors"
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
      <label className="block text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className={`flex items-stretch ${variant === 'primary' ? 'border-primary/40' : 'border-border'} border rounded-lg overflow-hidden`}>
        <input
          type="text"
          value={value}
          readOnly
          className="flex-1 px-4 py-2.5 bg-card text-small text-foreground font-mono outline-none truncate"
        />
        <CopyButton
          value={value}
          className="px-4 bg-muted hover:bg-muted border-l border-border text-muted-foreground hover:text-foreground text-small font-medium transition-colors flex items-center justify-center"
        />
      </div>
      {hint && (
        <p className="mt-1.5 text-small text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
