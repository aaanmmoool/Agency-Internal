/** Centralised scene constants. Nothing below should be duplicated in a component. */

export const COLORS = {
  background: "#06070B",
  fog: "#0A0D16",
  ground: "#0F1220",
  asphalt: "#1A1D28",
  laneMark: "#7E88A8",
  sidewalk: "#2B3040",
  buildingBase: "#242939",
  buildingAlt: "#2C3247",
  window: "#9DBCFF",
  accent: "#7DA3FF",
  warm: "#FFC48F",
  headlight: "#EAF0FF",
  brake: "#FF4D4D",
} as const;

export const CAMERA = {
  fov: 42,
  near: 0.5,
  /** Follow-camera offset in car-local space: behind, above, and a look-ahead. */
  follow: { back: 13.5, up: 4.8, lookAhead: 13, lookUp: 1.2 },
  cinematic: { back: 15, up: 4.4, lookAhead: 15, lookUp: 1.3 },
  destination: { back: 16.5, up: 7.2, lookAhead: 7, lookUp: 2.0 },
  showcase: { back: 13.5, up: 5.6, lookAhead: 5, lookUp: 1.8, side: 7 },
  orbit: { back: 15, up: 9.5, lookAhead: 9, lookUp: 0.6 },
  /**
   * Damping rates (higher = tighter). These act on the camera's offset from the
   * car, not on a world position, so they control how quickly the shot changes
   * between camera modes rather than how far behind the car it falls.
   */
  positionLambda: 3.4,
  targetLambda: 4.2,
  /**
   * Constant leftward camera offset, which puts the car right of centre and
   * clear of the mission panel that occupies the left of the viewport.
   */
  compositionBias: -1,
} as const;

export const CAR = {
  wheelRadius: 0.38,
  /** Lateral offset from the centre line, so the car sits in a lane. */
  laneOffset: 2.5,
  /** Route units travelled per unit of normalised progress. Set from route length. */
  maxSteer: 0.42,
  bodyRollFactor: 0.09,
  suspensionFactor: 0.14,
} as const;

/** Damping applied to the scroll target before anything in the world reads it. */
export const JOURNEY = {
  smoothing: 3.4,
  /** Below this normalised speed the world is treated as static. */
  idleThreshold: 0.0006,
  /** Seconds of continued rendering after motion stops, so damping can settle. */
  settleTime: 1.1,
} as const;
