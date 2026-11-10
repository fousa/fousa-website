/**
 * KMO page — singleton document.
 *
 * Everything on the unlisted `/nl/kmo` page (software packages for small
 * businesses) and on its printable sales sheets: hero copy, the packages with
 * their prices and features, the steps of an engagement, reasons, FAQ and the
 * contact panel. Dutch only, so plain strings rather than the i18n fields.
 *
 * The sales-sheet PDFs are generated from this document by `pnpm kmo:pdf`,
 * which uploads them back into the `sheetPdf` / `allSheetsPdf` file fields.
 * Re-run it after changing anything that appears on a sheet.
 */
import {defineArrayMember, defineField, defineType} from 'sanity'

/** The decorative device mock a package card and sheet show. */
export const KMO_MOCKS = [
  {title: 'Phone (field app)', value: 'phone'},
  {title: 'Browser: client portal', value: 'portal'},
  {title: 'Browser: internal tool', value: 'tool'},
]

const titleBody = (name: string, title: string, bodyTitle = 'Body') =>
  defineArrayMember({
    name,
    title,
    type: 'object',
    fields: [
      defineField({name: 'title', title: 'Title', type: 'string', validation: (R) => R.required()}),
      defineField({
        name: 'body',
        title: bodyTitle,
        type: 'text',
        rows: 3,
        validation: (R) => R.required(),
      }),
    ],
  })

const euro = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'number',
    description,
    validation: (R) => R.required().integer().positive(),
  })

