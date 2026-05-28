/**
 * Availability — singleton document.
 *
 * Drives the availability indicator in the contact panel. Three states:
 * available, after-hours, or unavailable. The `detail` field is a localized
 * one-liner (e.g. "from Q3 2026") that renders next to the status label.
 */
import {defineField, defineType} from 'sanity'
import {i18nString} from '@/sanity/fields/i18n'

export const availability = defineType({
  name: 'availability',
  title: 'Availability',
  type: 'document',
  description: 'Current freelance status — drives the coloured dot + label in the contact panel.',
  fields: [
    defineField({
      name: 'status',
      title: 'Availability status',
      type: 'string',
      description: 'Drives the coloured dot + label in the contact panel.',
      options: {
        layout: 'radio',
        list: [
          {title: 'Available for projects', value: 'available'},
          {title: 'Open to after-hours work', value: 'after-hours'},
          {title: 'Not available right now (full)', value: 'unavailable'},
        ],
      },
      initialValue: 'available',
      validation: (Rule) => Rule.required(),
    }),
    i18nString(
      'label',
      'Pill label',
      'The text inside the green pill. Examples: "Available · Oct 2026", "Booked through Q1 2027", "Next opening: March".'
    ),
    i18nString(
      'detail',
      'Detail line',
      'Optional localized one-liner shown after the status label, e.g. "from Q3 2026" / "vanaf Q3 2026".'
    ),
    defineField({
      name: 'nextOpening',
      title: 'Next opening date',
      type: 'date',
      description: 'Only used when status is "after-hours" or "unavailable". Lets the site surface upcoming availability.',
      hidden: ({document}) => document?.status === 'available',
    }),
  ],
  preview: {
    select: {status: 'status', label: 'label.en'},
    prepare: ({status, label}) => ({
      title: 'Availability',
      subtitle: `${status ?? 'unset'} — ${label ?? '(no label)'}`,
    }),
  },
})
