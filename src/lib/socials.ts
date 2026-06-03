/**
 * The social platforms we render with a brand icon. A subset of the Studio's
 * platform list, narrowed to the kinds the `outbound_click` analytics event
 * understands (see `OutboundKind`). `resolveSocialKind` maps a raw Studio
 * `platform` string onto this union, defaulting to GitHub for anything else.
 */
export type SocialKind = "github" | "linkedin" | "bluesky" | "instagram";

const KINDS: readonly SocialKind[] = ["github", "linkedin", "bluesky", "instagram"];

/** Lower-case a raw Studio platform and narrow it to a known icon kind. */
export function resolveSocialKind(platform?: string | null): SocialKind {
  const lower = platform?.toLowerCase();
  return (KINDS as readonly string[]).includes(lower ?? "")
    ? (lower as SocialKind)
    : "github";
}