export const kmoPage = defineType({
  name: 'kmoPage',
  title: 'KMO page',
  type: 'document',
  description: 'Content of the unlisted /nl/kmo page and its sales-sheet PDFs.',
  groups: [
    {name: 'intro', title: 'Intro', default: true},
    {name: 'packages', title: 'Packages'},
    {name: 'process', title: 'Steps, reasons & FAQ'},
    {name: 'contact', title: 'Contact'},
  ],
  fields: [
    // ── Intro ────────────────────────────────────────────────────────────
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      group: 'intro',
      description: 'Small mono line above the title, also on the share card.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'intro',
      description: 'Page heading, browser title and share-card title. The coral dot is added.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 2,
      group: 'intro',
      description: 'Search/share description and the share-card deck.',
      validation: (R) => R.required().max(200),
    }),
    defineField({
      name: 'intro',
      title: 'Intro paragraph',
      type: 'text',
      rows: 3,
      group: 'intro',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'overviewNote',
      title: 'Overview note',
      type: 'string',
      group: 'intro',
      description: 'Line under the package overview in the hero.',
    }),

    // ── Packages ─────────────────────────────────────────────────────────
    defineField({
      name: 'packages',
      title: 'Packages',
      type: 'array',
      group: 'packages',
      description: 'In display order; numbering (01, 02, …) and anchors follow this order.',
      validation: (R) => R.required().min(1),
      of: [
        defineArrayMember({
          name: 'kmoPackage',
          title: 'Package',
          type: 'object',
          groups: [
            {name: 'page', title: 'Page', default: true},
            {name: 'sheet', title: 'Sales sheet'},
          ],
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              group: 'page',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'shortName',
              title: 'Short name',
              type: 'string',
              group: 'sheet',
              description: 'Sheet header and PDF filename. Falls back to the name.',
            }),
            defineField({
              name: 'summary',
              title: 'Summary',
              type: 'text',
              rows: 2,
              group: 'page',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'audience',
              title: 'Audience',
              type: 'string',
              group: 'page',
              description: 'E.g. "Voor installateurs, technici en inspecteurs".',
            }),
            defineField({
              name: 'features',
              title: 'Features',
              type: 'array',
              group: 'page',
              of: [
                defineArrayMember({
                  name: 'feature',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'name',
                      title: 'Name',
                      type: 'string',
                      validation: (R) => R.required(),
                    }),
                    defineField({
                      name: 'detail',
                      title: 'Detail',
                      type: 'string',
                      validation: (R) => R.required(),
                    }),
                    defineField({
                      name: 'sheetOnly',
                      title: 'Sales sheet only',
                      type: 'boolean',
                      description: 'Listed on the PDF but not on the page.',
                      initialValue: false,
                    }),
                  ],
                  preview: {
                    select: {title: 'name', subtitle: 'detail', sheetOnly: 'sheetOnly'},
                    prepare: ({title, subtitle, sheetOnly}) => ({
                      title: sheetOnly ? `${title} (sheet only)` : title,
                      subtitle,
                    }),
                  },
                }),
              ],
            }),
            euro('priceFrom', 'Build price from (€)', 'Excl. VAT, whole euros.'),
            euro('priceTo', 'Build price to (€)'),
            euro('maintenanceFrom', 'Maintenance & hosting from (€/month)'),
            defineField({
              name: 'mock',
              title: 'Device mock',
              type: 'string',
              group: 'page',
              options: {list: KMO_MOCKS, layout: 'radio'},
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'sheetHeadline',
              title: 'Sheet headline',
              type: 'string',
              group: 'sheet',
              description: 'Large heading on the PDF. Falls back to the summary.',
            }),
            defineField({
              name: 'sheetIntro',
              title: 'Sheet intro',
              type: 'text',
              rows: 2,
              group: 'sheet',
              description: 'Paragraph under the headline. Falls back to the audience.',
            }),
            defineField({
              name: 'painPoints',
              title: 'Pain points ("Herken je dit?")',
              type: 'array',
              group: 'sheet',
              of: [{type: 'string'}],
              validation: (R) => R.max(4),
            }),
            defineField({
              name: 'stepNotes',
              title: 'Step notes',
              type: 'array',
              group: 'sheet',
              description:
                'One short line per step (same order as the steps), shown in the sheet’s timeline.',
              of: [{type: 'string'}],
            }),
            defineField({
              name: 'ownershipNote',
              title: 'Ownership note',
              type: 'string',
              group: 'sheet',
              description: 'Follows "Alle prijzen exclusief btw." in the price block.',
            }),
            defineField({
              name: 'sheetPdf',
              title: 'Sales sheet PDF',
              type: 'file',
              group: 'sheet',
              readOnly: true,
              description: 'Generated by `pnpm kmo:pdf`; re-run it after editing this package.',
              options: {accept: 'application/pdf'},
            }),
          ],
          validation: (R) =>
            R.custom((pkg: {priceFrom?: number; priceTo?: number} | undefined) =>
              pkg?.priceFrom && pkg?.priceTo && pkg.priceFrom > pkg.priceTo
                ? 'The "from" price is higher than the "to" price.'
                : true,
            ),
          preview: {
            select: {title: 'name', from: 'priceFrom', to: 'priceTo'},
            prepare: ({title, from, to}) => ({
              title,
              subtitle: from && to ? `€${from} – €${to}` : undefined,
            }),
          },
        }),
      ],
    }),

    // ── Steps, reasons & FAQ ─────────────────────────────────────────────
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'process',
      description: 'How an engagement runs. The first step gets the coral dot.',
      of: [titleBody('step', 'Step')],
    }),
    defineField({
      name: 'reasons',
      title: 'Reasons ("Waarom met mij")',
      type: 'array',
      group: 'process',
      of: [
        defineArrayMember({
          name: 'reason',
          title: 'Reason',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (R) => R.required()}),
            defineField({name: 'body', title: 'Body', type: 'text', rows: 3, validation: (R) => R.required()}),
            defineField({name: 'linkLabel', title: 'Link label', type: 'string'}),
            defineField({
              name: 'linkHref',
              title: 'Link',
              type: 'string',
              description: 'A site path ("/nl/about") or a full URL.',
              validation: (R) =>
                R.custom((href: string | undefined, ctx) => {
                  const label = (ctx.parent as {linkLabel?: string} | undefined)?.linkLabel
                  if (label && !href) return 'Add a link for the label, or clear the label.'
                  if (href && !/^(\/|https?:\/\/)/.test(href)) return 'Start with "/" or "https://".'
                  return true
                }),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      group: 'process',
      of: [
        defineArrayMember({
          name: 'faqItem',
          title: 'Question',
          type: 'object',
          fields: [
            defineField({name: 'question', title: 'Question', type: 'string', validation: (R) => R.required()}),
            defineField({name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (R) => R.required()}),
          ],
          preview: {select: {title: 'question', subtitle: 'answer'}},
        }),
      ],
    }),

    // ── Contact ──────────────────────────────────────────────────────────
    defineField({
      name: 'contactTitle',
      title: 'Call to action',
      type: 'string',
      group: 'contact',
      description: 'Contact-panel heading, also the hero and sheet button ("Plan een verkenning").',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'contactBadge',
      title: 'Availability line',
      type: 'string',
      group: 'contact',
      description: 'Next to the green dot above the heading.',
    }),
    defineField({
      name: 'contactBody',
      title: 'Contact paragraph',
      type: 'text',
      rows: 3,
      group: 'contact',
    }),
    defineField({
      name: 'email',
      title: 'Contact email',
      type: 'string',
      group: 'contact',
      description: 'On the page and the PDFs. Leave empty to use the email from Site settings.',
      validation: (R) => R.email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone number',
      type: 'string',
      group: 'contact',
      description: 'Written as it should appear, e.g. "+32 470 12 34 56". Leave empty to hide it.',
      validation: (R) =>
        R.regex(/^\+?[0-9 ()./-]{6,}$/, {name: 'phone number'}).warning(
          'Use digits, spaces and an optional leading +.',
        ),
    }),
    defineField({
      name: 'allSheetsPdf',
      title: 'All sales sheets (PDF)',
      type: 'file',
      group: 'contact',
      readOnly: true,
      description: 'Every package in one file. Generated by `pnpm kmo:pdf`.',
      options: {accept: 'application/pdf'},
    }),
  ],
  preview: {
    select: {title: 'title', packages: 'packages'},
    prepare: ({title, packages}) => ({
      title: 'KMO page',
      subtitle: [title, packages?.length ? `${packages.length} packages` : null]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
