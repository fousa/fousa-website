/**
 * Renders a JSON-LD <script type="application/ld+json">.
 *
 * `<` is escaped to its unicode form so a string value containing
 * "</script>" can't break out of the tag — basic XSS hardening for any
 * field that ultimately comes from CMS content.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
