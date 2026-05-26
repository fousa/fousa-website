/**
 * Slugify a string into a stable, URL-safe identifier suitable for use
 * as part of a Sanity document _id.
 *
 * Used to build deterministic document IDs so re-runs of the migration
 * are idempotent — same name in, same _id out, createOrReplace updates
 * the existing doc rather than creating a duplicate.
 *
 * @param value - The string to slugify (e.g. "Ruby on Rails", "icapps")
 * @returns A lowercase kebab-case string with non-alphanumerics stripped
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}
