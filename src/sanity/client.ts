import {createClient} from 'next-sanity'
import createImageUrlBuilder from '@sanity/image-url'
import {apiVersion, dataset, projectId} from './env'

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
