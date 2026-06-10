/**
 * Frameless device frame: the screenshot is the element — a hairline border and a
 * small radius, no bezel — with a minimal per-device cue (iPhone Dynamic Island,
 * Mac titlebar dots, Web URL pill, TV pedestal stand, Watch squircle). One visual
 * language shared by the log preview, the case study and the cross-project
 * gallery. `priority` eager-loads the first above-the-fold shot (the LCP).
 */
import Image from "next/image";
import type { GalleryShot } from "@/lib/work";

/** Frames rendered as a known screen; anything else falls back to the plain `other` frame. */
const KNOWN = new Set([
  "phone",
  "tablet-landscape",
  "tablet-portrait",
  "mac",
  "tv",
  "watch",
  "browser",
  "other",
  "none",
]);

export function Frame({ shot, priority }: { shot: GalleryShot; priority?: boolean }) {
  // Known frame, or `other` for any unknown/legacy value (defensive: old data won't break).
  const f = KNOWN.has(shot.frame) ? shot.frame : "other";

  const img = (
    <Image
      src={shot.imageUrl}
      alt={shot.caption ?? ""}
      width={shot.width}
      height={shot.height}
      priority={priority}
      className="dframe-pic"
    />
  );

  // Cue + screenshot. The cue is decorative (aria-hidden) — the image's alt
  // carries the meaning. `none` shows no cue and keeps the natural ratio (CSS).
  const body = (
    <>
      {f === "phone" && <span className="dframe__island" aria-hidden />}
      {f === "mac" && (
        <span className="dframe__bar-mac" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}
      {f === "browser" && (
        <span className="dframe__bar-web" aria-hidden>
          <span className="url" />
        </span>
      )}
      <span className="dframe-img">{img}</span>
    </>
  );

  // TV hangs a small pedestal stand below the screen; the screen stays the
  // top-aligned element so a row of mixed devices lines up on their screen edges.
  if (f === "tv") {
    return (
      <figure className="dframe-tvwrap">
        <span className="dframe dframe--tv">{body}</span>
        <span className="dframe-stand" aria-hidden>
          <span className="neck" />
          <span className="foot" />
        </span>
      </figure>
    );
  }

  return <figure className={`dframe dframe--${f}`}>{body}</figure>;
}
