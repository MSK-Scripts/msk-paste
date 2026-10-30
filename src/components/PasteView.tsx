'use client'

import { useState } from 'react'
import { useFormatter, useTranslations } from 'next-intl'
import { CopyButton } from './CopyButton'
import { DeletePasteButton } from './DeletePasteButton'
import type { PublicPaste } from '@/types'
import { Copy, DownloadSimple, Fire } from '@/components/icons'

interface PasteViewProps {
  paste:           PublicPaste
  highlightedHtml: string
  origin:          string
}

/**
 * Renders the highlighted code block + paste metadata + toolbar.
 * The HTML for the code block comes from Shiki on the server and is therefore
 * safe to dangerouslySetInnerHTML — Shiki escapes everything.
 */
export function PasteView({ paste, highlightedHtml, origin }: PasteViewProps) {
  const t      = useTranslations('viewPaste')
  const tlang  = useTranslations('languages')
  const format = useFormatter()

  const [lineNumbers, setLineNumbers] = useState(true)
  const [wordWrap,    setWordWrap]    = useState(false)

  const pasteUrl = `${origin}/${paste.pasteId}`
  const rawUrl   = `${origin}/raw/${paste.pasteId}`
  const dlUrl    = `${origin}/dl/${paste.pasteId}`

  const createdAt = format.dateTime(new Date(paste.createdAt), 'short')
  const expiresAt = format.dateTime(new Date(paste.expiresAt), 'short')

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-foreground break-all">
            {paste.title ?? <span className="font-mono text-muted-foreground">{paste.pasteId}</span>}
          </h1>
          {paste.title && (
            <p className="text-small font-mono text-muted-foreground mt-0.5">{paste.pasteId}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton value={rawUrl} label={t('copyUrl')} />
          <CopyButton value={paste.content} label={t('copyContent')} />
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-small rounded-md bg-muted hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Raw
          </a>
          <a
            href={dlUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-small rounded-md bg-muted hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <DownloadSimple className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-3 bg-card border border-border rounded-lg shadow-[var(--shadow-card)] text-small">
        <Meta label={t('language')} value={tlang(paste.language)} />
        <Meta label={t('size')}     value={t('bytes', { bytes: paste.sizeBytes })} />
        <Meta label={t('createdAt', { date: '' }).replace(/\s+$/, '')} value={createdAt} />
        <Meta label={t('expiresAt', { date: '' }).replace(/\s+$/, '')} value={expiresAt} />
      </div>

      {paste.burnAfterRead && (
        <div className="px-4 py-3 bg-danger/8 border border-danger/40 rounded-lg text-small text-danger flex items-center gap-2">
          <Fire className="w-4 h-4 flex-shrink-0" />
          {t('burnAfterRead')}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-muted border border-border rounded-t-lg text-small text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-mono uppercase tracking-wider">{tlang(paste.language)}</span>
          <span className="text-muted-foreground">·</span>
          <span>{t('views', { count: paste.viewCount })}</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={lineNumbers}
              onChange={(e) => setLineNumbers(e.target.checked)}
              className="accent-primary w-3.5 h-3.5"
            />
            {t('lineNumbers')}
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
              className="accent-primary w-3.5 h-3.5"
            />
            {t('wordWrap')}
          </label>
        </div>
      </div>

      {/* Code block */}
      <div
        className={`code-view bg-card border border-t-0 border-border rounded-b-lg overflow-hidden ${lineNumbers ? 'line-numbers' : ''} ${wordWrap ? 'wrap' : 'no-wrap'}`}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />

      {/* Footer / delete */}
      <div className="flex items-center justify-between pt-2">
        <a
          href={pasteUrl}
          className="text-small text-muted-foreground hover:text-primary transition-colors break-all"
        >
          {pasteUrl}
        </a>
        <DeletePasteButton pasteId={paste.pasteId} />
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="text-foreground mt-0.5 truncate">{value}</div>
    </div>
  )
}
