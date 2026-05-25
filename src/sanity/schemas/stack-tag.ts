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
      type: 'string',
      description: 'Which family this tag belongs to. Drives semantic chip colors in the UI.',
      options: {
        list: [
          {title: 'iOS', value: 'ios'},
          {title: 'Rails', value: 'rails'},
          {title: 'Frontend', value: 'frontend'},
          {title: 'Tooling', value: 'tooling'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'ios',
    }),
  ],
  orderings: [
    {
      title: 'Category, then name',
      name: 'categoryAndName',
      by: [{field: 'category', direction: 'asc'}, {field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {name: 'name', category: 'category'},
    prepare: ({name, category}) => ({title: name, subtitle: category}),
  },
})
