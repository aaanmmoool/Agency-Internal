"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { labelTexture } from "@/lib/labelTexture";

interface Props {
  text: string;
  position: THREE.Vector3 | [number, number, number];
  rotationY?: number;
  /** World width of the plate; height follows the texture aspect. */
  width?: number;
  aspect?: number;
  color?: string;
  opacity?: number;
  weight?: number;
  letterSpacing?: number;
  /**
   * Also render the sign facing the other way. A double-sided material would
   * show the text mirrored from behind, so this places a second quad instead.
   */
  backToBack?: boolean;
}

/**
 * Signage drawn as an unlit textured quad.
 *
 * Textures come from a shared cache keyed on the text and styling, so repeated
 * labels cost one texture between them. One draw call per sign, no font loading
 * and no SDF text renderer in the bundle.
 */
export function WorldLabel({
  text,
  position,
  rotationY = 0,
  width = 6,
  aspect = 5,
  color = "#E8ECF6",
  opacity = 0.92,
  weight = 600,
  letterSpacing = 0.14,
  backToBack = false,
}: Props) {
  const texture = useMemo(
    () => labelTexture({ text, color, aspect, weight, letterSpacing, width: 768 }),
    [text, color, aspect, weight, letterSpacing],
  );

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity,
        toneMapped: false,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [texture, opacity],
  );

  // The texture itself is cache-owned; only the material belongs to this instance.
  useEffect(() => () => material.dispose(), [material]);

  const pos = Array.isArray(position)
    ? position
    : ([position.x, position.y, position.z] as [number, number, number]);

  const height = width / aspect;

  return (
    <group position={pos}>
      <mesh rotation={[0, rotationY, 0]} material={material}>
        <planeGeometry args={[width, height]} />
      </mesh>
      {backToBack && (
        <mesh rotation={[0, rotationY + Math.PI, 0]} material={material}>
          <planeGeometry args={[width, height]} />
        </mesh>
      )}
    </group>
  );
}
