"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { COLORS } from "@/config/scene";
import { markReady } from "@/lib/loading";
import { buildRoad, disposeRoad, routeBounds } from "@/lib/roadGeometry";

interface Props {
  segments: number;
  shadows: boolean;
}

/**
 * The road, kerbs and markings — four draw calls for the whole route.
 * Geometry is rebuilt only when the quality tier changes the segment count.
 */
export function Road({ segments, shadows }: Props) {
  const road = useMemo(() => buildRoad(segments), [segments]);
  const [bounds] = useState(routeBounds);

  useEffect(() => () => disposeRoad(road), [road]);
  useEffect(() => markReady("world"), []);

  const materials = useMemo(
    () => ({
      asphalt: new THREE.MeshStandardMaterial({
        color: COLORS.asphalt,
        roughness: 0.92,
        metalness: 0.05,
      }),
      kerb: new THREE.MeshStandardMaterial({
        color: COLORS.sidewalk,
        roughness: 0.84,
        metalness: 0.02,
      }),
      marking: new THREE.MeshBasicMaterial({ color: COLORS.laneMark, toneMapped: false }),
      ground: new THREE.MeshStandardMaterial({
        color: COLORS.ground,
        roughness: 1,
        metalness: 0,
      }),
    }),
    [],
  );

  useEffect(
    () => () => Object.values(materials).forEach((m) => m.dispose()),
    [materials],
  );

  return (
    <group>
      {/* Ground plane, sized from the route bounds so the horizon never shows an edge. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[bounds.center.x, -0.06, bounds.center.z]}
        material={materials.ground}
        receiveShadow={shadows}
      >
        <planeGeometry args={[bounds.size, bounds.size]} />
      </mesh>

      <mesh geometry={road.surface} material={materials.asphalt} receiveShadow={shadows} />
      <mesh geometry={road.kerbs} material={materials.kerb} receiveShadow={shadows} />
      <mesh geometry={road.centreLine} material={materials.marking} />
      <mesh geometry={road.edgeLines} material={materials.marking} />
    </group>
  );
}
