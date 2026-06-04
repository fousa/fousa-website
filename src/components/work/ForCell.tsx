/**
 * The "For" column value, shared by the log (desktop row + mobile meta) and the
 * case-study meta so the three render sites never drift.
 *
 * Renders the employer→client relationship, a single name, the localized
 * "Personal" fallback, or — for a personal utility (no case study + external
 * link) — a mono-uppercase "Tool" badge. The mono/uppercase treatment reads as
 * a *category*, not a client name, which is what keeps "Tool" from feeling like
 * an odd relationship label.
 */
import {forLabel} from '@/lib/work-display'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'
import type {Project} from '@/lib/work'

export function ForCell({p, locale}: {p: Project; locale: Locale}) {
  const f = forLabel(p)
  switch (f.kind) {
    case 'via':
      return (
        <>
          <span className="text-muted">{f.employer}</span>
          <span className="mx-1 text-faint" aria-hidden>
            →
          </span>
          <span className="text-ink">{f.client}</span>
        </>
      )
    case 'single':
      return <span className="text-ink">{f.text}</span>
    case 'tool':
      return (
        <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.07em] text-muted">
          {t(locale, 'forTool')}
        </span>
      )
    case 'personal':
      return <span className="text-muted">{t(locale, 'personal')}</span>
  }
}
