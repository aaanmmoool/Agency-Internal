import * as THREE from "three";

/**
 * Live car transform, written by the car rig and read by the camera controller
 * in the same frame. Module-level rather than React state so following the car
 * costs nothing but a property read.
 */
export const carState = {
  position: new THREE.Vector3(0, 0, 96),
  /** World-space forward direction (unit length). */
  forward: new THREE.Vector3(0, 0, -1),
  /** World-space right direction (unit length). */
  right: new THREE.Vector3(1, 0, 0),
  /** Y rotation in radians. */
  heading: 0,
  /** -1..1, mirrors the route curvature. */
  steer: 0,
  /** 0..1 normalised speed. */
  speed: 0,
  /** 0..1 braking amount, drives the brake lights. */
  brake: 0,
  /** True while the car is still pulling across to a newly picked lane. */
  changingLane: false,
};
