/**
 * Static UI strings, indexed by locale.
 *
 * These are labels that aren't editor-driven — section headings, button
 * labels, accessibility text. Editor-driven content lives in Sanity.
 *
 * When adding a new key, add it to both locales. TypeScript will flag
 * incomplete additions thanks to the const-asserted shape.
 */
import type {Locale} from './config'

export const messages = {
  en: {
    about: 'About',
    allProjects: 'All projects',
    available: 'Available',
    booked: 'Booked',
    careerSoFar: 'Career so far',
    client: 'Client',
    employer: 'Employer',
    hireMe: 'Hire me',
    live: 'live',
    done: 'done',
    paused: 'paused',
    cancelled: 'cancelled',
    project: 'Project',
    role: 'Role',
    stack: 'Stack',
    state: 'State',
    year: 'Year',
  },
  nl: {
    about: 'Over',
    allProjects: 'Alle projecten',
    available: 'Beschikbaar',
    booked: 'Volgeboekt',
    careerSoFar: 'Tot nu toe',
    client: 'Klant',
    employer: 'Werkgever',
    hireMe: 'Huur me in',
    live: 'live',
    done: 'klaar',
    paused: 'gepauzeerd',
    cancelled: 'geannuleerd',
    project: 'Project',
    role: 'Rol',
    stack: 'Stack',
    state: 'Status',
    year: 'Jaar',
  },
} as const satisfies Record<Locale, Record<string, string>>

export type MessageKey = keyof (typeof messages)['en']

/**
 * Lookup helper. Equivalent to `messages[locale][key]` but types the key
 * union for autocomplete.
 */
export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key]
}
