'use client'

import { useEffect, useRef } from 'react'

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey:            string
      action:             string
      callback:           (token: string) => void
      'expired-callback': () => void
      'error-callback':   () => void
      theme:              'auto' | 'light' | 'dark'
    },
  ) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

/**
 * Cloudflare Turnstile. The page loads api.js with the CSP nonce; this
 * component waits for `window.turnstile` and renders the widget explicitly,
 * so the token lands in React state. Change `key` to get a fresh token: a
 * token is spent once the server has verified it.
 */
export function TurnstileWidget({
  siteKey,
  action,
  onToken,
}: {
  siteKey: string
  action:  string
  onToken: (token: string | null) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let widgetId: string | null = null
    let poll: ReturnType<typeof setInterval> | undefined

    function render(): boolean {
      if (!ref.current || !window.turnstile) return false
      widgetId = window.turnstile.render(ref.current, {
        sitekey:            siteKey,
        action,
        callback:           (token) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback':   () => onToken(null),
        theme:              'dark',
      })
      return true
    }

    if (!render()) {
      poll = setInterval(() => {
        if (render() && poll) clearInterval(poll)
      }, 200)
    }

    return () => {
      if (poll) clearInterval(poll)
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [siteKey, action, onToken])

  return <div ref={ref} className="min-h-[65px]" />
}
