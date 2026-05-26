/**
 * Colored dot + lowercase word for a project's state (live / done / paused).
 *
 * "live" gets the success green; everything else is muted gray. The dot is
 * an inline span rather than an SVG — it scales with font size and avoids
 * an extra request.
 */
import {clsx} from 'clsx'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'

type State = 'live' | 'done' | 'paused' | 'cancelled' | null

export function StateIndicator({
  state,
  locale,
}: {
  state: State
  locale: Locale
}) {
  if (!state) return null
  const isLive = state === 'live'
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-sans text-[11px] font-medium',
        isLive ? 'text-success' : 'text-ink-muted'
      )}
    >
      <span
        className={clsx(
          'inline-block size-1.5 rounded-full',
          isLive ? 'bg-success' : 'bg-ink-faint'
        )}
        aria-hidden
      />
      {t(locale, state)}
    </span>
  )
}
