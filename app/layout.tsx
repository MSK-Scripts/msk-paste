import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import './globals.css'

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
  themeColor:   '#1b1b1d',
  colorScheme:  'dark',
  width:        'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-msk-bg text-msk-text antialiased">
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
