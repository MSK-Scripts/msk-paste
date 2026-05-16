'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

interface MobileNavProps {
  labels: {
    createNew: string
    stats: string
    github: string
    menu: string
  }
}

/**
 * Hamburger menu for mobile screens.
 * Replaces the inline desktop nav at < md breakpoint.
 */
export function MobileNav({ labels }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', onClick)
      document.addEventListener('keydown', onKey)
      return () => {
        document.removeEventListener('mousedown', onClick)
        document.removeEventListener('keydown', onKey)
      }
    }
  }, [isOpen])

  const itemClass =
    'block px-3 py-2.5 text-sm text-msk-text hover:bg-msk-surface2 hover:text-msk-accent transition-colors'

  return (
    <div ref={wrapRef} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-md text-msk-muted hover:text-msk-text hover:bg-msk-surface transition-colors"
        aria-label={labels.menu}
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-msk-surface border border-msk-border rounded-lg shadow-xl overflow-hidden animate-fade-in z-50">
          <nav className="py-1">
            <Link href="/" onClick={() => setIsOpen(false)} className={itemClass}>
              {labels.createNew}
            </Link>
            <Link href="/stats" onClick={() => setIsOpen(false)} className={itemClass}>
              {labels.stats}
            </Link>
            <a
              href="https://github.com/MSK-Scripts/msk-paste"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className={itemClass}
            >
              {labels.github}
            </a>
          </nav>
        </div>
      )}
    </div>
  )
}
