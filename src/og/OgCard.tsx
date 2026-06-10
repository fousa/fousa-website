/**
 * Shared Open Graph card (1200×630), rendered by `next/og` for every shareable
 * route (home, about, gallery, each case study).
 *
 * Dark split layout: brand · eyebrow · title · deck · domain/meta on the left, a
 * large device cluster on the right that bleeds off the edge. The cluster's
 * positions vary by `layout` — a case study leads with one big shot, the montage
 * layouts fan out up to four.
 *
 * Satori constraint: inline styles only (no Tailwind / external CSS), a CSS
 * subset, and explicit px on everything (no `aspect-ratio`). `<img>` needs
 * numeric width/height. Fonts come from {@link ogFonts}.
 */
import type { CSSProperties } from "react";

/** One screenshot for the cluster: an absolute (cdn.sanity.io) URL + frame type. */
export type Shot = { url: string; frame: string };

/** Which arrangement the right-hand cluster uses. */
export type OgLayout = "case" | "gallery" | "about" | "home";

/** Card palette — a dark surface with the site's coral accent. */
const C = {
  bg: "#0a0a0b",
  ink: "#f2f2f3",
  text: "#c2c2c8",
  muted: "#8a8a92",
  line: "#2a2a30",
  accent: "#e13100",
} as const;

/** Absolute placement + intrinsic size for one device in the cluster. */
type DevicePos = {
  w: number;
  h: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

/** A single framed screenshot, absolutely positioned within the cluster box. */
function Device({ shot, pos }: { shot: Shot; pos: DevicePos }) {
  const { w, h, ...placement } = pos;
  // A touch of device character: rounder phone, squircle watch, flat for the rest.
  const radius = shot.frame === "phone" ? 18 : shot.frame === "watch" ? 28 : 6;
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        borderRadius: radius,
        border: `1px solid ${C.line}`,
        overflow: "hidden",
        display: "flex",
        boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
        ...(placement as CSSProperties),
      }}
    >
      <img src={shot.url} width={w} height={h} style={{ objectFit: "cover" }} />
    </div>
  );
}

/** Per-layout cluster placements; the montage layouts share one four-slot plan. */
const MONTAGE: DevicePos[] = [
  { left: 30, top: 50, w: 180, h: 360 },
  { right: -50, top: 40, w: 300, h: 225 },
  { right: 30, bottom: -40, w: 260, h: 165 },
  { left: 250, bottom: 20, w: 120, h: 144 },
];

export function OgCard({
  eyebrow,
  title,
  deck,
  domain,
  meta,
  shots,
  layout,
}: {
  eyebrow: string;
  title: string;
  deck?: string;
  domain: string;
  meta?: string;
  shots: Shot[];
  layout: OgLayout;
}) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background: C.bg,
        display: "flex",
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Text column */}
      <div
        style={{
          width: 564,
          padding: "64px 64px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Brand tile */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#fff",
              color: C.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Space Grotesk",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            f<span style={{ color: C.accent }}>.</span>
          </div>
          <div
            style={{
              fontFamily: "Space Mono",
              fontSize: 20,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              marginTop: 30,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 1.0,
              letterSpacing: -2,
              color: C.ink,
              marginTop: 14,
            }}
          >
            {title}
            <span style={{ color: C.accent }}>.</span>
          </div>
          {deck && (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                color: C.text,
                marginTop: 22,
                maxWidth: 440,
              }}
            >
              {deck}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontFamily: "Space Mono",
            fontSize: 20,
            color: C.muted,
          }}
        >
          <span style={{ color: C.accent, fontWeight: 700 }}>{domain}</span>
          {meta && <span>{meta}</span>}
        </div>
      </div>

      {/* Device cluster — positions vary by layout */}
      <div style={{ flex: 1, position: "relative", display: "flex" }}>
        {layout === "case" && shots[0] && (
          <>
            <Device shot={shots[0]} pos={{ w: 420, h: 315, right: -70, top: 96 }} />
            {shots[1] && (
              <Device shot={shots[1]} pos={{ w: 190, h: 400, left: 10, bottom: -60 }} />
            )}
          </>
        )}
        {layout !== "case" &&
          shots
            .slice(0, 4)
            .map((shot, i) => <Device key={i} shot={shot} pos={MONTAGE[i]} />)}
      </div>
    </div>
  );
}
