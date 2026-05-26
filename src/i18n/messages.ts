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
    allProjectsInLog: 'All projects in the log',
    available: 'Available',
    beyondCode: 'Beyond code',
    beyondCodeGlidingDescription: 'Reading thermals over the Belgian heath since the early days. Both flying gliders and writing software require reading the conditions carefully.',
    beyondCodeGlidingTitle: 'Gliding',
    beyondCodeOwnAppsCaption: 'All built around things I actually care about.',
    beyondCodeOwnAppsTitle: 'My own apps',
    booked: 'Booked',
    cancelled: 'cancelled',
    career: 'Career',
    careerSoFar: 'Career so far',
    caseStudy: 'Case study',
    client: 'Client',
    closeRow: 'Close',
    copyLink: 'Copy link',
    copyrightLine: 'Edegem · BE',
    done: 'done',
    downloadCv: 'Download CV (pdf)',
    employer: 'Employer',
    escapeToClose: 'ESC to close',
    filterBy: 'Filter by',
    freelance: 'Freelance',
    fullTime: 'Full-time',
    getInTouch: 'Get in touch',
    hireMe: 'Hire me',
    internship: 'Internship',
    introductionLabel: 'Introduction',
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
    seeProjectsFor: 'See projects for',
    showAll: 'Show all',
    stack: 'Stack',
    state: 'State',
    viewProject: 'View project',
    viewSource: 'View source',
    viewWriteup: 'View writeup',
    year: 'Year',
  },
  nl: {
    about: 'Over',
    allProjects: 'Alle projecten',
    allProjectsInLog: 'Alle projecten in het logboek',
    available: 'Beschikbaar',
    beyondCode: 'Buiten code',
    beyondCodeGlidingDescription: 'Thermiek lezen boven de Vlaamse heide sinds de eerste uren. Zweefvliegen en software schrijven vragen allebei goed lezen van de omstandigheden.',
    beyondCodeGlidingTitle: 'Zweefvliegen',
    beyondCodeOwnAppsCaption: 'Allemaal gebouwd rond dingen die me écht raken.',
    beyondCodeOwnAppsTitle: 'Mijn eigen apps',
    booked: 'Volgeboekt',
    cancelled: 'geannuleerd',
    career: 'Loopbaan',
    careerSoFar: 'Tot nu toe',
    caseStudy: 'Case study',
    client: 'Klant',
    closeRow: 'Sluiten',
    copyLink: 'Link kopiëren',
    copyrightLine: 'Edegem · BE',
    done: 'klaar',
    downloadCv: 'CV downloaden (pdf)',
    employer: 'Werkgever',
    escapeToClose: 'ESC om te sluiten',
    filterBy: 'Filter op',
    freelance: 'Freelance',
    fullTime: 'Voltijds',
    getInTouch: 'Contact',
    hireMe: 'Huur me in',
    internship: 'Stage',
    introductionLabel: 'Introductie',
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
    seeProjectsFor: 'Bekijk projecten voor',
    showAll: 'Toon alles',
    stack: 'Stack',
    state: 'Status',
    viewProject: 'Project bekijken',
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
