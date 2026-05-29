/**
 * timelineEntry — a single row on the About "Loopbaan" list.
 *
 * One model covers three groups (freelance, employed, education), discriminated
 * by `group`. Generic field names (`organisation`, `title`) fit a company+role,
 * a school+degree, and an own freelance practice alike. An empty `endDate` means
 * the entry is ongoing (renders the coral live dot + "→ nu").
 */
import {defineField, defineType} from 'sanity'
import {i18nText} from '@/sanity/fields/i18n'

export const timelineEntry = defineType({
  name: 'timelineEntry',
  title: 'Timeline entry',
  type: 'document',
  fields: [
    defineField({
      name: 'organisation',
      title: 'Organisation',
      type: 'string',
      description: 'Company, school, or own practice (e.g. "icapps", "KH Leuven", "Fousa").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Role for work, or degree/programme for education.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'string',
      description: 'Which section it appears under on the About page.',
      options: {
        list: [
          {title: 'Freelance', value: 'freelance'},
          {title: 'Employed', value: 'employed'},
          {title: 'Education', value: 'education'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Start date',
      type: 'date',
      options: {dateFormat: 'YYYY-MM'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End date',
      type: 'date',
      description: 'Leave empty for an ongoing entry (renders "→ nu" with the live dot).',
      options: {dateFormat: 'YYYY-MM'},
    }),
    i18nText('description', 'Description', 'Optional one-line description (EN required / NL optional).'),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Optional (e.g. "Antwerpen").',
    }),
    defineField({
      name: 'order',
      title: 'Order tiebreak',
      type: 'number',
      description: 'Optional. Higher = higher within the same start date. Usually leave empty.',
    }),
  ],
  preview: {
    select: {title: 'organisation', subtitle: 'title', group: 'group'},
    prepare: ({title, subtitle, group}) => ({title, subtitle: `${group} · ${subtitle}`}),
  },
})
