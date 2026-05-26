import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://fousa.be'),
  title: {default: 'Jelle Vandebeeck', template: '%s · Jelle Vandebeeck'},
  description: 'iOS apps and Rails backends, from Edegem, Belgium.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-page text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
