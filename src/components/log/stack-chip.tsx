/**
 * A single stack tag chip — small colored pill with monospace text.
 *
 * Colors come from the chip's category (ios, rails, frontend, tooling, other).
 * Categories are stored on Stack tag documents in Sanity; the migration's
 * hand-tuned category map gave each tag a sensible default.
 */
import {clsx} from 'clsx'

type Category = 'ios' | 'rails' | 'frontend' | 'tooling' | 'other'

const CATEGORY_CLASSES: Record<Category, string> = {
  ios: 'bg-ios-bg text-ios',
  rails: 'bg-rails-bg text-rails',
  frontend: 'bg-frontend-bg text-frontend',
  tooling: 'bg-tooling-bg text-tooling',
  other: 'bg-other-bg text-other',
}

export function StackChip({
  name,
  category,
}: {
  name: string
  category: Category | null
}) {
  const cat: Category = category ?? 'other'
  return (
    <span
      className={clsx(
        'inline-block rounded px-2 py-0.5 font-mono text-[10px] font-medium',
        CATEGORY_CLASSES[cat]
      )}
    >
      {name}
    </span>
  )
}
