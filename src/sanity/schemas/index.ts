/**
 * Sanity schema registry.
 *
 * Each document type lives in its own file under this folder. This barrel
 * collects them into the single `schemaTypes` array that `sanity.config.ts`
 * expects. Adding a new schema = create a file, import here, append to the array.
 */
import type {SchemaTypeDefinition} from 'sanity'

import {profile} from './profile'
import {availability} from './availability'
import {siteSettings} from './site-settings'
import {timelineEntry} from './timeline-entry'
import {stackTag} from './stack-tag'
import {project} from './project'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons (one document each, edited in place)
  profile,
  availability,
  siteSettings,
  // Collections (many documents, listed in the Studio sidebar)
  timelineEntry,
  stackTag,
  project,
]
