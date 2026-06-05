import imageUrlBuilder, {type SanityImageSource} from '@sanity/image-url'
import {projectId, dataset} from './env'

/**
 * Image URL builder. Resolving via the builder (rather than `asset->url`) is
 * what makes the editor's crop and hotspot take effect: it bakes the crop into
 * a `?rect=` parameter and lets a requested width/height + `fit('crop')` frame
 * the image around the hotspot. The raw asset URL ignores both.
 */
const builder = imageUrlBuilder({projectId, dataset})

export function urlForImage(source: SanityImageSource) {
  return builder.image(source)
}
