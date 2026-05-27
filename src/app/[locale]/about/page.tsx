/**
 * About page — hero, career, beyond code, contact footer.
 *
 * Fetches three things server-side: the about-page data (profile, employers,
 * own apps), the full project list (so we can derive employer stack categories
 * for the timeline filter links), and availability (for the footer pill).
 *
 * The TopBar in the parent locale layout already fetches profile + availability
 * for its own rendering; Next dedupes the same query, so total round-trips stay
 * minimal.
 */
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {isLocale} from '@/i18n/config'
import {fetchSanity} from '@/sanity/fetch'
import {ABOUT_QUERY} from '@/sanity/queries/about'
import {PROJECTS_QUERY} from '@/sanity/queries/projects'
import {AVAILABILITY_QUERY} from '@/sanity/queries/availability'
import {deriveEmployerStackCategories} from '@/lib/employer-filters'
import {HeroSection} from '@/components/about/hero-section'
import {CareerSection} from '@/components/about/career-section'
import {BeyondCodeSection} from '@/components/about/beyond-code-section'
import {ContactFooter} from '@/components/about/contact-footer'
import type {
  ABOUT_QUERY_RESULT,
  PROJECTS_QUERY_RESULT,
  AVAILABILITY_QUERY_RESULT,
} from '@/sanity.types'

export const metadata: Metadata = {
  title: 'About',
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  if (!isLocale(locale)) notFound()

  const [aboutData, projects, availability] = await Promise.all([
    fetchSanity<ABOUT_QUERY_RESULT>(ABOUT_QUERY),
    fetchSanity<PROJECTS_QUERY_RESULT>(PROJECTS_QUERY),
    fetchSanity<AVAILABILITY_QUERY_RESULT>(AVAILABILITY_QUERY),
  ])

  if (!aboutData?.profile) {
    return (
      <main id="main" className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-mono text-[12px] text-ink-muted">
          Profile not set — create the Profile singleton in /studio.
        </p>
      </main>
    )
  }

  const employerStackCategories = deriveEmployerStackCategories(projects)
  const employers = aboutData.employers ?? []
  const ownApps = aboutData.ownApps ?? []

  return (
    <>
      <main id="main" className="mx-auto max-w-6xl px-6 py-10 space-y-12">
        <HeroSection profile={aboutData.profile} locale={locale} />
        <hr className="border-t border-black/5" />
        <CareerSection
          employers={employers}
          employerStackCategories={employerStackCategories}
          locale={locale}
        />
        <hr className="border-t border-black/5" />
        <BeyondCodeSection ownApps={ownApps} locale={locale} />
      </main>
      <ContactFooter
        profile={aboutData.profile}
        availability={availability}
        locale={locale}
      />
    </>
  )
}
