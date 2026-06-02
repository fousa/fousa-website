/**
 * Tuning constants for the hidden "Glide" mini-game.
 *
 * A single source of truth for the flight model and world generation so the
 * feel can be tweaked in one place. Units are mixed by design and documented
 * per field: some are physical (m/s, km/h), some are normalised (altitude is
 * an internal 0..1 fraction of cloudbase), and a few are pixel-space.
 *
 * Altitude is internal 0..1 where 1 == cloudbase; the displayed metres are
 * `alt * CLOUDBASE_M`.
 */
export const GLIDE = {
  /** Turn rate in radians/second at full steering input. */
  TURN: 3.0,
  /** Baseline sink applied every frame, in altitude-units/second. */
  SINK_U: 0.09,
  /** Extra sink (altitude-units/second) while inside a sink river. */
  RIVER_SINK: 0.5,
  /** Metres at cloudbase — altitude 1.0 maps to this for the altimeter. */
  CLOUDBASE_M: 1600,
  /** World metres per screen pixel, used to scale distance/airspeed to px. */
  M_PER_PX: 1.1,
  /** Variometer display clamp, in m/s (needle saturates here). */
  MAXV: 8,
  /** Variometer dial half-range in degrees of needle sweep. */
  VDISP: 18,
  /** Eased airspeed target (km/h) when pitching down (↓/S). */
  SLOW: 90,
  /** Eased airspeed target (km/h) with no pitch input (cruise). */
  CRUISE: 140,
  /** Eased airspeed target (km/h) when pitching up (↑/W). */
  FAST: 180,
  /** Reference airspeed (km/h) at which the speed-sink penalty is zero-based. */
  SREF: 100,
  /** Sink penalty coefficient: faster than SREF sinks more. */
  SPEEDSINK: 0.0022,
  /** Horizontal world speed in px/frame per km/h of airspeed. */
  PX_PER_KMH: 1.5,
  /** Lateral meander amplitude of sink rivers, in pixels. */
  RIVER_AMP: 20,

  /**
   * Procedural world generation. Features are laid down left-to-right as the
   * camera advances; each new feature is placed a random gap ahead of the last.
   */
  spawn: {
    /** Minimum px between consecutive features. */
    gapBase: 210,
    /** Additional random px (0..gapRand) added to the gap. */
    gapRand: 190,
    /** Minimum thermal radius in px. */
    radiusBase: 150,
    /** Additional random radius (0..radiusRand) in px. */
    radiusRand: 80,
    /** Minimum thermal strength (altitude-units/second at the core). */
    strengthBase: 0.3,
    /** Additional random strength (0..strengthRand). */
    strengthRand: 0.18,
    /** Minimum thermal top as an altitude fraction (climb tapers to it). */
    topBase: 0.38,
    /** Additional random top span (0..topRand). */
    topRand: 0.57,
    /** Probability a feature is a thunderstorm instead of a plain thermal. */
    stormChance: 0.16,
    /** Probability a feature is a sink river. */
    riverChance: 0.13,
  },
} as const;

export type GlideConfig = typeof GLIDE;
