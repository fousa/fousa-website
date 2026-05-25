import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'

const greetings = {
  en: 'Hello fousa.',
  nl: 'Hallo fousa.',
} as const

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  if (!isLocale(locale)) notFound()
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">{greetings[locale]}</h1>
    </main>
  )
}
