'use client'

import { useRouter } from 'next/navigation'
import { useId, useTransition } from 'react'

import { CaretDown, Globe } from '@/components/icons'
import { LOCALE_LABELS, LOCALES, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

/**
 * The language choice of the header: a native select that posts to
 * /api/locale (which sets the NEXT_LOCALE cookie) and refreshes. The label is
 * there for a screen reader; the globe and the caret say what it is.
 */
export function LanguagePicker({
  locale,
  label,
  className,
}: {
  locale:     Locale
  label:      string
  className?: string
}) {
  const router = useRouter()
  const id = useId()
  const [pending, startTransition] = useTransition()

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Globe className="pointer-events-none absolute left-2 h-5 w-5 text-muted-foreground" />
      <select
        id={id}
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value
          startTransition(async () => {
            await fetch('/api/locale', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({ locale: next }),
            })
            router.refresh()
          })
        }}
        className="min-h-11 cursor-pointer appearance-none rounded-md bg-transparent py-2 pr-8 pl-9 font-medium text-foreground transition-colors duration-150 hover:bg-muted disabled:opacity-60"
      >
        {LOCALES.map((value) => (
          <option key={value} value={value} lang={value}>
            {LOCALE_LABELS[value]}
          </option>
        ))}
      </select>
      <CaretDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  )
}
