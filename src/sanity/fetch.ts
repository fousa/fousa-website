/**
 * Server-side fetch wrapper around the Sanity client.
 *
 * Adds Next.js ISR cache config: a 1-hour fallback revalidation so content
 * stays fresh even if a webhook is ever missed. The webhook from Sanity
 * (POST /api/revalidate) handles the typical case — this is belt-and-braces.
 *
 * Use this from Server Components only. Client Components should never
 * read from Sanity directly; pass data down as props.
 */
import {client} from './client'

/**
 * @param query - GROQ query string (use defineQuery() for TypeGen inference)
 * @param params - Optional GROQ parameters
 * @returns The query result, typed via T
 */
export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  return await client.fetch<T>(query, params, {
    next: {revalidate: 3600},
  })
}
