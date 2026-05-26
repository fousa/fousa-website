/**
 * Shown in place of the project list when the active filters yield zero
 * results. Offers a single "reset" affordance to clear filters and bring
 * everything back.
 */
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'

export function EmptyState({
  locale,
  onReset,
}: {
  locale: Locale
  onReset: () => void
}) {
  return (
    <div className="py-16 text-center">
      <p className="font-mono text-[12px] text-ink-muted mb-4">
        {t(locale, 'noProjectsFound')}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="font-mono text-[11px] uppercase tracking-wider text-sepia underline-offset-2 hover:underline cursor-pointer"
      >
        ↺ {t(locale, 'resetFilters')}
      </button>
    </div>
  )
}
