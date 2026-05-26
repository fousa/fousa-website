/**
 * Reads a single markdown file and returns its frontmatter + body.
 *
 * Thin wrapper around gray-matter that gives us typed access. The caller
 * is responsible for validating that the frontmatter matches the expected
 * shape — we keep this loose so weird files surface as obvious errors
 * rather than silently dropping fields.
 */
import {readFile} from 'node:fs/promises'
import matter from 'gray-matter'

export type ParsedMarkdown<T> = {
  data: T
  body: string
  filePath: string
}

/**
 * @param filePath - Absolute path to a markdown file
 * @returns Parsed frontmatter data and body string
 */
export async function readMarkdown<T = Record<string, unknown>>(
  filePath: string
): Promise<ParsedMarkdown<T>> {
  const raw = await readFile(filePath, 'utf8')
  const parsed = matter(raw)
  return {
    data: parsed.data as T,
    body: parsed.content,
    filePath,
  }
}

/**
 * Extracts a 4-digit year from a "YYYY-MM" date string. Returns undefined
 * for empty strings, "Present", or anything else unparseable — the migration
 * uses undefined to mean "ongoing" downstream.
 */
export function yearFromDate(date: string | undefined): number | undefined {
  if (!date || date === 'Present') return undefined
  const match = /^(\d{4})/.exec(date.trim())
  return match ? parseInt(match[1], 10) : undefined
}
