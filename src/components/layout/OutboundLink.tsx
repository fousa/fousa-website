"use client";
/**
 * Anchor that fires an `outbound_click` analytics event then navigates as
 * normal. Drop-in replacement for `<a>` on external links (email, socials, CV).
 */
import { track, type OutboundKind } from "@/lib/analytics";

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
      rel={kind === "email" || kind === "cv" ? undefined : "noopener noreferrer"}
      target={kind === "email" || kind === "cv" ? undefined : "_blank"}
      onClick={() => track("outbound_click", { kind, href, locale })}
    >
      {children}
    </a>
  );
}
