/**
 * Studio desk structure.
 *
 * Customizes the left sidebar in the Sanity Studio. Singletons (Profile,
 * Availability) are pinned at the top as direct items — clicking one opens
 * the document immediately, with no "create new" affordance because only
 * one of each should ever exist. Collections (Projects, Timeline entries,
 * Stack tags) sit below as standard browseable lists.
 */
import type {StructureResolver} from 'sanity/structure'

/**
 * Singleton document IDs — these documents have a fixed `_id` so they can
 * only ever have one instance. The Studio pins them and hides the "new" button.
 * Document creation for these types is also blocked in sanity.config.ts via
 * the `actions` resolver (set up at the end of this file's accompanying changes).
 */
const SINGLETONS = ['profile', 'availability', 'siteSettings'] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Pinned singletons
      S.listItem()
        .title('Profile')
        .id('profile')
        .child(
          S.editor()
            .id('profile')
            .schemaType('profile')
            .documentId('profile')
        ),
      S.listItem()
        .title('Availability')
        .id('availability')
        .child(
          S.editor()
            .id('availability')
            .schemaType('availability')
            .documentId('availability')
        ),
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(
          S.editor()
            .id('siteSettings')
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.divider(),
      // Collections — Sanity's default list views
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('timelineEntry').title('Timeline'),
      S.documentTypeListItem('stackTag').title('Stack tags'),
    ])

export {SINGLETONS}
