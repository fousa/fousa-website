/**
 * Branded og:image generator at /og/<slug>.
 *
 * Returns a 1200×630 PNG per the Open Graph spec. Layout: project name in
 * large serif, deck italic underneath, "fousa.be" wordmark in the corner,
 * background colored by the project's primary stack category. Edge runtime
 * so generation is fast and Vercel doesn't bill Node CPU for each request.
 *
 * Caches forever (immutable header) since the URL key includes the slug —
 * if project content changes, the social platforms eventually re-crawl.
 *
 * IMPORTANT — keep this file restricted to web-platform APIs (no Node-only
 * imports like 'node:fs') because it runs on the Edge runtime.
 */
import {ImageResponse} from 'next/og'
import {client} from '@/sanity/client'
import {CASE_STUDY_QUERY} from '@/sanity/queries/case-study'
import type {CASE_STUDY_QUERY_RESULT} from '@/sanity.types'

export const runtime = 'edge'

const CATEGORY_BG: Record<string, string> = {
  mobile: '#1e40af',
  web: '#166534',
  frontend: '#92400e',
  tooling: '#6b21a8',
  other: '#1f2937',
}

export async function GET(
  _req: Request,
  context: {params: Promise<{slug: string}>}
) {
  const {slug} = await context.params

  const project = await client.fetch<CASE_STUDY_QUERY_RESULT>(
    CASE_STUDY_QUERY,
    {slug}
  )

  if (!project) {
    return new Response('Not found', {status: 404})
  }

  const deck =
    (typeof project.deck === 'object' && project.deck?.en) || ''
  const primaryCategory = project.stack?.[0]?.category ?? 'other'
  const bg = CATEGORY_BG[primaryCategory] ?? CATEGORY_BG.other

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: bg,
          color: '#fafafa',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 2,
            textTransform: 'uppercase' as const,
            opacity: 0.75,
            fontFamily: 'monospace',
            display: 'flex',
          }}
        >
          fousa.be
        </div>

        <div style={{display: 'flex', flexDirection: 'column'}}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 500,
              lineHeight: 1.05,
              marginBottom: 24,
              display: 'flex',
            }}
          >
            {project.name}.
          </div>
          {deck && (
            <div
              style={{
                fontSize: 36,
                fontStyle: 'italic',
                opacity: 0.85,
                lineHeight: 1.3,
                maxWidth: 900,
                display: 'flex',
              }}
            >
              {deck}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 20,
            fontFamily: 'monospace',
            opacity: 0.7,
          }}
        >
          <span>{project.employer?.name ?? ''}</span>
          <span>{project.year ?? ''}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    }
  )
}
