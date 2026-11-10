"use client";
/**
 * Anchor that fires an `outbound_click` analytics event then navigates as
 * normal. Drop-in replacement for `<a>` on external links (email, phone,
 * socials, CV and other PDFs). Only off-site kinds open in a new tab.
 */
import { track, type OutboundKind } from "@/lib/analytics";

/** Kinds that stay in this tab: mail/phone handlers and our own files. */
const SAME_TAB: ReadonlySet<OutboundKind> = new Set(["email", "phone", "cv", "pdf"]);

export function OutboundLink({
  kind,
  href,
  locale,
  children,
  className,
  download,
}: {
  kind: OutboundKind;
  href: string;
  locale: string;
  children: React.ReactNode;
  className?: string;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      className={className}
      download={download}
      rel={SAME_TAB.has(kind) ? undefined : "noopener noreferrer"}
      target={SAME_TAB.has(kind) ? undefined : "_blank"}
      onClick={() => track("outbound_click", { kind, href, locale })}
    >
      {children}
    </a>
  );
}
