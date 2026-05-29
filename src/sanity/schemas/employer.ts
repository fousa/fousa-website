/**
 * Employer — collection document.
 *
 * Represents both your employers and your freelance entity (Fousa itself is one).
 * Drives the career timeline on the about page. Projects reference an Employer
 * so the timeline can show what was built where.
 */
import {defineField, defineType} from 'sanity'
import {i18nText} from '@/sanity/fields/i18n'

export const employer = defineType({
  name: 'employer',
  title: 'Employer',
  type: 'document',
  description: 'A job, a client, or your own freelance entity. Career timeline entries on the about page.',
  fields: [
    defineField({
      name: 'name',
      title: 'Employer name',
      type: 'string',
      description: 'How the employer or client is known publicly (e.g. "itsme", "icapps", "Fousa").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'Your title there (e.g. "Senior iOS Lead", "Owner").',
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
      options: {dateFormat: 'YYYY-MM'},
      description: 'Leave empty if you still work here.',
    }),
    defineField({
      name: 'pinned',
      title: 'Pin to top',
      type: 'boolean',
      initialValue: false,
      description: 'Pin above the chronological list as the ongoing umbrella (Fousa).',
    }),
    defineField({
      name: 'engagement',
      title: 'Engagement type',
      type: 'string',
      options: {
        list: [
          {title: 'Freelance', value: 'freelance'},
          {title: 'Full-time', value: 'full-time'},
          {title: 'Owner', value: 'owner'},
          {title: 'Internship', value: 'internship'},
          {title: 'Holiday', value: 'holiday'},
          {title: 'Education', value: 'education'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    i18nText(
      'description',
      'Description',
      'Optional one or two sentences about what this role was. Shown on hover or in the expanded employer view.'
    ),
  ],
  orderings: [
    {
      title: 'Most recent first',
      name: 'startDateDesc',
      by: [{field: 'startDate', direction: 'desc'}],
    },
  ],
  preview: {
    select: {name: 'name', role: 'role', startDate: 'startDate', endDate: 'endDate', pinned: 'pinned'},
    prepare: ({name, role, startDate, endDate, pinned}) => {
      const startYear = startDate ? new Date(startDate).getFullYear() : '?'
      const endLabel = endDate ? `–${new Date(endDate).getFullYear()}` : ' — now'
      return {
        title: `${pinned ? '📌 ' : ''}${name}`,
        subtitle: `${role} · ${startYear}${endLabel}`,
      }
    },
  },
})
