/**
 * Client component that copies the project's hash-link to the clipboard.
 * Shows "Copied!" feedback for 2 seconds after a successful copy.
 */
'use client'

import {useState, useCallback} from 'react'

export function CopyLinkButton({
  slug,
  label,
  copiedLabel,
}: {
  slug: string
  label: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [slug])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-ink-muted hover:text-ink transition-colors"
    >
      {copied ? `✓ ${copiedLabel}` : `🔗 ${label}`}
    </button>
  )
}
