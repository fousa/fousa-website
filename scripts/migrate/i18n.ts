/**
 * Builds the {en, nl?} object shape that our field-level i18n helpers expect.
 *
 * The migration only has English content; Dutch fields stay undefined and
 * fall back to English at render time until manually translated.
 *
 * @param en - English text (required)
 * @param nl - Optional Dutch text
 * @returns An object Sanity can store in an i18n field
 */
export function i18n(en: string, nl?: string): {en: string; nl?: string} {
  return nl ? {en, nl} : {en}
}
