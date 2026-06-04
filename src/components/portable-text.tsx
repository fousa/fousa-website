/**
 * Renders Sanity Portable Text using @portabletext/react with light styling
 * tuned for case study bodies.
 *
 * Block-level: all blocks render as <p>. We don't currently use headings in
 * case study bodies (the case study has its own h2 outside the body), so a
 * plain-paragraph mapping keeps the markup clean.
 *
 * Marks: em → italic, strong → font-semibold so emphasised runs stand out
 * clearly against the body text. Links open in a new tab with rel="noopener noreferrer".
 */
import {PortableText, type PortableTextComponents} from '@portabletext/react'

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  },
  marks: {
    em: ({children}) => <em className="italic">{children}</em>,
    strong: ({children}) => <strong className="font-semibold text-ink">{children}</strong>,
    link: ({children, value}) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-accent"
      >
        {children}
      </a>
    ),
  },
}

/**
 * @param value - Portable Text block array
 * @param className - Optional wrapper class to control body typography
 */
export function PortableTextRenderer({
  value,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[] | null | undefined
  className?: string
}) {
  if (!value || value.length === 0) return null
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  )
}
