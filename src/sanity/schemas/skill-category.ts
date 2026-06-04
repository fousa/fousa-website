/**
 * Skill category — collection document.
 *
 * Groups stack tags on the About "Skills" section. Each category carries a
 * translatable display label and an `order` that fixes where it appears in the
 * list. Stack tags point here via a reference, so adding, renaming, reordering,
 * or removing a category is pure Studio work — no code change. Tags with no
 * category reference collect under a code-side "Other" bucket.
 */
import {defineField, defineType} from 'sanity'
import {i18nString} from '@/sanity/fields/i18n'

export const skillCategory = defineType({
  name: 'skillCategory',
  title: 'Skill category',
  type: 'document',
  description: 'A grouping for skills on the About page (e.g. "Languages", "Frameworks").',
  fields: [
    i18nString('title', 'Title', 'Shown as the group label on the About page (EN required / NL optional).'),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Stable identifier used in code and links. Generated from the English title.',
      options: {source: 'title.en', maxLength: 32},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first. Ties fall back to the English title.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title.en', order: 'order'},
    prepare: ({title, order}) => ({title, subtitle: `Order ${order}`}),
  },
})
