'use client'

import { useState } from 'react'
import { useFormatter, useTranslations } from 'next-intl'
import { CopyButton } from './CopyButton'
import { DeletePasteButton } from './DeletePasteButton'
import type { PublicPaste } from '@/types'

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
          <h1 className="font-heading text-2xl text-msk-text break-all">
            {paste.title ?? <span className="font-mono text-msk-muted">{paste.pasteId}</span>}
          </h1>
          {paste.title && (
            <p className="text-xs font-mono text-msk-muted mt-0.5">{paste.pasteId}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton value={rawUrl} label={t('copyUrl')} />
          <CopyButton value={paste.content} label={t('copyContent')} />
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-msk-surface2 hover:bg-msk-surface border border-msk-border text-msk-muted hover:text-msk-text transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Raw
          </a>
          <a
            href={dlUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-msk-surface2 hover:bg-msk-surface border border-msk-border text-msk-muted hover:text-msk-text transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-3 bg-msk-surface border border-msk-border rounded-lg text-xs">
        <Meta label={t('language')} value={tlang(paste.language)} />
        <Meta label={t('size')}     value={t('bytes', { bytes: paste.sizeBytes })} />
        <Meta label={t('createdAt', { date: '' }).replace(/\s+$/, '')} value={createdAt} />
        <Meta label={t('expiresAt', { date: '' }).replace(/\s+$/, '')} value={expiresAt} />
      </div>

      {paste.burnAfterRead && (
        <div className="px-4 py-3 bg-msk-danger/10 border border-msk-danger/30 rounded-lg text-sm text-msk-danger flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 7.317c2 3 .5 6 3 8 .5.6.5 2-2.343 3.34z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
          {t('burnAfterRead')}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-msk-surface2 border border-msk-border rounded-t-lg text-xs text-msk-muted">
        <div className="flex items-center gap-2">
          <span className="font-mono uppercase tracking-wider">{tlang(paste.language)}</span>
          <span className="text-msk-dim">·</span>
          <span>{t('views', { count: paste.viewCount })}</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={lineNumbers}
              onChange={(e) => setLineNumbers(e.target.checked)}
              className="accent-msk-accent w-3.5 h-3.5"
            />
            {t('lineNumbers')}
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
              className="accent-msk-accent w-3.5 h-3.5"
            />
            {t('wordWrap')}
          </label>
        </div>
      </div>

      {/* Code block */}
      <div
        className={`shiki-wrap bg-[#22272e] border border-t-0 border-msk-border rounded-b-lg overflow-hidden ${lineNumbers ? 'line-numbers' : ''} ${wordWrap ? 'wrap' : 'no-wrap'}`}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />

      {/* Footer / delete */}
      <div className="flex items-center justify-between pt-2">
        <a
          href={pasteUrl}
          className="text-xs text-msk-muted hover:text-msk-accent transition-colors break-all"
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
      <div className="uppercase tracking-wider text-msk-muted text-[10px]">{label}</div>
      <div className="text-msk-text mt-0.5 truncate">{value}</div>
    </div>
  )
}
