'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from '@/i18n/config'

/**
 * Language dropdown in the header.
 * POSTs the new locale to /api/locale, then refreshes server components.
 */
export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale
  const router        = useRouter()
  const [isOpen, setIsOpen]        = useState(false)
  const [pending, startTransition] = useTransition()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', onClick)
      return () => document.removeEventListener('mousedown', onClick)
    }
  }, [isOpen])

  function switchTo(locale: Locale) {
    if (locale === currentLocale) {
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      try {
        await fetch('/api/locale', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ locale }),
        })
        setIsOpen(false)
        router.refresh()
      } catch (err) {
        console.error('Locale switch failed:', err)
      }
    })
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={pending}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-msk-muted hover:text-msk-text hover:bg-msk-surface transition-colors disabled:opacity-50"
        aria-label="Sprache wechseln / Switch language"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none" aria-hidden="true">
          {LOCALE_FLAGS[currentLocale]}
        </span>
        <span className="uppercase text-xs font-medium tracking-wider">
          {currentLocale}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-msk-surface border border-msk-border rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
          <ul role="listbox">
            {LOCALES.map((locale) => {
              const isActive = locale === currentLocale
              return (
                <li key={locale}>
                  <button
                    type="button"
                    onClick={() => switchTo(locale)}
                    role="option"
                    aria-selected={isActive}
                    className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors ${
                      isActive
                        ? 'bg-msk-accent/10 text-msk-accent'
                        : 'text-msk-text hover:bg-msk-surface2'
                    }`}
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      {LOCALE_FLAGS[locale]}
                    </span>
                    <span className="flex-1">{LOCALE_LABELS[locale]}</span>
                    {isActive && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
