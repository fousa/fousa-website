import {createClient} from 'next-sanity'
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
  // CDN is fast but can serve slightly stale content; skip it only in local
  // `next dev` so it always reflects the latest published data. Preview and
  // production deploys keep the CDN on.
  useCdn: process.env.NODE_ENV !== 'development',
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published',
})
