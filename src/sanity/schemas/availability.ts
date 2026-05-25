/**
 * Availability — singleton document.
 *
 * Drives the "Available · Hire me" pill in the top bar. One of three states:
 * available, booked, or booked-with-next-opening. Edited as the freelance
 * situation changes; every page picks up the change automatically.
 */
import {defineField, defineType} from 'sanity'
import {i18nString} from '@/sanity/fields/i18n'

export const availability = defineType({
  name: 'availability',
  title: 'Availability',
  type: 'document',
  description: 'Current freelance status — drives the green pill in the top bar.',
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Which state to render in the top bar.',
      options: {
        list: [
          {title: 'Available', value: 'available'},
          {title: 'Booked', value: 'booked'},
          {title: 'Booked, next opening known', value: 'next-opening'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'available',
    }),
    i18nString(
      'label',
      'Pill label',
      'The text inside the green pill. Examples: "Available · Oct 2026", "Booked through Q1 2027", "Next opening: March".'
    ),
    defineField({
      name: 'nextOpening',
      title: 'Next opening date',
      type: 'date',
      description: 'Only used when status is "next-opening". Lets the site sort or surface upcoming availability.',
      hidden: ({document}) => document?.status !== 'next-opening',
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
