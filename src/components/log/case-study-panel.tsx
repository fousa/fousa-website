/**
 * Expanded case study panel — shown below a row when that row is the
 * currently-active expanded one.
 *
 * Content order: italic deck, screenshots strip, description paragraphs,
 * full stack chip list (more granular than the row's single primary chip),
 * outcome metric, links bar with permalink and ESC hint.
 *
 * Every field is optional except deck/description (which gated the
 * expand affordance in `hasExpandableContent`). Each section bails early
 * if its field is missing.
 */
import Image from 'next/image'
import {urlFor} from '@/sanity/client'
import {pickLocale} from '@/i18n/pick-locale'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'
import {PortableTextRenderer} from '@/components/portable-text'
import {StackChip} from './stack-chip'
import {CopyLinkButton} from './copy-link-button'

type Project = NonNullable<PROJECTS_QUERY_RESULT>[number]

export function CaseStudyPanel({
  project,
  locale,
}: {
  project: Project
  locale: Locale
}) {
  // Defensive: in 3a we found availability.label could be a bare string
  // depending on data shape. Same pattern here.
  const deck = pickLocale(
    typeof project.deck === 'object' ? project.deck : null,
    locale
  )
  const description = pickLocale(
    typeof project.description === 'object' ? project.description : null,
    locale
  )
  const outcome = pickLocale(
    typeof project.outcome === 'object' ? project.outcome : null,
    locale
  )

  return (
    <div
      id={project.slug ? `panel-${project.slug}` : undefined}
      className="px-2 py-6 bg-surface-warm/40"
    >
      <div className="rounded-lg bg-surface p-5 border border-ink/10">
        {deck && (
          <p className="font-serif italic text-[15px] text-ink-soft mb-5">
            {deck}
          </p>
        )}

        <Screenshots project={project} />

        {description && (
          <PortableTextRenderer
            value={description}
            className="font-sans text-[13px] text-ink leading-relaxed [&_p]:mb-2.5 [&_p:last-child]:mb-0"
          />
        )}

        {project.stack && project.stack.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            <span className="mr-2 font-mono text-[9px] font-medium uppercase tracking-wider text-ink-muted">
              {t(locale, 'stack')}
            </span>
            {project.stack.map((tag) =>
              tag ? (
                <StackChip key={tag._id} name={tag.name ?? ''} />
              ) : null
            )}
          </div>
        )}

        {outcome && (
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-[9px] font-medium uppercase tracking-wider text-ink-muted">
              {t(locale, 'outcome')}
            </span>
            <span className="font-sans text-[13px] font-medium text-ink">
              {outcome}
            </span>
          </div>
        )}

        <PanelLinks project={project} locale={locale} />
      </div>
    </div>
  )
}

/**
 * Screenshot strip — three columns on desktop, single column on mobile.
 * Falls back to colored placeholder boxes when no screenshots are uploaded
 * (e.g. freshly migrated projects). Each placeholder shows the project name
 * so it's clear the data exists, the image just isn't there yet.
 */
function Screenshots({project}: {project: Project}) {
  const screenshots = project.screenshots ?? []
  const hasReal = screenshots.length > 0 && screenshots[0]?.asset

  if (!hasReal) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded bg-mobile/10 flex items-center justify-center"
          >
            <span className="font-serif italic text-ink-faint text-[10px]">
              [ {project.name} ]
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-5">
      {screenshots.slice(0, 3).map((shot) =>
        shot?.asset ? (
          <div
            key={shot._key}
            className="aspect-[3/4] rounded overflow-hidden bg-surface-warm"
          >
            <Image
              src={urlFor(shot.asset).width(600).url()}
              alt={shot.alt ?? ''}
              width={600}
              height={800}
              className="size-full object-cover"
            />
          </div>
        ) : null
      )}
    </div>
  )
}

/**
 * The links bar at the bottom of the panel — live URL, source URL, writeup
 * URL (each optional), plus the "ESC to close" affordance.
 */
function PanelLinks({project, locale}: {project: Project; locale: Locale}) {
  return (
    <div className="mt-5 pt-4 border-t border-ink/10 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px]">
      {project.slug && (
        <CopyLinkButton
          slug={String(project.slug)}
          label={t(locale, 'copyLink')}
          copiedLabel={t(locale, 'copied')}
        />
      )}
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mobile font-medium hover:underline"
        >
          ↗ {t(locale, 'liveLink')}
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted hover:text-ink"
        >
          ↗ {t(locale, 'viewSource')}
        </a>
      )}
      {project.writeupUrl && (
        <a
          href={project.writeupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted hover:text-ink"
        >
          ↗ {t(locale, 'viewWriteup')}
        </a>
      )}
      <span className="ml-auto text-ink-faint">
        {t(locale, 'escapeToClose')}
      </span>
    </div>
  )
}
