import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {apiVersion, dataset, projectId} from '@/sanity/env'
import {structure, SINGLETONS} from '@/sanity/structure'
import {schemaTypes} from '@/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {types: schemaTypes},
  document: {
    /**
     * Hide "create" and "delete" actions for singleton document types.
     * Profile and Availability are pinned in the desk; only one of each
     * should exist, so we strip the actions that could break that invariant.
     */
    actions: (input, context) => {
      if ((SINGLETONS as readonly string[]).includes(context.schemaType)) {
        return input.filter(({action}) => action !== 'duplicate' && action !== 'delete')
      }
      return input
    },
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((t) => !(SINGLETONS as readonly string[]).includes(t.templateId))
      }
      return prev
    },
  },
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
    // i18n is handled at the FIELD level (see src/sanity/fields/i18n.ts)
    // rather than document-level — both locales live inside a single
    // document so editors can compare them side by side, so no
    // document-internationalization plugin is needed.
  ],
})
