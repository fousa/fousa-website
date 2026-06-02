/**
 * A single stack tag chip — small neutral pill with monospace text.
 */
export function StackChip({name}: {name: string}) {
  return (
    <span className="inline-block rounded px-2 py-0.5 font-mono text-[10px] font-medium bg-surface-warm text-ink-muted">
      {name}
    </span>
  )
}
