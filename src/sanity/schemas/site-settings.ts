/**
 * Site Settings — singleton document.
 *
 * Global settings: contact email, ordered social links, and SEO fields
 * (localized meta description, optional OG image override). Edited in the
 * Studio, reflected on every page without a deploy.
 */
import {defineType, defineField} from 'sanity'
import {i18nString} from '@/sanity/fields/i18n'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  description: 'Global settings: email, social links, SEO defaults.',
  fields: [
    defineField({
      name: 'email',
      title: 'Contact email',
      type: 'string',
      description: 'Primary contact email — shown in the contact panel and used for mailto links.',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      description: 'Ordered list of social profiles. First item appears first in the footer.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              validation: (Rule) => Rule.required(),
              options: {
                list: [
                  {title: 'GitHub', value: 'github'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'Bluesky', value: 'bluesky'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'Mastodon', value: 'mastodon'},
                ],
              },
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Display label',
              type: 'string',
              description: 'Optional display override; defaults to the platform name.',
            }),
          ],
          preview: {
            select: {title: 'platform', subtitle: 'url'},
          },
        },
      ],
    }),
    i18nString(
      'metaDescription',
      'Meta description',
      'Default SEO meta description. Localized — provide EN and optionally NL.'
    ),
    defineField({
      name: 'ogImage',
      title: 'OG image override',
      type: 'image',
      description: 'Falls back to /og-image.png if empty.',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
})
