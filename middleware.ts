import { NextResponse, type NextRequest } from 'next/server'

// ─── Security-Header, zentral und pro Request ─────────────────────────────
//
// Bis 09/2026 standen diese Header in `next.config.ts` unter `headers()` und
// zusätzlich im Apache-vHost. Beides zusammen hat sie doppelt ausgeliefert:
// `Header always set` schreibt in Apaches `err_headers_out`, die Antwort des
// Proxys bringt dieselben Namen in `headers_out` mit, und der Client bekommt
// beide Tabellen. Identische Werte, also nie ein Sicherheitsloch, aber genau
// die Art Mehrdeutigkeit, die man nicht ausliefern will: bei zwei
// widersprüchlichen `X-Frame-Options` verhalten sich Browser unterschiedlich.
//
// Jetzt gibt es einen Eigentümer. Der vHost entfernt die Header (`Header
// always unset`) und setzt sie nur noch für `/error_pages`, wo die Anwendung
// nicht antwortet.
//
// Der Umzug von `next.config.ts` hierher ist nicht nur Ordnung: ein Nonce muss
// pro Request neu erzeugt werden, und `headers()` in der Konfiguration ist
// statisch.
//
// ─── Warum ein Nonce statt 'unsafe-inline' ────────────────────────────────
//
// Ein Paste-Dienst führt fremden Code nicht aus, er zeigt ihn an. Das
// eigentliche Ziel eines eingesandten `<script>` ist deshalb der Browser der
// **Besucher**, nicht der Server. Dieser Weg ist geschlossen, weil jede
// Ausgabe durch Shikis `codeToHtml` geht und dort escaped wird
// (`src/lib/highlight.ts`, inklusive Fallback auf `text` bei unbekannter
// Sprache): es gibt keinen Zweig, der den Rohtext in `__html` reicht.
//
// Mit `script-src 'self' 'unsafe-inline'` wäre die CSP aber wertlos, falls
// dieser eine Weg je aufbräche. Sie soll die zweite Linie sein und nicht die
// erste doppeln. Mit Nonce plus `'strict-dynamic'` zählt bei nachgeladenen
// Scripts die Herkunft statt des Nonce, und ein injiziertes Inline-Script hat
// keinen gültigen Nonce, weil der pro Antwort wechselt.

const isDev = process.env.NODE_ENV === 'development'

export function middleware(request: NextRequest) {
  // In der Entwicklung kein Nonce: Nexts React Refresh lädt seinen
  // HMR-Runtime über `eval`, und eine strikte Policy lässt die Seite gar
  // nicht erst hydratisieren. Der Dev-Server ist nicht exponiert, deshalb
  // bleibt es dort bei der lockeren Fassung von früher.
  let nonce = ''
  if (!isDev) {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    nonce = btoa(String.fromCharCode(...bytes))
  }

  const csp = [
    // 'none' als Default: jede benutzte Kategorie muss unten explizit stehen.
    "default-src 'none'",

    nonce
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

    // Next hängt den Nonce automatisch an seine eigenen inline <style>-Tags
    // (next/font, Critical CSS), sobald er im Request-Header steht.
    nonce ? `style-src 'self' 'nonce-${nonce}'` : "style-src 'self' 'unsafe-inline'",

    // style-src-attr deckt `style="..."`-Attribute ab und ist hier tragend,
    // nicht optional: Shiki färbt jeden Token über ein Inline-Style-Attribut,
    // und recharts auf /stats positioniert genauso. Ohne diese Zeile wäre
    // jedes Paste schwarz auf schwarz. Mozilla Observatory wertet style-src,
    // nicht style-src-attr.
    "style-src-attr 'unsafe-inline'",

    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
    // Next benutzt blob:-Worker für sein Streaming-Hydration-System.
    "worker-src 'self' blob:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')

  // Den Nonce über den Request-Header durchreichen. Daran erkennt Next ihn und
  // setzt ihn selbst auf seine Hydration-Scripts.
  const requestHeaders = new Headers(request.headers)
  if (nonce) {
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', csp)
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // DENY statt SAMEORIGIN: ein Paste gehört in kein fremdes Frame, und die
  // eigene Anwendung rahmt sich nirgends selbst ein.
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  return response
}

// Statische Assets liefert Next direkt aus und brauchen die Pipeline nicht.
// `/raw` und `/dl` laufen bewusst MIT durch: sie sind zwar keine Dokumente,
// setzen aber ihre eigenen `Content-Type`- und `nosniff`-Header, und die
// übrigen Header schaden dort nicht.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|msk_paste.png|msk_shortener.png).*)'],
}
