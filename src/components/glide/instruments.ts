/**
 * Bottom-left instrument panel for Glide — three hairline dials drawn straight
 * onto the canvas in the site fonts.
 *
 * - Altimeter (m): a progress gauge filling toward cloudbase, with the metres.
 * - Variometer (m/s): a needle that sits horizontal to the LEFT at zero, lifts
 *   up and turns coral while climbing, and drops down (neutral) while sinking.
 * - Airspeed (km/h): a gauge spanning the slow→fast range, with the reading.
 *
 * A "LOW — FIND LIFT" warning (passed in already localised) appears above the
 * dials when altitude drops under the danger threshold.
 */
import { GLIDE } from "./config";
import type { Fonts, Palette } from "./palette";

/** Altitude fraction under which the low-altitude warning shows. */
export const LOW_ALT = 0.14;

/** Live values to render; all already in display units. */
export type Readout = {
  altM: number;
  varioMs: number;
  speedKmh: number;
  /** Whether to show the low-altitude warning. */
  low: boolean;
  /** Localised warning label. */
  lowLabel: string;
};

const R = 30;
const GAP = 18;
const PAD = 20;
/** Gauge arc: 135° round to 45°, a 270° sweep open at the top. */
const A0 = Math.PI * 0.75;
const A1 = Math.PI * 2.25;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Hairline gauge: faint full-sweep track plus a value arc. */
function gauge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  frac: number,
  pal: Palette,
) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = pal.line;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(cx, cy, R, A0, A1);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.strokeStyle = pal.text;
  ctx.beginPath();
  ctx.arc(cx, cy, R, A0, A0 + (A1 - A0) * clamp(frac, 0, 1));
  ctx.stroke();
}

/** Plain hairline ring (used behind the variometer needle). */
function ring(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pal: Palette,
) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = pal.line;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Centred numeric value with a small unit caption below it. */
function label(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  value: string,
  unit: string,
  pal: Palette,
  fonts: Fonts,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = pal.ink;
  ctx.font = `13px ${fonts.mono}`;
  ctx.fillText(value, cx, cy - 2);
  ctx.fillStyle = pal.muted;
  ctx.font = `9px ${fonts.mono}`;
  ctx.fillText(unit, cx, cy + 12);
}

/** Variometer needle: horizontal-left at zero, lifting up (coral) for climb
 *  and dropping down (neutral) for sink. */
function needle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  varioMs: number,
  pal: Palette,
) {
  const frac = clamp(varioMs / GLIDE.MAXV, -1, 1);
  const phi = Math.PI + frac * (Math.PI * 0.42);
  const len = R * 0.78;

  ctx.strokeStyle =
    varioMs >= 0.05 ? pal.accent : varioMs <= -0.05 ? pal.ink : pal.muted;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(phi) * len, cy + Math.sin(phi) * len);
  ctx.stroke();
  ctx.lineCap = "butt";

  ctx.fillStyle = pal.ink;
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/** Draws the full instrument cluster bottom-left, plus the low warning. */
export function drawInstruments(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Palette,
  fonts: Fonts,
  r: Readout,
) {
  const cy = h - PAD - R;
  const cxAlt = PAD + R;
  const cxVar = cxAlt + R * 2 + GAP;
  const cxSpd = cxVar + R * 2 + GAP;

  ctx.save();

  // Altimeter — fraction of cloudbase.
  gauge(ctx, cxAlt, cy, r.altM / GLIDE.CLOUDBASE_M, pal);
  label(ctx, cxAlt, cy, String(Math.round(r.altM)), "m", pal, fonts);

  // Variometer — needle + signed reading.
  ring(ctx, cxVar, cy, pal);
  needle(ctx, cxVar, cy, r.varioMs, pal);
  const v = r.varioMs;
  const vText = `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}`;
  label(ctx, cxVar, cy + R + 4, vText, "m/s", pal, fonts);

  // Airspeed — position within the slow→fast envelope.
  const spdFrac = (r.speedKmh - GLIDE.SLOW) / (GLIDE.FAST - GLIDE.SLOW);
  gauge(ctx, cxSpd, cy, spdFrac, pal);
  label(ctx, cxSpd, cy, String(Math.round(r.speedKmh)), "km/h", pal, fonts);

  // Low-altitude warning above the cluster.
  if (r.low) {
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = pal.accent;
    ctx.font = `12px ${fonts.mono}`;
    ctx.fillText(r.lowLabel, PAD, cy - R - 14);
  }

  ctx.restore();
}
