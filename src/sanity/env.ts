/**
 * Public Sanity connection values, read once from the environment.
 *
 * `projectId` and `dataset` are required and throw at import time when
 * missing so a misconfigured deploy fails loudly; `apiVersion` falls back to
 * a pinned date. `vitest.setup.ts` stubs the public vars for the unit suite.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-12-01'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing NEXT_PUBLIC_SANITY_PROJECT_ID'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage)
  return v
}
