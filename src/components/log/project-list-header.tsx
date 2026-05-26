/**
 * The desktop column header row. Hidden on mobile (md breakpoint and below)
 * because mobile renders rows as cards with inline labels.
 */
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'

export function ProjectListHeader({locale}: {locale: Locale}) {
  const cols = ['project', 'client', 'stack', 'role', 'year', 'state'] as const
  return (
    <div className="hidden md:grid grid-cols-[24%_22%_12%_22%_8%_12%] gap-2 border-b border-ink-faint/30 px-2 py-3">
      {cols.map((key, i) => (
        <div
          key={key}
          className={`font-mono text-[9px] font-medium uppercase tracking-wider text-ink-muted ${
            i === 5 ? 'text-right' : 'text-left'
          }`}
        >
          {t(locale, key)}
        </div>
      ))}
    </div>
  )
}
