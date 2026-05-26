/**
 * Hero — portrait + introduction text. Photo on the left at md+; stacks
 * to single column on mobile.
 *
 * Portrait: real image if Profile.portrait is set in Sanity, otherwise
 * the glider illustration placeholder.
 *
 * Text: small uppercase sepia label, large bold greeting, two paragraphs
 * of bio. Bio is Portable Text from Sanity.
 */
import Image from 'next/image'
import {urlFor} from '@/sanity/client'
import {pickLocale} from '@/i18n/pick-locale'
import {t} from '@/i18n/messages'
import {PortableTextRenderer} from '@/components/portable-text'
import {GliderPortrait} from './glider-portrait'
import type {Locale} from '@/i18n/config'
import type {ABOUT_QUERY_RESULT} from '@/sanity.types'

type Profile = NonNullable<ABOUT_QUERY_RESULT>['profile']

export function HeroSection({profile, locale}: {profile: Profile; locale: Locale}) {
  if (!profile) return null

  const bio = pickLocale(
    typeof profile.bio === 'object' && profile.bio !== null && !Array.isArray(profile.bio)
      ? profile.bio
      : null,
    locale
  )
  const portraitAsset = profile.portrait?.asset

  return (
    <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-8 items-start">
      <div className="aspect-square rounded-lg overflow-hidden">
        {portraitAsset ? (
          <Image
            src={urlFor(portraitAsset).width(440).height(440).url()}
            alt={profile.portrait?.alt ?? profile.name ?? 'Portrait'}
            width={440}
            height={440}
            className="size-full object-cover"
          />
        ) : (
          <GliderPortrait className="size-full" />
        )}
      </div>
      <div>
        <p className="font-mono text-[9px] font-medium uppercase tracking-[2px] text-sepia mb-4">
          — {t(locale, 'introductionLabel')}
        </p>
        <h1 className="font-sans text-[28px] md:text-[32px] font-medium leading-tight text-ink mb-5">
          {locale === 'en' ? "Hi, I'm" : 'Hoi, ik ben'} {profile.name ?? 'Jelle'}.
        </h1>
        {bio ? (
          <PortableTextRenderer
            value={bio}
            className="font-sans text-[14px] text-ink leading-relaxed max-w-prose space-y-3"
          />
        ) : (
          <p className="font-sans text-[14px] text-ink-muted italic">
            No bio yet — add one in the Studio.
          </p>
        )}
      </div>
    </section>
  )
}
