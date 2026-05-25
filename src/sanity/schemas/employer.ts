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
      name: 'startYear',
      title: 'Start year',
      type: 'number',
      validation: (Rule) => Rule.required().min(1990).max(new Date().getFullYear()),
    }),
    defineField({
      name: 'endYear',
      title: 'End year',
      type: 'number',
      description: 'Leave empty if you still work here.',
      validation: (Rule) =>
        Rule.min(1990)
          .max(new Date().getFullYear())
          .custom((endYear, context) => {
            const start = (context.document?.startYear as number | undefined) ?? 0
            if (endYear && endYear < start) return 'End year must be after start year.'
            return true
          }),
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
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Used when two entries share a year. Higher number appears first. Leave empty to sort by year only.',
    }),
  ],
  orderings: [
    {
      title: 'Most recent first',
      name: 'startYearDesc',
      by: [{field: 'startYear', direction: 'desc'}, {field: 'order', direction: 'desc'}],
    },
  ],
  preview: {
    select: {name: 'name', role: 'role', startYear: 'startYear', endYear: 'endYear'},
    prepare: ({name, role, startYear, endYear}) => ({
      title: name,
      subtitle: `${role} · ${startYear}${endYear ? `–${endYear}` : ' — now'}`,
    }),
  },
})
