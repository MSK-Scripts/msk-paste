'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface CopyButtonProps {
  value:     string
  className?: string
  label?:     string
  iconOnly?:  boolean
}

/**
 * Generic copy-to-clipboard button with toast feedback.
 */
export function CopyButton({ value, className, label, iconOnly }: CopyButtonProps) {
  const t = useTranslations('common')
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Fallback: select-all/copy is best-effort.
    }
  }

  const text = label ?? t('copy')

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={className ?? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-msk-surface2 hover:bg-msk-surface border border-msk-border text-msk-muted hover:text-msk-text transition-colors'}
      >
        {copied ? (
          <svg className="w-3.5 h-3.5 text-msk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
        {!iconOnly && (copied ? t('copied') : text)}
      </button>

      {copied && (
        <div className="msk-toast" role="status">
          {t('copied')}
        </div>
      )}
    </>
  )
}
