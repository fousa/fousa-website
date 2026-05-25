import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {apiVersion, dataset, projectId} from '@/sanity/env'
import {structure} from '@/sanity/structure'
import {schemaTypes} from '@/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {types: schemaTypes},
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
    documentInternationalization({
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'nl', title: 'Nederlands'},
      ],
      // Empty by design. We use FIELD-LEVEL translations (see
      // src/sanity/fields/i18n.ts) rather than document-level — both locales
      // live inside a single document so editors can compare them side by side.
      // If we ever need a fully separate Dutch document tree, add the relevant
      // schema names here.
      schemaTypes: [],
    }),
  ],
})
