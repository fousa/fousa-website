/**
 * Empty-state messages — singleton document.
 *
 * Holds optional, hand-written overrides for the project-log empty state.
 * When the active filter set exactly matches an entry's `filters` (order
 * doesn't matter), that entry's headline + body replace the universal copy
 * from the i18n dictionary. Keep the list short — two or three combos that
 * are genuinely funny or informative; everything else falls back.
 */
import {defineArrayMember, defineField, defineType} from 'sanity'
import {i18nString, i18nText} from '@/sanity/fields/i18n'

export const emptyStates = defineType({
  name: 'emptyStates',
  title: 'Empty-state messages',
  type: 'document',
  description:
    'Optional per-combination copy for the "no projects match" state in the log.',
  fields: [
    defineField({
      name: 'overrides',
      title: 'Overrides per filter combination',
      type: 'array',
      description:
        'When the active filter set exactly matches this combo, the message below is used instead of the default. Order matters — first match wins.',
      of: [
        defineArrayMember({
          name: 'entry',
          type: 'object',
          fields: [
            defineField({
              name: 'filters',
              title: 'Filter keys',
              type: 'array',
              of: [{type: 'string'}],
              description:
                "Active filter keys, e.g. ['apple','web']. Order-independent. Valid keys: apple, web, active, freelance, icapps, 10to1.",
              validation: (Rule) => Rule.min(2),
            }),
            i18nString('headline', 'Headline'),
            i18nText('body', 'Body'),
          ],
          preview: {
            select: {filters: 'filters'},
            prepare: ({filters}) => ({
              title: Array.isArray(filters) ? filters.join(' + ') : 'Override',
            }),
          },
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Empty states'})},
})
