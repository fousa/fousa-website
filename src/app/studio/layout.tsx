/**
 * Studio layout — server component that exports metadata and viewport
 * for the Sanity Studio route. The actual Studio is rendered by the
 * client-only page.tsx inside [[...tool]]/.
 */
export {metadata, viewport} from 'next-sanity/studio'

export default function StudioLayout({children}: {children: React.ReactNode}) {
  return children
}
