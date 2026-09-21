import { experienceLandmarks, processStops, projectStops, serviceChoiceAt } from "@/data/missions";

/**
 * Where every landmark sits in the world.
 *
 * Positions are expressed as (scroll position, lateral offset) and resolved
 * against the route spline at runtime, so moving a waypoint moves the buildings
 * with it. The camera controller and the world geometry both read from here,
 * which is what keeps showcase shots pointed at the right building.
 */

export interface Anchor {
  /** Scroll position, 0..1. */
  at: number;
  /** Signed distance to the right of travel. */
  lateral: number;
}

export const HQ: Anchor = { at: 0.135, lateral: 23 };

/*
  Every mission destination stands on the right-hand side of the road.

  The mission panel occupies the left of the viewport on desktop, so a landmark
  placed on the left is framed behind it. Varying the set-back distance gives
  the district its variety instead.
*/
export const PROJECT_DISTANCES = [19, 25, 21, 27] as const;

export const PROJECT_ANCHORS: Anchor[] = projectStops.map((at, i) => ({
  at,
  lateral: PROJECT_DISTANCES[i],
}));

export const LANDMARK_ANCHORS: Anchor[] = experienceLandmarks.map((l, i) => ({
  at: l.at,
  lateral: i % 2 === 0 ? 18 : 23,
}));

export const INTERCHANGE: Anchor = { at: serviceChoiceAt, lateral: 0 };
/** Lateral spread of the five service routes at the interchange. */
export const SERVICE_SPREAD = [-22, -11, 0, 11, 22];

export const CHECKPOINT_ANCHORS: Anchor[] = processStops.map((at) => ({ at, lateral: 0 }));

/**
 * Set back from the end of the route, not on it: the car has to still be
 * approaching for the arrival shot to frame the entrance.
 */
export const FINAL_BUILDING: Anchor = { at: 0.978, lateral: 22 };

/** Bridge span, in scroll positions — used to drop pillars and side rails. */
export const BRIDGE_RANGE: [number, number] = [0.255, 0.365];

/** Districts get their own building density and palette bias. */
export const DISTRICT_BANDS: { from: number; to: number; density: number }[] = [
  { from: 0.0, to: 0.06, density: 0.5 },
  { from: 0.06, to: 0.22, density: 1.0 },
  { from: 0.22, to: 0.4, density: 0.75 },
  { from: 0.4, to: 0.66, density: 1.0 },
  { from: 0.66, to: 0.8, density: 0.45 },
  { from: 0.8, to: 0.93, density: 0.6 },
  { from: 0.93, to: 1.0, density: 0.9 },
];
