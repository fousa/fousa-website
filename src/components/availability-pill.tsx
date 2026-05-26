/**
 * The green pill in the top bar — drives off the Availability singleton.
 *
 * Three render states based on `status`:
 *   - available    → green dot + green text, links to email
 *   - next-opening → amber dot + amber text, label includes the opening date
 *   - booked       → muted gray dot + muted text, not a link
 *
 * The pill is always visible — it's part of the brand. When fully booked
 * the muted treatment makes that obvious without removing the affordance.
 */
import {clsx} from 'clsx'
import {pickLocale} from '@/i18n/pick-locale'
import type {Locale} from '@/i18n/config'
import type {AVAILABILITY_QUERY_RESULT} from '@/sanity.types'

export function AvailabilityPill({
  availability,
  locale,
  email,
}: {
  availability: AVAILABILITY_QUERY_RESULT
  locale: Locale
  email: string | null
}) {
  if (!availability) return null

  const label = pickLocale(availability.label, locale) ?? ''
  const status = availability.status

  const isAvailable = status === 'available' || status === 'next-opening'
  const dotClass =
    status === 'available' ? 'bg-success'
    : status === 'next-opening' ? 'bg-amber-500'
    : 'bg-ink-faint'
  const textClass =
    status === 'available' ? 'text-success'
    : status === 'next-opening' ? 'text-amber-300'
    : 'text-ink-muted'

  const inner = (
    <span className="inline-flex items-center gap-2 rounded-full bg-success-bg px-3 py-1.5 pl-2.5">
      <span className={clsx('size-2 rounded-full', dotClass)} aria-hidden />
      <span className={clsx('font-sans text-[11px] font-medium tracking-wide', textClass)}>
        {label}
      </span>
    </span>
  )

  if (isAvailable && email) {
    return (
      <a href={`mailto:${email}`} className="inline-flex">
        {inner}
      </a>
    )
  }
  return inner
}
