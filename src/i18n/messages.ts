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
    cancelled: 'cancelled',
    careerSoFar: 'Career so far',
    caseStudy: 'Case study',
    client: 'Client',
    closeRow: 'Close',
    copyLink: 'Copy link',
    done: 'done',
    employer: 'Employer',
    escapeToClose: 'ESC to close',
    filterBy: 'Filter by',
    freelance: 'Freelance',
    fullTime: 'Full-time',
    hireMe: 'Hire me',
    internship: 'Internship',
    live: 'live',
    liveLink: 'View live',
    noProjectsFound: 'No projects match these filters.',
    outcome: 'Outcome',
    owner: 'Owner',
    paused: 'paused',
    project: 'Project',
    readMore: 'Read full case study',
    resetFilters: 'Reset filters',
    role: 'Role',
    showAll: 'Show all',
    stack: 'Stack',
    state: 'State',
    viewSource: 'View source',
    viewWriteup: 'View writeup',
    year: 'Year',
  },
  nl: {
    about: 'Over',
    allProjects: 'Alle projecten',
    available: 'Beschikbaar',
    booked: 'Volgeboekt',
    cancelled: 'geannuleerd',
    careerSoFar: 'Tot nu toe',
    caseStudy: 'Case study',
    client: 'Klant',
    closeRow: 'Sluiten',
    copyLink: 'Link kopiëren',
    done: 'klaar',
    employer: 'Werkgever',
    escapeToClose: 'ESC om te sluiten',
    filterBy: 'Filter op',
    freelance: 'Freelance',
    fullTime: 'Voltijds',
    hireMe: 'Huur me in',
    internship: 'Stage',
    live: 'live',
    liveLink: 'Bekijk live',
    noProjectsFound: 'Geen projecten gevonden voor deze filters.',
    outcome: 'Resultaat',
    owner: 'Eigenaar',
    paused: 'gepauzeerd',
    project: 'Project',
    readMore: 'Volledige case study',
    resetFilters: 'Filters wissen',
    role: 'Rol',
    showAll: 'Toon alles',
    stack: 'Stack',
    state: 'Status',
    viewSource: 'Bron bekijken',
    viewWriteup: 'Artikel bekijken',
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
