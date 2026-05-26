/**
 * Project — collection document.
 *
 * The workhorse. Each Project is a row in the homepage log AND a case study
 * panel that expands inline. Most fields are optional — a thin row with just
 * name/year/client renders fine and just hides its chevron (no expand
 * affordance for empty case studies).
 *
 * Fields are grouped into three Studio tabs: Basics, Case study, Links.
 */
import {defineField, defineType} from 'sanity'
import {i18nString, i18nText, i18nPortableText} from '@/sanity/fields/i18n'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  description: 'A single project — appears as a row in the log and, if filled out, as a case study panel.',
  groups: [
    {name: 'basics', title: 'Basics', default: true},
    {name: 'caseStudy', title: 'Case study'},
    {name: 'links', title: 'Links'},
  ],
  fields: [
    // — Basics tab
    defineField({
      name: 'name',
      title: 'Project name',
      type: 'string',
      group: 'basics',
      description: 'The product or project name (e.g. "itsme", "AvioBook").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basics',
      description: 'URL-safe identifier used for deep links — fousa.be/en/<slug> and #<slug>.',
      options: {source: 'name', maxLength: 64},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'employer',
      title: 'Employer',
      type: 'reference',
      group: 'basics',
      to: [{type: 'employer'}],
      description: 'Where you worked when this was built. For freelance work through Fousa, this is Fousa. For agency work, the agency.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'End client',
      type: 'string',
      group: 'basics',
      description: 'The end customer, when different from the employer. E.g. employer "icapps", client "Telenet". Leave empty if the employer was also the client.',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      group: 'basics',
      description: 'Your role on this specific project (e.g. "Senior Lead", "Expert iOS", "Owner").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      group: 'basics',
      description: 'Year the project started — used to sort and group in the log.',
      validation: (Rule) => Rule.required().min(1990).max(new Date().getFullYear() + 1),
    }),
    defineField({
      name: 'endYear',
      title: 'End year',
      type: 'number',
      group: 'basics',
      description: 'Leave empty for ongoing projects.',
      validation: (Rule) =>
        Rule.min(1990)
          .max(new Date().getFullYear() + 1)
          .custom((endYear, context) => {
            const start = (context.document?.year as number | undefined) ?? 0
            if (endYear && endYear < start) return 'End year must be after start year.'
            return true
          }),
    }),
    defineField({
      name: 'engagement',
      title: 'Engagement type',
      type: 'string',
      group: 'basics',
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
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      group: 'basics',
      description: 'Where this project stands today. Drives the colored status dot.',
      options: {
        list: [
          {title: 'Live', value: 'live'},
          {title: 'Done', value: 'done'},
          {title: 'Paused', value: 'paused'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'done',
    }),
    defineField({
      name: 'stack',
      title: 'Stack tags',
      type: 'array',
      group: 'basics',
      description: 'Technologies used. First tag determines the primary chip shown in the table row.',
      of: [{type: 'reference', to: [{type: 'stackTag'}]}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'featured',
      title: 'Featured?',
      type: 'boolean',
      group: 'basics',
      description: 'Featured projects appear higher in the log and on the about page "selected work" section.',
      initialValue: false,
    }),

    // — Case study tab
    i18nString(
      'deck',
      'Deck',
      'One-line elevator pitch shown in italic at the top of the expanded panel. Skip to hide the expand.'
    ),
    i18nPortableText(
      'description',
      'Description',
      'Two short paragraphs of context — problem and approach.'
    ),
    defineField({
      name: 'screenshots',
      title: 'Screenshots',
      type: 'array',
      group: 'caseStudy',
      description: 'Two or three images shown in the expanded panel. Hotspot determines the focal point for thumbnails.',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Required for accessibility.',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),
    i18nText(
      'outcome',
      'Outcome',
      'Optional metric or sentence (e.g. "Several million daily users"). Shown in bold in the panel.'
    ),

    // — Links tab
    defineField({
      name: 'liveUrl',
      title: 'Live URL',
      type: 'url',
      group: 'links',
      description: 'Link to the live product, if public.',
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      group: 'links',
      description: 'Source repo, if open source.',
    }),
    defineField({
      name: 'writeupUrl',
      title: 'Writeup URL',
      type: 'url',
      group: 'links',
      description: 'External case study, blog post, or press article — opens in a new tab.',
    }),
  ],
  orderings: [
    {
      title: 'Most recent first',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}, {field: 'name', direction: 'asc'}],
    },
    {
      title: 'Featured first',
      name: 'featuredFirst',
      by: [{field: 'featured', direction: 'desc'}, {field: 'year', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      name: 'name',
      year: 'year',
      employerName: 'employer.name',
      state: 'state',
      cover: 'screenshots.0',
    },
    prepare: ({name, year, employerName, state, cover}) => ({
      title: name,
      subtitle: `${year} · ${employerName ?? '?'} · ${state ?? '?'}`,
      media: cover,
    }),
  },
})
