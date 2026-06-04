/**
 * Skill category — collection document.
 *
 * Groups stack tags on the About "Skills" section. Each category carries a
 * translatable display label; its position is set by dragging rows in the
 * Studio list, stored in a hidden `orderRank` (lexorank) field. Stack tags
 * point here via a reference, so adding, renaming, reordering, or removing a
 * category is pure Studio work — no code change. Tags with no category
 * reference collect under a code-side "Other" bucket.
 */
import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
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
    // Hidden field holding the drag-ordered position (managed by the list view).
    orderRankField({type: 'skillCategory'}),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {title: 'title.en'},
    prepare: ({title}) => ({title}),
  },
})
