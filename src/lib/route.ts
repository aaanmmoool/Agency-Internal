import * as THREE from "three";
import { WAYPOINTS } from "@/config/waypoints";

/**
 * The single source of truth for world layout.
 *
 * Everything — the road ribbon, prop placement, district anchors, the car and
 * the camera — is derived from this one curve, so the world can be reshaped by
 * editing the waypoints alone (`config/waypoints.ts`).
 */
export const route = new THREE.CatmullRomCurve3(
  WAYPOINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "catmullrom",
  0.5,
);

/** Arc-length parameterisation keeps car speed even through tight corners. */
const ARC_DIVISIONS = 1200;
route.arcLengthDivisions = ARC_DIVISIONS;

export const ROUTE_LENGTH = route.getLength();

/** Road surface half-width, in world units. */
export const ROAD_HALF_WIDTH = 5.2;
export const SIDEWALK_WIDTH = 2.1;

const _pos = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _right = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

/** Position on the route at normalised distance `t`. Writes into `target`. */
export function pointAt(t: number, target: THREE.Vector3): THREE.Vector3 {
  return route.getPointAt(THREE.MathUtils.clamp(t, 0, 1), target);
}

/** Unit tangent at `t`. Writes into `target`. */
export function tangentAt(t: number, target: THREE.Vector3): THREE.Vector3 {
  return route.getTangentAt(THREE.MathUtils.clamp(t, 0, 1), target).normalize();
}

/** Heading (Y rotation) of the route at `t`, in radians. */
export function headingAt(t: number): number {
  tangentAt(t, _tan);
  return Math.atan2(_tan.x, _tan.z);
}

/**
 * A point beside the route: `lateral` is signed distance to the right of travel,
 * `height` is added on Y. Used to place every prop and building.
 */
export function offsetPoint(
  t: number,
  lateral: number,
  height = 0,
  target = new THREE.Vector3(),
): THREE.Vector3 {
  pointAt(t, _pos);
  tangentAt(t, _tan);
  _right.crossVectors(_tan, UP).normalize();
  return target.set(
    _pos.x + _right.x * lateral,
    _pos.y + height,
    _pos.z + _right.z * lateral,
  );
}

/** Curvature approximation at `t`, used to drive steering and body roll. */
export function curvatureAt(t: number, delta = 0.004): number {
  const a = headingAt(Math.max(0, t - delta));
  const b = headingAt(Math.min(1, t + delta));
  let d = b - a;
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d / (delta * 2);
}
