"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA } from "@/config/scene";
import { FINAL_BUILDING, HQ, PROJECT_ANCHORS } from "@/config/world";
import { missionAt, projectStops } from "@/data/missions";
import { cameraState } from "@/lib/cameraState";
import { carState } from "@/lib/carState";
import { mutable } from "@/lib/journey";
import { VIEWPOINTS, type Viewpoint } from "@/lib/landmarkLayout";
import { clamp, damp, invLerp, lerp, proximity, smoothstep } from "@/lib/math";
import { offsetPoint } from "@/lib/route";
import { routeT } from "@/lib/timeline";

interface Props {
  reducedMotion: boolean;
}

/** Squared distance, in metres, below which the shot counts as arrived. */
const SETTLED_SQ = 0.02 * 0.02;

/**
 * The only thing that moves the camera.
 *
 * Each mission declares a camera mode; this controller resolves that mode into
 * a desired position and look-at target in car-local space, then damps towards
 * it. Nothing here teleports — a hard cut only happens on the very first frame.
 */
export function CameraController({ reducedMotion }: Props) {
  const camera = useThree((s) => s.camera);

  const v = useMemo(
    () => ({
      desired: new THREE.Vector3(),
      lookAt: new THREE.Vector3(),
      current: new THREE.Vector3(),
      currentLook: new THREE.Vector3(),
      anchor: new THREE.Vector3(),
      eye: new THREE.Vector3(),
      focus: new THREE.Vector3(),
      tmp: new THREE.Vector3(),
    }),
    [],
  );

  const first = useRef(true);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const p = mutable.smooth;
    const mission = missionAt(p);
    const { position: car, forward, right } = carState;

    // --- Resolve the desired shot -------------------------------------------
    // Widened from the const-asserted config literals.
    let back: number = CAMERA.follow.back;
    let up: number = CAMERA.follow.up;
    let side = 0;
    let lookAhead: number = CAMERA.follow.lookAhead;
    let lookUp: number = CAMERA.follow.lookUp;
    let lookOverride: THREE.Vector3 | null = null;
    // How far to turn from the car towards a landmark. Never 1: the car stays
    // in frame, which is what makes the shot read as "arriving somewhere".
    let lookBlend = 0;

    const mode = reducedMotion ? "follow" : mission.camera;

    if (mutable.phase !== "driving") {
      // Landing screen: a slow three-quarter orbit so the hero shot breathes.
      const angle = reducedMotion ? 0.7 : state.clock.elapsedTime * 0.075 + 0.7;
      back = Math.cos(angle) * 11 + 4;
      side = Math.sin(angle) * 11;
      up = 4.1;
      lookAhead = 0;
      lookUp = 1.05;
    } else if (mode === "cinematic") {
      const c = CAMERA.cinematic;
      // Slow arc from the car's front quarter round to behind it.
      const s = smoothstep(p / Math.max(mission.end, 0.001));
      const angle = (1 - s) * 1.15;
      back = c.back - s * 3.2;
      up = c.up + s * 1.4;
      side = Math.sin(angle) * 11 * (1 - s);
      lookAhead = c.lookAhead;
      lookUp = c.lookUp;
    } else if (mode === "destination") {
      const d = CAMERA.destination;
      const anchor = mission.id === "final" ? FINAL_BUILDING : HQ;
      const focus = proximity(p, anchor.at, 0.075);
      back = d.back;
      up = d.up + focus * 3.2;
      // Swing out to the opposite side of the building so it stays in frame.
      side = -Math.sign(anchor.lateral || 1) * focus * 6;
      lookAhead = d.lookAhead;
      lookUp = d.lookUp;
      if (focus > 0.02) {
        offsetPoint(routeT(anchor.at), anchor.lateral, 9, v.anchor);
        lookOverride = v.anchor;
        lookBlend = focus * 0.55;
      }
    } else if (mode === "showcase") {
      const s = CAMERA.showcase;
      let focus = 0;
      let anchorIndex = -1;
      for (let i = 0; i < projectStops.length; i++) {
        const f = proximity(p, projectStops[i], 0.032);
        if (f > focus) {
          focus = f;
          anchorIndex = i;
        }
      }
      back = s.back + focus * 2.6;
      up = s.up + focus * 2.2;
      lookAhead = s.lookAhead;
      lookUp = s.lookUp;
      if (anchorIndex >= 0 && focus > 0.02) {
        const anchor = PROJECT_ANCHORS[anchorIndex];
        // Pull towards the road's far side so the building fills the frame.
        side = -Math.sign(anchor.lateral) * focus * s.side;
        offsetPoint(routeT(anchor.at), anchor.lateral * 0.72, 7.5, v.anchor);
        lookOverride = v.anchor;
        lookBlend = focus * 0.78;
      }
    } else {
      const f = CAMERA.follow;
      back = f.back;
      up = f.up;
      lookAhead = f.lookAhead;
      lookUp = f.lookUp;
      // Lean into corners a touch; it reads as a chase camera rather than a rig.
      side = reducedMotion ? 0 : carState.steer * -2.4;
      // Drop back and low as speed rises.
      back += carState.speed * 1.8;
    }

    // --- Damp, in the car's frame of reference --------------------------
    //
    // Damping a world-space position makes the lag proportional to speed, so a
    // fast scroll leaves the camera stranded behind the world. Damping the
    // *offset* from the car instead keeps the framing bounded at any speed,
    // while still easing smoothly through changes of camera mode.
    v.desired.set(side, up, -back);

    if (lookOverride && lookBlend > 0) {
      // Express the landmark in the same local frame, then ease towards it.
      v.tmp.subVectors(lookOverride, car);
      v.lookAt.set(
        lerp(0, v.tmp.dot(right), lookBlend),
        lerp(lookUp, v.tmp.y, lookBlend),
        lerp(lookAhead, v.tmp.dot(forward), lookBlend),
      );
    } else {
      v.lookAt.set(0, lookUp, lookAhead);
    }

    // --- Read the board on the building the car has stopped at --------------
    //
    // Every word in the world is painted on a facade, so near a stop the shot
    // turns to that board: the camera stands off along the board's normal, just
    // far enough for the board to fit the frame, and eases back to the mode's
    // own shot between stops.
    if (mutable.phase === "driving") {
      const b = CAMERA.board;
      let shot: Viewpoint | null = null;
      let focus = 0;
      for (const vp of VIEWPOINTS) {
        // Square on the board around the stop itself, easing out towards the edges.
        const f = smoothstep((1 - Math.abs(p - vp.at) / vp.radius) * b.hold);
        if (f > focus) {
          focus = f;
          shot = vp;
        }
      }

      if (shot && focus > 0.001) {
        const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
        const tanHalf = Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2));
        const fitHeight = shot.height / (2 * tanHalf * b.fillY);
        const fitWidth = (a: number) => shot.width / (2 * tanHalf * a * b.fillX);
        // A portrait screen would otherwise back the camera into the buildings
        // across the road. Stand off no further than a widescreen shot would
        // and, if the board is then wider than the frame, slide across it as
        // the visitor scrolls through the stop.
        const limit = Math.max(fitHeight, fitWidth(b.referenceAspect)) * b.maxStandOff;
        const distance = Math.max(
          shot.minDistance,
          fitHeight,
          Math.min(fitWidth(aspect), limit),
        );
        const overflow = Math.max(0, shot.width - 2 * tanHalf * aspect * distance * b.fillX);
        const across = invLerp(shot.slide[0], shot.slide[1], p) * 2 - 1;
        const slide = across * (overflow / 2);

        v.focus.copy(shot.target).addScaledVector(shot.across, slide);
        v.eye.copy(v.focus).addScaledVector(shot.normal, distance);
        v.eye.y += shot.lift;

        // Blend in the car's frame, where the damping happens.
        v.tmp.subVectors(v.eye, car);
        v.desired.set(
          lerp(v.desired.x, v.tmp.dot(right), focus),
          lerp(v.desired.y, v.tmp.y, focus),
          lerp(v.desired.z, v.tmp.dot(forward), focus),
        );
        v.tmp.subVectors(v.focus, car);
        v.lookAt.set(
          lerp(v.lookAt.x, v.tmp.dot(right), focus),
          lerp(v.lookAt.y, v.tmp.y, focus),
          lerp(v.lookAt.z, v.tmp.dot(forward), focus),
        );
      }
    }

    if (first.current) {
      v.current.copy(v.desired);
      v.currentLook.copy(v.lookAt);
      first.current = false;
    } else {
      const posLambda = reducedMotion ? 60 : CAMERA.positionLambda;
      const lookLambda = reducedMotion ? 60 : CAMERA.targetLambda;
      v.current.x = damp(v.current.x, v.desired.x, posLambda, dt);
      v.current.y = damp(v.current.y, v.desired.y, posLambda, dt);
      v.current.z = damp(v.current.z, v.desired.z, posLambda, dt);
      v.currentLook.x = damp(v.currentLook.x, v.lookAt.x, lookLambda, dt);
      v.currentLook.y = damp(v.currentLook.y, v.lookAt.y, lookLambda, dt);
      v.currentLook.z = damp(v.currentLook.z, v.lookAt.z, lookLambda, dt);
    }

    cameraState.settling =
      v.current.distanceToSquared(v.desired) > SETTLED_SQ ||
      v.currentLook.distanceToSquared(v.lookAt) > SETTLED_SQ;

    // Back to world space against the car's current transform.
    v.tmp
      .copy(car)
      .addScaledVector(right, v.current.x)
      .addScaledVector(forward, v.current.z);
    v.tmp.y = car.y + v.current.y;

    v.anchor
      .copy(car)
      .addScaledVector(right, v.currentLook.x)
      .addScaledVector(forward, v.currentLook.z);
    v.anchor.y = car.y + v.currentLook.y;

    // Keep the camera above the road surface at all times.
    camera.position.set(v.tmp.x, Math.max(v.tmp.y, car.y + 1.4), v.tmp.z);
    camera.lookAt(v.anchor);

    // A gentle FOV push on fast sections adds speed without post-processing.
    const targetFov = reducedMotion ? CAMERA.fov : CAMERA.fov + clamp(carState.speed) * 6;
    const persp = camera as THREE.PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      const next = damp(persp.fov, targetFov, 3, dt);
      if (Math.abs(next - persp.fov) > 0.01) {
        persp.fov = next;
        persp.updateProjectionMatrix();
      }
    }
  });

  return null;
}
