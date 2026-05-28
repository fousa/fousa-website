/**
 * Colored dot + lowercase word for a project's state.
 *
 * Legacy component — the active log uses StatusDot instead. Kept for
 * backwards compatibility with the unused interactive-log chain.
 */
import {clsx} from 'clsx'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'
import type {MessageKey} from '@/i18n/messages'

type State = 'active' | 'maintained' | 'archived' | 'cancelled' | null

const KEY: Record<NonNullable<State>, MessageKey> = {
  active: 'stateActive',
  maintained: 'stateMaintained',
  archived: 'stateArchived',
  cancelled: 'stateCancelled',
}

export function StateIndicator({
  state,
  locale,
}: {
  state: State
  locale: Locale
}) {
  if (!state) return null
  const isActive = state === 'active'
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-sans text-[11px] font-medium',
        isActive ? 'text-success' : 'text-ink-muted'
      )}
    >
      <span
        className={clsx(
          'inline-block size-1.5 rounded-full',
          isActive ? 'bg-success' : 'bg-ink-faint'
        )}
        aria-hidden
      />
      {t(locale, KEY[state])}
    </span>
  )
}
