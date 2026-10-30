'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Copy } from '@/components/icons'

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
        className={className ?? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-small rounded-md bg-muted hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors'}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
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
