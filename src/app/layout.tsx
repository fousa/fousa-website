import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://fousa.be'),
  title: {default: 'Jelle Vandebeeck', template: '%s · Jelle Vandebeeck'},
  description: 'iOS apps and Rails backends, from Edegem, Belgium.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-page text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
