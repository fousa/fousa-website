/**
 * Helpers for defining translatable fields on Sanity schemas.
 *
 * The @sanity/document-internationalization plugin handles document-level
 * translations (one document per language with a reference to its sibling).
 * For field-level helpers — short strings and rich text where we want both
 * locales side-by-side in the same document — we use these factories.
 *
 * Convention: every translatable field is an object with `en` and `nl`
 * sub-fields. The `en` field is required; `nl` is optional and falls back
 * to `en` when missing at render time.
 */
import {defineField, defineType, type FieldDefinition} from 'sanity'

/**
 * Build a translatable string field (single-line text input per locale).
 *
 * @param name - The field name on the parent document
 * @param title - Human-readable label shown in the Studio
 * @param description - Optional helper text shown beneath the field in the Studio
 * @returns A Sanity field definition with `en` and `nl` sub-fields
 */
export function i18nString(
  name: string,
  title: string,
  description?: string
): FieldDefinition {
  return defineField({
    name,
    title,
    type: 'object',
    description,
    fields: [
      defineField({
        name: 'en',
        title: 'English',
        type: 'string',
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: 'nl',
        title: 'Nederlands',
        type: 'string',
      }),
    ],
  })
}

/**
 * Build a translatable text field (multi-line text area per locale).
 *
 * Use for short paragraphs — decks, captions, outcomes. For long-form rich
 * text with formatting, use `i18nPortableText` instead.
 */
export function i18nText(
  name: string,
  title: string,
  description?: string
): FieldDefinition {
  return defineField({
    name,
    title,
    type: 'object',
    description,
    fields: [
      defineField({
        name: 'en',
        title: 'English',
        type: 'text',
        rows: 3,
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: 'nl',
        title: 'Nederlands',
        type: 'text',
        rows: 3,
      }),
    ],
  })
}

/**
 * Build a translatable Portable Text field (rich text with formatting).
 *
 * Use for case study bodies, employer descriptions, profile bios — anywhere
 * the content needs paragraphs, links, and emphasis.
 */
export function i18nPortableText(
  name: string,
  title: string,
  description?: string
): FieldDefinition {
  // Inline portable text block config: paragraphs only, plus marks for
  // emphasis, strong, and links. Keep it minimal — case studies don't
  // need headings inside the body.
  const blockField = defineType({
    name: 'block',
    type: 'block',
    styles: [{title: 'Normal', value: 'normal'}],
    lists: [],
    marks: {
      decorators: [
        {title: 'Emphasis', value: 'em'},
        {title: 'Strong', value: 'strong'},
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            defineField({
              name: 'href',
              type: 'url',
              title: 'URL',
              validation: (Rule) => Rule.required().uri({scheme: ['http', 'https', 'mailto']}),
            }),
          ],
        },
      ],
    },
  })

  return defineField({
    name,
    title,
    type: 'object',
    description,
    fields: [
      defineField({
        name: 'en',
        title: 'English',
        type: 'array',
        of: [blockField],
        validation: (Rule) => Rule.required().min(1),
      }),
      defineField({
        name: 'nl',
        title: 'Nederlands',
        type: 'array',
        of: [blockField],
      }),
    ],
  })
}
