import {createClient} from 'next-sanity'
import createImageUrlBuilder from '@sanity/image-url'
import {apiVersion, dataset, projectId} from './env'

/**
 * Sanity client — uses a viewer-only API token (`SANITY_API_TOKEN`) because
 * the dataset is private. The token should have "Viewer" permissions only;
 * never use a write-capable token here.
 */
export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
})

const builder = createImageUrlBuilder({projectId, dataset})
export const urlFor = (source: unknown) =>
  builder.image(source as Parameters<typeof builder.image>[0])
