/**
 * Availability — singleton document.
 *
 * Drives the availability indicator in the contact panel. Three states:
 * available, after-hours, or unavailable. The `message` field is a localized
 * one-liner shown next to the coloured dot.
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
      'message',
      'Status message',
      'Short localized text shown next to the dot, e.g. "Available for projects" / "Beschikbaar voor projecten".'
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
    select: {status: 'status', message: 'message.en'},
    prepare: ({status, message}) => ({
      title: 'Availability',
      subtitle: `${status ?? 'unset'} — ${message ?? '(no message)'}`,
    }),
  },
})
