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
      schemaTypes: [],
    }),
  ],
})
