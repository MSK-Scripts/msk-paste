import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Die Security-Header stehen seit 09/2026 in `middleware.ts` und nicht mehr
// hier. Zwei Gruende: die CSP braucht einen Nonce, der pro Request neu erzeugt
// wird, und `headers()` ist statisch. Und sie hatten vorher zwei Eigentuemer,
// diese Datei und den Apache-vHost, weshalb der Client jeden Header doppelt
// bekam.

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
}

export default withNextIntl(nextConfig)
