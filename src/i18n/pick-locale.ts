/**
 * Picks the right sub-field from an i18n object ({en, nl?}), with fallback
 * to English if the requested locale is missing.
 *
 * Used everywhere we render content from Sanity — every translatable field
 * stored via the i18nString/i18nText/i18nPortableText helpers conforms to
 * this shape.
 */
import type {Locale} from './config'

/**
 * @param value - An i18n object, or null/undefined if the field wasn't set
 * @param locale - The locale to prefer
 * @returns The localized value, or null if the field is missing entirely
 */
export function pickLocale<T>(
  value: {en?: T | null; nl?: T | null} | null | undefined,
  locale: Locale
): T | null {
  if (!value) return null
  const preferred = value[locale]
  if (preferred !== null && preferred !== undefined) return preferred
  return value.en ?? null
}
