/**
 * Migrates content/profile/about.md → the Profile singleton document.
 *
 * The Profile is a singleton, so the document _id is fixed as 'profile' to
 * match the desk structure pin. createOrReplace is safe — re-running the
 * migration overwrites with current source content.
 */
import {join} from 'node:path'
import type {SanityClient} from '@sanity/client'
import {readMarkdown} from './parse-frontmatter'
import {toPortableTextI18n} from './portable-text'
import {i18n} from './i18n'
import type {ProfileFrontmatter} from './types'

/**
 * @param client - Authenticated Sanity client with write permissions
 * @param contentDir - Absolute path to the content/ root
 * @returns The number of profile documents written (always 1)
 */
export async function migrateProfile(
  client: SanityClient,
  contentDir: string
): Promise<number> {
  const {data, body} = await readMarkdown<ProfileFrontmatter>(
    join(contentDir, 'profile', 'about.md')
  )

  const socials = data.socials ?? {}
  const socialLinks: Array<{_key: string; label: string; url: string}> = []
  if (socials.linkedin) socialLinks.push({_key: 'linkedin', label: 'LinkedIn', url: socials.linkedin})
  if (socials.github) socialLinks.push({_key: 'github', label: 'GitHub', url: socials.github})
  if (socials.instagram) socialLinks.push({_key: 'instagram', label: 'Instagram', url: socials.instagram})

  await client.createOrReplace({
    _id: 'profile',
    _type: 'profile',
    name: data.name,
    tagline: i18n(data.role),
    bio: toPortableTextI18n(body),
    location: 'Edegem, Belgium',
    email: socials.email ?? 'jelle@fousa.be',
    socialLinks,
    copyrightYear: 2012,
    // portrait, cv, vatNumber left for manual entry in the Studio
  })

  return 1
}
