'use client'
/**
 * EN / NL toggle. Reads the current path, swaps the locale segment,
 * and pushes the new URL. The middleware persists the choice via cookie.
 */
import {usePathname, useRouter} from 'next/navigation'
import {clsx} from 'clsx'
import {locales, type Locale} from '@/i18n/config'

export function LocaleSwitcher({currentLocale}: {currentLocale: Locale}) {
  const router = useRouter()
  const pathname = usePathname()

  const switchTo = (target: Locale) => {
    if (target === currentLocale) return
    const swapped = pathname.replace(/^\/(en|nl)(?=\/|$)/, `/${target}`)
    router.push(swapped)
  }

  return (
    <div className="flex gap-0.5 font-mono text-xs uppercase tracking-wider">
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 && <span className="mx-1 text-faint" aria-hidden>/</span>}
          <button
            type="button"
            onClick={() => switchTo(locale)}
            className={clsx(
              'cursor-pointer transition-colors',
              locale === currentLocale ? 'text-ink font-medium' : 'text-faint hover:text-ink'
            )}
            aria-current={locale === currentLocale ? 'true' : undefined}
            aria-label={`Switch to ${locale === 'en' ? 'English' : 'Dutch'}`}
          >
            {locale}
          </button>
        </span>
      ))}
    </div>
  )
}
