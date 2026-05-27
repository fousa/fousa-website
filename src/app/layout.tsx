import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import {headers} from 'next/headers'
import {isLocale, defaultLocale} from '@/i18n/config'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://fousa.be'),
  title: {default: 'Jelle Vandebeeck', template: '%s · Jelle Vandebeeck'},
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const h = await headers()
  const pathname = h.get('x-pathname') ?? ''
  const segment = pathname.split('/')[1] ?? ''
  const lang = isLocale(segment) ? segment : defaultLocale

  return (
    <html lang={lang} className={inter.variable}>
      <body className="bg-page text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
