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
      to: [{type: 'timelineEntry'}],
      description: 'Who you were employed by (icapps, KBC). Leave empty for freelance/personal.',
      hidden: ({parent}) => parent?.engagement !== 'full-time',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      group: 'basics',
      description: 'Who the work was ultimately for (e.g. Telenet). Empty = your own project.',
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
      description:
        'Leave empty for a single-year project, or for an ongoing one — active/maintained projects with no end year show as “–present”.',
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
      description: 'How you were involved — drives homepage filters and the "For" column.',
      options: {
        list: [
          {title: 'Freelance', value: 'freelance'},
          {title: 'Full-time', value: 'full-time'},
          {title: 'Student', value: 'student'},
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
      description: 'What your relationship with this project is today.',
      options: {
        layout: 'radio',
        list: [
          {title: 'Active — actively developed', value: 'active'},
          {title: 'Maintained — up, no new features', value: 'maintained'},
          {title: 'Archived — closed chapter', value: 'archived'},
          {title: 'Cancelled — never shipped', value: 'cancelled'},
        ],
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
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
      name: 'isTool',
      title: 'Tool/utility?',
      type: 'boolean',
      group: 'basics',
      description: 'Tick for a tool or utility (e.g. an nvim config, or an internal icapps tool) — its "For" column reads "Tool". An employer/client still shows as a prefix, e.g. "icapps → Tool".',
      initialValue: false,
    }),

    // — Tooling
    defineField({
      name: 'featureTooling',
      title: 'Show tooling as a chip in the log',
      type: 'boolean',
      group: 'basics',
      description: 'Tick this only when the working method is part of the story. Adds a subtle "AI-assisted" chip next to the project name.',
      initialValue: false,
    }),

    // — Case study tab
    i18nText(
      'summary',
      'Summary',
      'Two-sentence teaser shown in the expanded log row. Plain text, no formatting.'
    ),
    i18nString(
      'deck',
      'Deck',
      'One-line elevator pitch shown in italic at the top of the expanded panel. Skip to hide the expand.'
    ),
    i18nPortableText(
      'body',
      'Case study body',
      'Full case study narrative — context, approach, outcome (use an "Outcome" heading). Shown on the dedicated /work/<slug> page. Leave empty for a tool/utility — the log row will instead link out to the source/live URL.'
    ),
    defineField({
      name: 'gallery',
      title: 'Gallery (screenshots)',
      type: 'array',
      group: 'caseStudy',
      description: 'Screenshots shown on the detail page when there\u2019s no full case study. Each image picks its own frame.',
      of: [
        {
          name: 'shot',
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'frame',
              title: 'Frame',
              type: 'string',
              initialValue: 'browser',
              options: {
                layout: 'radio',
                list: [
                  {title: 'Phone', value: 'phone'},
                  {title: 'Tablet', value: 'tablet'},
                  {title: 'Browser', value: 'browser'},
                  {title: 'None (bare image)', value: 'none'},
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            i18nString('caption', 'Caption'),
          ],
          preview: {
            select: {media: 'image', subtitle: 'frame'},
          },
        },
      ],
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      group: 'caseStudy',
      description: 'Hero image for the case study page. Landscape ratio works best.',
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
    }),

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
      description:
        'Source repository. For utilities/tools with no case study, this becomes the row\u2019s "Source \u2197" link in the log.',
    }),
  ],
  orderings: [
    {
      title: 'Most recent first',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}, {field: 'name', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      name: 'name',
      year: 'year',
      employerName: 'employer.name',
      state: 'state',
      cover: 'cover',
    },
    prepare: ({name, year, employerName, state, cover}) => ({
      title: name,
      subtitle: `${year} · ${employerName ?? '?'} · ${state ?? '?'}`,
      media: cover,
    }),
  },
})
