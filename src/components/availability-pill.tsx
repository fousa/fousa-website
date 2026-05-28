/**
 * The availability pill in the top bar — drives off the Availability singleton.
 *
 * Three render states based on `status`:
 *   - available    → green dot + green text, links to email
 *   - after-hours  → amber dot + amber text
 *   - unavailable  → red dot + muted text, not a link
 */
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

  const rawMessage = availability.message
  const label = typeof rawMessage === 'string'
    ? rawMessage
    : pickLocale(rawMessage, locale) ?? ''
  const status = availability.status

  const dotColor =
    status === 'available' ? 'var(--status-ok)'
    : status === 'after-hours' ? 'var(--status-warn)'
    : 'var(--status-full)'

  const textClass =
    status === 'available' ? 'text-panel-text'
    : status === 'after-hours' ? 'text-panel-muted'
    : 'text-panel-muted'

  const inner = (
    <span className="inline-flex items-center gap-2 rounded-full bg-panel px-3 py-1.5 pl-2.5">
      <span
        className="size-2 rounded-full"
        style={{backgroundColor: dotColor}}
        aria-hidden
      />
      <span className={`font-sans text-[11px] font-medium tracking-wide ${textClass}`}>
        {label}
      </span>
    </span>
  )

  if (status === 'available' && email) {
    return (
      <a href={`mailto:${email}`} className="inline-flex">
        {inner}
      </a>
    )
  }
  return inner
}
