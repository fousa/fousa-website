/**
 * Profile — singleton document.
 *
 * Drives the about page hero and the site footer. Edited once, referenced
 * everywhere. Marked as a singleton in the Studio desk structure so only
 * one instance can exist.
 */
import {defineField, defineType} from 'sanity'
import {i18nString, i18nText, i18nPortableText} from '@/sanity/fields/i18n'

export const profile = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  description: 'Your bio, photo, contact info — shown on the about page and footer.',
  fields: [
    defineField({
      name: 'name',
      title: 'Full name',
      type: 'string',
      description: 'Your name as it should appear in metadata and the site header.',
      validation: (Rule) => Rule.required(),
    }),
    i18nString(
      'tagline',
      'Tagline',
      'One-line summary shown under your name (e.g. "Senior iOS · Rails · Edegem, BE").'
    ),

    // ── Homepage lead ──────────────────────────────────────────────────
    i18nString(
      'leadHeadline',
      'Homepage headline',
      'Bold headline on the homepage (e.g. "Crafting native apps & web platforms").'
    ),
    i18nText(
      'leadSubline',
      'Homepage subline',
      'Two-line intro below the headline on the homepage.'
    ),

    // ── About page ─────────────────────────────────────────────────────
    i18nString(
      'aboutHeadline',
      'About headline',
      'H1 shown at the top of the about page.'
    ),
    i18nPortableText(
      'bio',
      'Bio',
      'Two short paragraphs in your voice. Shown on the about page hero.'
    ),
    defineField({
      name: 'beyondCode',
      title: 'Beyond code',
      type: 'array',
      description: 'Hobbies and interests shown in the "Beyond code" section of the about page.',
      of: [
        {
          type: 'object',
          fields: [
            i18nString('title', 'Title'),
            i18nText('body', 'Body'),
          ],
          preview: {
            select: {title: 'title.en'},
          },
        },
      ],
    }),

    // ── CV files ───────────────────────────────────────────────────────
    defineField({
      name: 'cvEn',
      title: 'CV (English)',
      type: 'file',
      description: 'English CV as PDF.',
      options: {accept: 'application/pdf'},
    }),
    defineField({
      name: 'cvNl',
      title: 'CV (Dutch)',
      type: 'file',
      description: 'Dutch CV as PDF. Falls back to the English version if empty.',
      options: {accept: 'application/pdf'},
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      description: 'Photo or illustration shown on the about page hero. Square crop works best.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City and country (e.g. "Edegem, BE").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Primary contact email — shown as the hero CTA in the contact footer.',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      description: 'LinkedIn, GitHub, Instagram, etc. Order matters — first item appears first.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'What to show in the UI (e.g. "LinkedIn", "GitHub").',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({scheme: ['http', 'https', 'mailto']}),
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'url'},
          },
        },
      ],
    }),
    defineField({
      name: 'vatNumber',
      title: 'VAT number',
      type: 'string',
      description: 'Belgian VAT number shown in the footer (e.g. "BE 0708.091.5524").',
    }),
    defineField({
      name: 'copyrightYear',
      title: 'Copyright start year',
      type: 'number',
      description: 'The year your business started. Used to compute the "© YEAR–now" range in the footer.',
      validation: (Rule) => Rule.required().min(2000).max(new Date().getFullYear()),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Profile', subtitle: 'Bio, contact info, and site metadata'}),
  },
})
