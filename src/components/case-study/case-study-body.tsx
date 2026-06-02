/**
 * Case study body — everything below the hero. Single column at max-w-3xl
 * for comfortable reading; screenshots break out to a wider grid when more
 * than one is present.
 *
 * Each section bails early if its field is empty — a thin project gets a
 * short page with whatever content exists.
 */
import Image from 'next/image'
import {urlFor} from '@/sanity/client'
import {pickLocale} from '@/i18n/pick-locale'
import {t} from '@/i18n/messages'
import {PortableTextRenderer} from '@/components/portable-text'
import {StackChip} from '@/components/log/stack-chip'
import type {Locale} from '@/i18n/config'
import type {CASE_STUDY_QUERY_RESULT} from '@/sanity.types'

type Project = NonNullable<CASE_STUDY_QUERY_RESULT>

export function CaseStudyBody({project, locale}: {project: Project; locale: Locale}) {
  const description = pickLocale(
    typeof project.description === 'object' ? project.description : null,
    locale
  )
  const outcome = pickLocale(
    typeof project.outcome === 'object' ? project.outcome : null,
    locale
  )

  const additionalScreenshots = (project.screenshots ?? []).slice(1)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-14 space-y-10">
      {description && (
        <PortableTextRenderer
          value={description}
          className="font-sans text-[15px] md:text-[16px] text-ink leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0"
        />
      )}

      {additionalScreenshots.length > 0 && (
        <div
          className={`grid gap-3 ${
            additionalScreenshots.length === 1
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {additionalScreenshots.map((shot) =>
            shot?.asset ? (
              <div
                key={shot._key}
                className="aspect-[3/4] rounded overflow-hidden bg-surface-warm"
              >
                <Image
                  src={urlFor(shot.asset).width(900).url()}
                  alt={shot.alt ?? ''}
                  width={900}
                  height={1200}
                  className="size-full object-cover"
                />
              </div>
            ) : null
          )}
        </div>
      )}

      {project.stack && project.stack.length > 0 && (
        <div>
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-[1.5px] text-sepia mb-3">
            {t(locale, 'stack')}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tag) =>
              tag ? (
                <StackChip key={tag._id} name={tag.name ?? ''} />
              ) : null
            )}
          </div>
        </div>
      )}

      {outcome && (
        <div>
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-[1.5px] text-sepia mb-3">
            {t(locale, 'outcome')}
          </h2>
          <p className="font-sans text-[15px] font-medium text-ink">{outcome}</p>
        </div>
      )}

      <ExternalLinks project={project} locale={locale} />
    </div>
  )
}

function ExternalLinks({project, locale}: {project: Project; locale: Locale}) {
  const hasAny = project.liveUrl || project.githubUrl || project.writeupUrl
  if (!hasAny) return null

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 border-t border-ink/10">
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[12px] font-medium text-accent hover:underline"
        >
          ↗ {t(locale, 'liveLink')}
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[12px] text-ink-muted hover:text-ink"
        >
          ↗ {t(locale, 'viewSource')}
        </a>
      )}
      {project.writeupUrl && (
        <a
          href={project.writeupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[12px] text-ink-muted hover:text-ink"
        >
          ↗ {t(locale, 'viewWriteup')}
        </a>
      )}
    </div>
  )
}
