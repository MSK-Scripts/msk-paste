import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Die Security-Header stehen seit 09/2026 in `proxy.ts` (bis Next 15 `middleware.ts`) und nicht mehr
// hier. Zwei Gruende: die CSP braucht einen Nonce, der pro Request neu erzeugt
// wird, und `headers()` ist statisch. Und sie hatten vorher zwei Eigentuemer,
// diese Datei und den Apache-vHost, weshalb der Client jeden Header doppelt
// bekam.

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Metadata is resolved before the head is sent, for every user agent. Next
  // streams it for anything outside its own bot list, and a canonical that
  // resolves after the shell lands after </head>. One regex for all turns
  // streaming off.
  htmlLimitedBots: /.*/,
  // The proxy sets the security headers for documents but does not run for
  // build assets (see its matcher). These static headers are no duplicate of
  // it: the paths below never reach the proxy. Static files get a CSP that
  // allows nothing, since they are no documents.
  async headers() {
    const base = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options',    value: 'nosniff' },
      { key: 'X-Frame-Options',           value: 'DENY' },
      { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
    ]
    return [
      {
        source:  '/_next/static/:path*',
        headers: [...base, { key: 'Content-Security-Policy', value: "default-src 'none'; frame-ancestors 'none'" }],
      },
      { source: '/_next/image', headers: base },
    ]
  },
}

export default withNextIntl(nextConfig)
