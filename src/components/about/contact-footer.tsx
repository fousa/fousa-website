/**
 * Dark contact footer — the only color inversion on the site.
 *
 * Email is the hero — large serif treatment, mailto link. Below it: social
 * links + CV download as monospace inline items. Then the same availability
 * pill from the top bar (driven by the Availability singleton, fetched in
 * the page so we don't duplicate the query). Final muted copyright line.
 */
import {t} from '@/i18n/messages'
import {AvailabilityPill} from '@/components/availability-pill'
import type {Locale} from '@/i18n/config'
import type {ABOUT_QUERY_RESULT, AVAILABILITY_QUERY_RESULT} from '@/sanity.types'

type Profile = NonNullable<ABOUT_QUERY_RESULT>['profile']

export function ContactFooter({
  profile,
  availability,
  locale,
}: {
  profile: Profile
  availability: AVAILABILITY_QUERY_RESULT
  locale: Locale
}) {
  if (!profile) return null

  const cvAsset = profile.cv?.asset as {url?: string} | null | undefined
  const cvUrl = cvAsset?.url ?? null
  const year = new Date().getFullYear()
  const copyright = profile.copyrightYear
    ? `© ${profile.copyrightYear}–${year} · ${t(locale, 'copyrightLine')}${profile.vatNumber ? ` · ${profile.vatNumber}` : ''}`
    : `© ${year} · ${t(locale, 'copyrightLine')}`

  return (
    <footer className="bg-ink text-page mt-16">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[2px] text-accent mb-5">
          — {t(locale, 'getInTouch')}
        </p>
        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="font-serif text-[24px] md:text-[28px] font-medium text-page hover:text-accent transition-colors break-all"
          >
            {profile.email}
          </a>
        )}
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 mb-7">
          {profile.socialLinks?.map((link) =>
            link?.url ? (
              <a
                key={link._key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-ink-faint hover:text-page transition-colors"
              >
                → {link.label}
              </a>
            ) : null
          )}
          {cvUrl && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-accent hover:text-page transition-colors"
            >
              ↓ {t(locale, 'downloadCv')}
            </a>
          )}
        </div>
        <AvailabilityPill
          availability={availability}
          locale={locale}
          email={profile.email ?? null}
        />
        <p className="mt-8 font-mono text-[9px] uppercase tracking-wider text-ink-muted">
          {copyright}
        </p>
      </div>
    </footer>
  )
}
