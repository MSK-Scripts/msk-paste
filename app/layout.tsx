import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'

// Fonts come from the @fontsource-variable packages and are served by this
// app itself, like on msk-scripts.de: nothing is fetched from Google, neither
// at build time nor in the browser.
import '@fontsource-variable/archivo/standard.css'
import '@fontsource-variable/source-sans-3'
import './globals.css'

import { ThemeProvider } from '@/components/theme/ThemeProvider'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://paste.msk-scripts.de'),
  title: {
    default:  'MSK Paste – Self-hosted Pastebin',
    template: '%s | MSK Paste',
  },
  description:
    'A privacy-friendly self-hosted pastebin with syntax highlighting, expiration dates, password protection, and burn-after-read.',
  applicationName: 'MSK Paste',
  authors: [
    { name: 'Musiker15',   url: 'https://www.musiker15.de' },
    { name: 'MSK Scripts', url: 'https://www.msk-scripts.de' },
  ],
  keywords: ['Pastebin', 'Paste', 'Syntax highlighting', 'MSK', 'MSK Scripts', 'msk-scripts.de'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png',    type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple:    '/logo.png',
  },
  robots: {
    index:  true,
    follow: true,
  },
  openGraph: {
    type:        'website',
    siteName:    'MSK Paste',
    title:       'MSK Paste – Self-hosted Pastebin',
    description: 'A privacy-friendly self-hosted pastebin with syntax highlighting, expiration dates, password protection, and burn-after-read.',
    images:      ['/msk_paste.png'],
  },
}

export const viewport: Viewport = {
  // The card colour of the header bar in each theme.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#212225' },
  ],
  colorScheme:  'light dark',
  width:        'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('site')])
  // next-themes writes a small inline script against a flash of the wrong
  // theme; under the nonce CSP it needs the request's nonce.
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link">
          {t('skipToContent')}
        </a>
        <ThemeProvider nonce={nonce}>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
