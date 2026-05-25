import type {StructureResolver} from 'sanity/structure'

// Custom desk structure. Schemas + singleton pinning come in Phase 1.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Populated in Phase 1
    ])
