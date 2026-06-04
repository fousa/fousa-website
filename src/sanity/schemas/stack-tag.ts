/**
 * Stack tag — collection document.
 *
 * Technology labels referenced by projects (Swift, SwiftUI, Rails, etc.).
 * Using references rather than free strings prevents typos and lets the
 * site aggregate ("show me everything built with Rails"). Seeded once,
 * rarely added to.
 */
import {defineField, defineType} from 'sanity'

export const stackTag = defineType({
  name: 'stackTag',
  title: 'Stack tag',
  type: 'document',
  description: 'A technology label that projects can reference (e.g. "Swift", "Rails").',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Display name as it appears in chips (e.g. "SwiftUI", not "swiftui").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-safe identifier used in filter URLs (e.g. fousa.be/en/?stack=swiftui).',
      options: {source: 'name', maxLength: 32},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'skillCategory'}],
      description: 'Groups this skill on the About page. Leave empty to park it under “Other”.',
    }),
  ],
  orderings: [
    {
      title: 'Name A–Z',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {name: 'name'},
    prepare: ({name}) => ({title: name}),
  },
})
