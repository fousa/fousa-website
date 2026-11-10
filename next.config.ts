/**
 * Next.js config: Sanity CDN image host, the whitelisted image qualities, and
 * `noindex` headers for the unlisted KMO page and its sales-sheet PDFs.
 */
import type {NextConfig} from 'next'

/**
 * Reachable by link, kept out of search results (the page also sets meta
 * robots; the PDF route sets this header itself, the rule here also covers its 404s).
 */
const NOINDEX = [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]

const config: NextConfig = {
  async headers() {
    return [
      {source: '/nl/kmo', headers: NOINDEX},
      {source: '/kmo/:path*', headers: NOINDEX},
    ]
  },
  images: {
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
    // 90 keeps the small log-row screenshot previews crisp (fine UI text softens
    // at the default 75); Next 16 requires every quality used to be whitelisted.
    qualities: [75, 90],
  },
}

export default config
