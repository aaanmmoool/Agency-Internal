"use client";

import { forwardRef } from "react";
import type * as THREE from "three";
import type { CarGeometries, CarMaterials } from "@/lib/carMaterials";
import { COLORS } from "@/config/scene";

interface Props {
  materials: CarMaterials;
  geometries: CarGeometries;
  /** Four wheel pivots, front-left, front-right, rear-left, rear-right. */
  wheelRefs: React.RefObject<THREE.Group | null>[];
  /** Adds the single forward spotlight. Disabled on the low tier. */
  effects: boolean;
}

const WHEELS: { x: number; z: number }[] = [
  { x: 0.9, z: 1.42 },
  { x: -0.9, z: 1.42 },
  { x: 0.9, z: -1.44 },
  { x: -0.9, z: -1.44 },
];

export const CarModel = forwardRef<THREE.Group, Props>(function CarModel(
  { materials, geometries, wheelRefs, effects },
  ref,
) {
  return (
    <group ref={ref} dispose={null}>
      {/*
        Proportions do the work at this poly count: a long, low body (4.3 long,
        1.29 tall) with a short greenhouse set back over the rear axle reads as
        a coupe, where an upright cabin on a flat deck reads as a van.
      */}
      <mesh position={[0, 0.42, 0]} material={materials.body} castShadow>
        <boxGeometry args={[1.9, 0.44, 4.3]} />
      </mesh>
      <mesh position={[0, 0.77, -0.06]} material={materials.body} castShadow>
        <boxGeometry args={[1.84, 0.28, 4.08]} />
      </mesh>
      {/* Bonnet crease, slightly proud of the shoulder line */}
      <mesh position={[0, 0.92, 1.42]} material={materials.body} castShadow>
        <boxGeometry args={[1.64, 0.06, 1.3]} />
      </mesh>

      {/* Greenhouse: glass, then a narrower roof panel for the tumblehome */}
      <mesh position={[0, 1.07, -0.34]} material={materials.glass} castShadow>
        <boxGeometry args={[1.5, 0.34, 1.86]} />
      </mesh>
      <mesh position={[0, 1.26, -0.42]} material={materials.body} castShadow>
        <boxGeometry args={[1.3, 0.06, 1.36]} />
      </mesh>

      {/* Splitter and diffuser */}
      <mesh position={[0, 0.27, 2.13]} material={materials.trim}>
        <boxGeometry args={[1.84, 0.16, 0.2]} />
      </mesh>
      <mesh position={[0, 0.3, -2.13]} material={materials.trim}>
        <boxGeometry args={[1.84, 0.2, 0.2]} />
      </mesh>
      {/* Side skirts */}
      <mesh position={[0.96, 0.26, 0]} material={materials.trim}>
        <boxGeometry args={[0.1, 0.2, 3.1]} />
      </mesh>
      <mesh position={[-0.96, 0.26, 0]} material={materials.trim}>
        <boxGeometry args={[0.1, 0.2, 3.1]} />
      </mesh>
      {/* Grille */}
      <mesh position={[0, 0.52, 2.15]} material={materials.trim}>
        <boxGeometry args={[1.28, 0.18, 0.08]} />
      </mesh>

      {/* Headlights */}
      <mesh position={[0.64, 0.74, 2.12]} material={materials.headlight}>
        <boxGeometry args={[0.4, 0.09, 0.06]} />
      </mesh>
      <mesh position={[-0.64, 0.74, 2.12]} material={materials.headlight}>
        <boxGeometry args={[0.4, 0.09, 0.06]} />
      </mesh>

      {/* Brake light bar */}
      <mesh position={[0, 0.82, -2.11]} material={materials.brake}>
        <boxGeometry args={[1.5, 0.08, 0.06]} />
      </mesh>

      {effects && (
        // Exactly one realtime light travels with the car.
        <spotLight
          position={[0, 0.72, 1.9]}
          target-position={[0, -0.4, 22]}
          angle={0.5}
          penumbra={0.75}
          distance={46}
          intensity={30}
          color={COLORS.headlight}
          castShadow={false}
        />
      )}

      {WHEELS.map((w, i) => (
        // Outer group steers, inner mesh spins — no quaternion rebuild per frame.
        <group key={i} ref={wheelRefs[i]} position={[w.x, 0.38, w.z]}>
          <mesh geometry={geometries.wheel} material={materials.tyre} castShadow />
          <mesh
            geometry={geometries.hub}
            material={materials.hub}
            position={[w.x > 0 ? 0.04 : -0.04, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
});
