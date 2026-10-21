'use client'
/**
 * Embedded Sanity Studio, mounted at `/studio` (no locale prefix). The
 * catch-all segment lets the Studio own its internal routing.
 */

import {NextStudio} from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
