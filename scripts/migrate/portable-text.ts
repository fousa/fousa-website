/**
 * Converts a plain-text body (paragraphs separated by blank lines) into
 * the Portable Text block array shape Sanity expects.
 *
 * Each non-empty paragraph becomes one block with a single span. No
 * formatting marks are applied — the source markdown only contains
 * plain paragraphs. Editors can add emphasis/links later in the Studio.
 */
import {randomUUID} from 'node:crypto'

type PtSpan = {_type: 'span'; _key: string; text: string; marks: string[]}
type PtBlock = {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: never[]
  children: PtSpan[]
}

/**
 * @param text - Plain text with paragraphs separated by one or more blank lines
 * @returns An array of Portable Text blocks (empty if input is whitespace-only)
 */
export function toPortableText(text: string): PtBlock[] {
  return text
    .trim()
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      _type: 'block',
      _key: randomUUID().slice(0, 12),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: randomUUID().slice(0, 12),
          text: paragraph,
          marks: [],
        },
      ],
    }))
}

/**
 * Builds a Portable Text i18n object: {en: [...blocks], nl?: [...blocks]}
 */
export function toPortableTextI18n(en: string, nl?: string) {
  return nl
    ? {en: toPortableText(en), nl: toPortableText(nl)}
    : {en: toPortableText(en)}
}
