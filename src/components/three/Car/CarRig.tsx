"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CAR, COLORS } from "@/config/scene";
import { createCarGeometries, createCarMaterials, disposeCar } from "@/lib/carMaterials";
import { carState } from "@/lib/carState";
import { clamp, damp, dampAngle } from "@/lib/math";
import { mutable } from "@/lib/journey";
import { updateEngine } from "@/lib/audio";
import { markReady } from "@/lib/loading";
import { ROUTE_LENGTH, curvatureAt, pointAt, tangentAt } from "@/lib/route";
import { routeT } from "@/lib/timeline";
import { CarModel } from "./CarModel";

interface Props {
  effects: boolean;
  shadows: boolean;
  reducedMotion: boolean;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Drives the car along the route spline. No physics engine: position and
 * orientation are sampled from the curve and damped, which is both cheaper and
 * far more predictable than simulating a vehicle.
 *
 * Runs entirely inside `useFrame` — this component never re-renders while driving.
 */
export function CarRig({ effects, shadows, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const wheelRefs = useMemo(
    () => Array.from({ length: 4 }, () => ({ current: null as THREE.Group | null })),
    [],
  );

  // Lazy initialisers: created once, never recreated by a re-render.
  const [materials] = useState(createCarMaterials);
  const [geometries] = useState(createCarGeometries);

  useEffect(() => () => disposeCar(materials, geometries), [materials, geometries]);
  useEffect(() => markReady("car"), []);

  // Scratch vectors, allocated once.
  const scratch = useMemo(
    () => ({
      position: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      right: new THREE.Vector3(),
    }),
    [],
  );

  const anim = useRef({
    wheelSpin: 0,
    steer: 0,
    roll: 0,
    pitch: 0,
    bounce: 0,
    brake: 0,
    speed: 0,
    lastSpeed: 0,
    initialised: false,
  });

  useFrame((_, rawDelta) => {
    const g = group.current;
    const body = bodyRef.current;
    if (!g || !body) return;

    const dt = Math.min(rawDelta, 0.05);
    const a = anim.current;

    const t = routeT(mutable.smooth);
    pointAt(t, scratch.position);
    tangentAt(t, scratch.tangent);
    scratch.right.crossVectors(scratch.tangent, UP).normalize();

    // The car keeps to the right-hand lane.
    scratch.position.addScaledVector(scratch.right, CAR.laneOffset);

    // --- Position & heading -------------------------------------------------
    const heading = Math.atan2(scratch.tangent.x, scratch.tangent.z);

    if (!a.initialised) {
      g.position.copy(scratch.position);
      g.rotation.y = heading;
      a.initialised = true;
    } else {
      const lambda = reducedMotion ? 60 : 14;
      g.position.x = damp(g.position.x, scratch.position.x, lambda, dt);
      g.position.y = damp(g.position.y, scratch.position.y, lambda, dt);
      g.position.z = damp(g.position.z, scratch.position.z, lambda, dt);
      g.rotation.y = dampAngle(g.rotation.y, heading, reducedMotion ? 60 : 9, dt);
    }

    // --- Speed --------------------------------------------------------------
    // `velocity` is progress-per-second; convert to world units per second.
    const worldSpeed = Math.abs(mutable.velocity) * ROUTE_LENGTH;
    a.speed = damp(a.speed, worldSpeed, 6, dt);

    const signedSpeed = mutable.velocity * ROUTE_LENGTH;
    a.wheelSpin += (signedSpeed / CAR.wheelRadius) * dt;

    // --- Steering -----------------------------------------------------------
    const curvature = curvatureAt(t);
    const steerTarget = clamp(-curvature * 2.4, -1, 1) * CAR.maxSteer;
    a.steer = damp(a.steer, reducedMotion ? 0 : steerTarget, 7, dt);

    for (let i = 0; i < 4; i++) {
      const w = wheelRefs[i].current;
      if (!w) continue;
      w.rotation.order = "YXZ";
      // Front wheels (0, 1) steer; all four spin.
      w.rotation.y = i < 2 ? a.steer : 0;
      w.rotation.x = a.wheelSpin;
    }

    // --- Body attitude ------------------------------------------------------
    if (reducedMotion) {
      body.rotation.z = damp(body.rotation.z, 0, 10, dt);
      body.rotation.x = damp(body.rotation.x, 0, 10, dt);
      body.position.y = damp(body.position.y, 0, 10, dt);
    } else {
      const accel = (a.speed - a.lastSpeed) / Math.max(dt, 0.0001);
      // Roll into corners, pitch under acceleration, and a slow suspension float.
      a.roll = damp(a.roll, curvature * a.speed * CAR.bodyRollFactor, 5, dt);
      a.pitch = damp(a.pitch, clamp(-accel * 0.004, -0.05, 0.05), 5, dt);
      a.bounce = damp(
        a.bounce,
        Math.sin(mutable.elapsed * 6.2) * 0.012 * clamp(a.speed / 18),
        8,
        dt,
      );
      body.rotation.z = clamp(a.roll, -0.1, 0.1);
      body.rotation.x = a.pitch;
      body.position.y = a.bounce * CAR.suspensionFactor * 8;
    }

    // --- Brake lights -------------------------------------------------------
    // Full brake under deceleration; a dim parked glow when fully stopped.
    const decelerating = a.speed < a.lastSpeed - 0.35;
    const nearlyStopped = a.speed < 1.2;
    const brakeTarget = decelerating ? 1 : nearlyStopped ? 0.4 : 0;
    a.brake = damp(a.brake, brakeTarget, 9, dt);
    materials.brake.emissiveIntensity = 0.3 + a.brake * 2.4;

    // Headlights dim slightly when stationary, which reads as an idling engine.
    materials.headlight.emissiveIntensity = 1.6 + clamp(a.speed / 22) * 1.4;

    a.lastSpeed = a.speed;

    // --- Publish to the camera controller ----------------------------------
    carState.position.copy(g.position);
    carState.forward.set(Math.sin(g.rotation.y), 0, Math.cos(g.rotation.y));
    carState.right.crossVectors(carState.forward, UP).normalize();
    carState.heading = g.rotation.y;
    carState.steer = a.steer / CAR.maxSteer;
    carState.speed = clamp(a.speed / 34);
    carState.brake = a.brake;

    // No-op unless audio has been enabled from a user gesture.
    updateEngine(carState.speed, clamp(a.speed / 22));
  });

  return (
    <group ref={group}>
      {/* Contact shadow substitute: a cheap dark ellipse that always reads well. */}
      {!shadows && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[2.1, 20]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.34} depthWrite={false} />
        </mesh>
      )}
      <CarModel
        ref={bodyRef}
        materials={materials}
        geometries={geometries}
        wheelRefs={wheelRefs}
        effects={effects}
      />
      {effects && (
        // Brake glow: a flat additive plane behind the car, no light cost.
        <BrakeGlow brake={materials.brake} />
      )}
    </group>
  );
}

function BrakeGlow({ brake }: { brake: THREE.MeshStandardMaterial }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current?.material as THREE.MeshBasicMaterial | undefined;
    if (!m) return;
    // Track the brake material so the glow and the bar stay in sync.
    m.opacity = clamp((brake.emissiveIntensity - 0.3) / 2.4) * 0.2;
  });
  return (
    <mesh ref={ref} position={[0, 0.78, -2.45]}>
      <planeGeometry args={[3, 1.1]} />
      <meshBasicMaterial
        color={COLORS.brake}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
