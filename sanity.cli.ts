/**
 * Sanity CLI configuration.
 *
 * Required by the `sanity` CLI for dataset operations (export, import, etc.).
 * Uses the same project ID and dataset as the Studio config.
 *
 * The CLI reads auth from ~/.sanity or from `sanity login`. Run
 * `pnpm sanity login` once to authenticate.
 */
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
})
