/**
 * Case study hero — full-bleed image at the top, title block beneath.
 *
 * Image source: the first screenshot if present, otherwise a neutral
 * fallback panel. Title block: project name (large serif), italic deck,
 * three-up metadata (employer/client · role · year range).
 */
import Image from 'next/image'
import {urlFor} from '@/sanity/client'
import {pickLocale} from '@/i18n/pick-locale'
import {t} from '@/i18n/messages'
import {formatYearRange} from '@/lib/format-year-range'
import type {Locale} from '@/i18n/config'
import type {CASE_STUDY_QUERY_RESULT} from '@/sanity.types'

type Project = NonNullable<CASE_STUDY_QUERY_RESULT>

export function CaseStudyHero({project, locale}: {project: Project; locale: Locale}) {
  const deck = pickLocale(
    typeof project.deck === 'object' ? project.deck : null,
    locale
  )

  const hero = project.screenshots?.[0]
  const heroAsset = hero?.asset

  const employerName = project.employer?.name ?? '—'
  const clientLabel =
    project.client && project.client !== employerName
      ? `${employerName} · ${project.client}`
      : employerName

  const yearRange = formatYearRange(
    project.year,
    project.endYear,
    locale === 'en' ? 'now' : 'nu'
  )

  return (
    <header>
      <div className="aspect-[16/7] md:aspect-[16/6] overflow-hidden">
        {heroAsset ? (
          <Image
            src={urlFor(heroAsset).width(1800).height(700).url()}
            alt={hero.alt ?? project.name ?? 'Case study hero'}
            width={1800}
            height={700}
            priority
            className="size-full object-cover"
          />
        ) : (
          <div
            className="size-full bg-ink flex items-center justify-center"
            aria-hidden
          >
            <span className="font-serif italic text-white/30 text-[14px]">
              [ {project.name} ]
            </span>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-3xl px-6 mt-8 md:mt-10">
        <h1 className="font-serif text-[32px] md:text-[44px] font-medium leading-tight text-ink">
          {project.name}
          <span className="text-ink-muted">.</span>
        </h1>
        {deck && (
          <p className="mt-3 font-serif italic text-[18px] md:text-[20px] text-ink-soft">
            {deck}
          </p>
        )}
        <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 border-y border-ink/10 py-5">
          <div>
            <dt className="font-mono text-[9px] font-medium uppercase tracking-wider text-sepia mb-1">
              {t(locale, 'projectFor')}
            </dt>
            <dd className="font-sans text-[13px] text-ink">{clientLabel}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] font-medium uppercase tracking-wider text-sepia mb-1">
              {t(locale, 'projectRole')}
            </dt>
            <dd className="font-sans text-[13px] text-ink">{project.role ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] font-medium uppercase tracking-wider text-sepia mb-1">
              {t(locale, 'projectYear')}
            </dt>
            <dd className="font-sans text-[13px] text-ink">{yearRange}</dd>
          </div>
        </dl>
      </div>
    </header>
  )
}
