/**
 * Glide flight model — pure state + a per-frame integrator, kept separate from
 * rendering so the canvas component stays a thin shell.
 *
 * Coordinate model (top-down): the glider has a world X that only ever feeds
 * the score (distance made good) and a screen-space Y clamped to the viewport.
 * Heading is in radians with 0 == +X (forward/right); increasing heading turns
 * clockwise on screen (canvas Y points down). Altitude is the internal 0..1
 * fraction of cloudbase. Lift is supplied by the world (thermals, later) and
 * netted against sink here.
 */
import { GLIDE } from "./config";

/** How a flight ended: ran out of altitude, or flew into a storm. */
export type EndReason = "land" | "storm";

/** Per-frame control input, derived from keyboard or touch. */
export type Input = {
  /** -1 turn left, 0 straight, 1 turn right. */
  turn: -1 | 0 | 1;
  /** -1 slow (90), 0 cruise (140), 1 fast (180). */
  pitch: -1 | 0 | 1;
};

export type Glider = {
  /** World X in px — grows with forward travel, source of the score. */
  x: number;
  /** Screen Y in px, clamped to the viewport (no vertical camera). */
  y: number;
  /** Heading in radians; 0 = +X. */
  heading: number;
  /** Eased airspeed in km/h. */
  speed: number;
  /** Altitude as a 0..1 fraction of cloudbase. */
  alt: number;
  /** Net climb rate this frame in internal alt-units/second (signed). */
  vario: number;
  /** Best X reached = distance made good. */
  maxX: number;
};

/** How quickly airspeed eases toward its target (per second). */
const SPEED_EASE = 2.2;
/** Vertical keep-out margin so the glider can't touch the window edge. */
const EDGE_MARGIN = 28;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Eased airspeed target for a pitch input. */
function targetSpeed(pitch: number): number {
  return pitch > 0 ? GLIDE.FAST : pitch < 0 ? GLIDE.SLOW : GLIDE.CRUISE;
}

/**
 * Sink rate in alt-units/second: a constant baseline plus a penalty that grows
 * the faster you fly past the reference speed. Flying slow gives the least
 * sink, which is what makes circling at low speed pay off.
 */
export function sinkRate(speed: number): number {
  return GLIDE.SINK_U + GLIDE.SPEEDSINK * Math.max(0, speed - GLIDE.SREF);
}

/** Variometer reading in m/s for display, scaled from internal units and
 *  clamped to the dial's full-scale range. */
export function varioMs(g: Glider): number {
  return clamp(g.vario * GLIDE.VDISP, -GLIDE.MAXV, GLIDE.MAXV);
}

/** Distance made good in kilometres, for the score readout. */
export function distanceKm(g: Glider): number {
  return (g.maxX * GLIDE.M_PER_PX) / 1000;
}

/** Altimeter reading in metres. */
export function altitudeM(g: Glider): number {
  return g.alt * GLIDE.CLOUDBASE_M;
}

/**
 * Fresh glider at cruise, mid-screen. Launch altitude sits below almost every
 * thermal's top (tops range 0.38–0.95) so circling a thermal reliably climbs
 * up to that thermal's top — otherwise most early thermals would already be
 * topped out and give no lift.
 */
export function createGlider(viewH: number): Glider {
  return {
    x: 0,
    y: viewH * 0.5,
    heading: 0,
    speed: GLIDE.CRUISE,
    alt: 0.45,
    vario: 0,
    maxX: 0,
  };
}

/**
 * Advances the glider one frame.
 *
 * @param g    Glider state (mutated in place — this runs every frame).
 * @param input Control input for this frame.
 * @param dt   Delta time in seconds.
 * @param view Viewport size in CSS px (for the vertical clamp).
 * @param lift Externally supplied lift in alt-units/second (thermals); 0 here.
 */
export function stepGlider(
  g: Glider,
  input: Input,
  dt: number,
  view: { w: number; h: number },
  lift = 0,
): void {
  // Airspeed eases toward the pitch target rather than snapping.
  const target = targetSpeed(input.pitch);
  g.speed += (target - g.speed) * (1 - Math.exp(-SPEED_EASE * dt));

  // Steering rotates the heading; held turns become circles.
  g.heading += input.turn * GLIDE.TURN * dt;

  // Travel along the heading. X advances the world/score; Y moves on screen.
  const dist = g.speed * GLIDE.PX_PER_KMH * dt;
  g.x += Math.cos(g.heading) * dist;
  g.y = clamp(g.y + Math.sin(g.heading) * dist, EDGE_MARGIN, view.h - EDGE_MARGIN);

  // Altitude: supplied lift minus sink, clamped to the band.
  g.vario = lift - sinkRate(g.speed);
  g.alt = clamp(g.alt + g.vario * dt, 0, 1);

  g.maxX = Math.max(g.maxX, g.x);
}
