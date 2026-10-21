/**
 * Locale registry: the supported locales, the unprefixed default (English),
 * and the `isLocale` guard the proxy and layouts use to validate URL segments.
 */
export const locales = ['en', 'nl'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
