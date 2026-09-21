"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Transform } from "@/lib/worldGen";

interface Props {
  transforms: Transform[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
  /** Frustum culling is per-instanced-mesh, so long fields are split into chunks. */
  frustumCulled?: boolean;
}

const matrix = new THREE.Matrix4();
const quaternion = new THREE.Quaternion();
const euler = new THREE.Euler();

/**
 * Renders any number of repeated props as one InstancedMesh.
 *
 * Matrices are written once in a layout effect and never touched again — these
 * objects are static, so there is no per-frame cost beyond a single draw call.
 */
export function InstancedField({
  transforms,
  geometry,
  material,
  castShadow = false,
  receiveShadow = false,
  frustumCulled = true,
}: Props) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < transforms.length; i++) {
      const t = transforms[i];
      euler.set(0, t.rotationY, 0);
      quaternion.setFromEuler(euler);
      matrix.compose(t.position, quaternion, t.scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.count = transforms.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [transforms]);

  if (transforms.length === 0) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, transforms.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={frustumCulled}
    />
  );
}

/**
 * Groups a field into spatial grid cells, one InstancedMesh per cell.
 *
 * Frustum culling works per mesh, so a single InstancedMesh spanning the whole
 * route is never culled and submits every instance every frame. Bucketing by
 * position lets the renderer reject the parts of the city that are behind you.
 */
export function ChunkedField({
  transforms,
  cellSize = 70,
  ...rest
}: Props & { cellSize?: number }) {
  const chunks = useMemo(() => {
    const cells = new Map<string, Transform[]>();
    for (const t of transforms) {
      const key = `${Math.floor(t.position.x / cellSize)}:${Math.floor(t.position.z / cellSize)}`;
      const bucket = cells.get(key);
      if (bucket) bucket.push(t);
      else cells.set(key, [t]);
    }
    return [...cells.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  }, [transforms, cellSize]);

  return (
    <>
      {chunks.map(([key, chunk]) => (
        <InstancedField key={key} transforms={chunk} {...rest} />
      ))}
    </>
  );
}
