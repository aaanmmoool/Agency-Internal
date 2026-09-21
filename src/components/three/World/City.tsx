"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { QualitySettings } from "@/config/quality";
import { COLORS } from "@/config/scene";
import { useDisposable } from "@/hooks/useDisposable";
import { bridgePillars, generateWorld } from "@/lib/worldGen";
import { ChunkedField, InstancedField } from "./InstancedField";

interface Props {
  quality: QualitySettings;
}

/**
 * Every repeated object in the world.
 *
 * Buildings, windows, trees, street lights, signs and barriers are each a
 * handful of InstancedMeshes bucketed by position — roughly twenty draw calls
 * for a city of several hundred objects, and zero React components per object.
 */
export function City({ quality }: Props) {
  const world = useMemo(() => generateWorld(quality), [quality]);
  const pillars = useMemo(() => bridgePillars(), []);

  const geo = useDisposable(
    () => ({
      // Unit box: instance scale carries the real dimensions.
      building: new THREE.BoxGeometry(1, 1, 1),
      window: new THREE.PlaneGeometry(0.78, 0.92),
      // Tree parts are pre-translated so a single transform positions both.
      trunk: translated(new THREE.CylinderGeometry(0.13, 0.19, 1.7, 5), 0, 0.85, 0),
      foliage: translated(new THREE.ConeGeometry(1.15, 3.3, 7), 0, 2.7, 0),
      lightPole: translated(new THREE.CylinderGeometry(0.09, 0.12, 6.2, 6), 0, 3.1, 0),
      // The arm reaches out along local -X, over the carriageway.
      lightArm: translated(new THREE.BoxGeometry(2.4, 0.12, 0.12), -1.2, 6.1, 0),
      lightHead: translated(new THREE.BoxGeometry(0.62, 0.1, 0.34), -2.3, 5.99, 0),
      signPost: translated(new THREE.CylinderGeometry(0.06, 0.06, 3.1, 5), 0, 1.55, 0),
      signPanel: translated(new THREE.BoxGeometry(2.1, 0.86, 0.08), 0, 2.9, 0),
      barrier: new THREE.BoxGeometry(0.14, 0.92, 1.9),
      pillar: new THREE.CylinderGeometry(1.1, 1.5, 1, 8),
    }),
  );

  const mat = useDisposable(
    () => ({
      building: new THREE.MeshStandardMaterial({
        color: COLORS.buildingBase,
        roughness: 0.86,
        metalness: 0.08,
      }),
      window: new THREE.MeshBasicMaterial({
        color: COLORS.window,
        toneMapped: false,
        transparent: true,
        opacity: 0.72,
        side: THREE.FrontSide,
      }),
      trunk: new THREE.MeshStandardMaterial({ color: "#262832", roughness: 0.95 }),
      foliage: new THREE.MeshStandardMaterial({ color: "#26463D", roughness: 0.9 }),
      metal: new THREE.MeshStandardMaterial({
        color: "#3A4154",
        roughness: 0.55,
        metalness: 0.65,
      }),
      lamp: new THREE.MeshBasicMaterial({ color: "#FFDCAE", toneMapped: false }),
      panel: new THREE.MeshStandardMaterial({
        color: "#1D2231",
        roughness: 0.7,
        metalness: 0.2,
        side: THREE.DoubleSide,
      }),
      barrier: new THREE.MeshStandardMaterial({
        color: "#222734",
        roughness: 0.7,
        metalness: 0.3,
      }),
    }),
  );

  const shadows = quality.shadows;

  return (
    <group>
      <ChunkedField
        transforms={world.buildings}
        geometry={geo.building}
        material={mat.building}
        castShadow={shadows}
        receiveShadow={shadows}
        cellSize={80}
      />
      <ChunkedField
        transforms={world.windows}
        geometry={geo.window}
        material={mat.window}
        cellSize={80}
      />

      <ChunkedField transforms={world.trees} geometry={geo.trunk} material={mat.trunk} cellSize={90} />
      <ChunkedField
        transforms={world.trees}
        geometry={geo.foliage}
        material={mat.foliage}
        castShadow={shadows}
        cellSize={90}
      />

      <ChunkedField
        transforms={world.streetLights}
        geometry={geo.lightPole}
        material={mat.metal}
        cellSize={90}
      />
      <ChunkedField
        transforms={world.streetLights}
        geometry={geo.lightArm}
        material={mat.metal}
        cellSize={90}
      />
      <ChunkedField
        transforms={world.streetLights}
        geometry={geo.lightHead}
        material={mat.lamp}
        cellSize={90}
      />

      <ChunkedField transforms={world.signs} geometry={geo.signPost} material={mat.metal} cellSize={110} />
      <ChunkedField transforms={world.signs} geometry={geo.signPanel} material={mat.panel} cellSize={110} />

      <ChunkedField
        transforms={world.barriers}
        geometry={geo.barrier}
        material={mat.barrier}
        cellSize={60}
      />

      {/* Bridge pillars — few enough to place directly. */}
      <InstancedField
        transforms={pillars.map((p) => ({
          position: new THREE.Vector3(p.position.x, p.height / 2 - 0.2, p.position.z),
          rotationY: 0,
          scale: new THREE.Vector3(1, p.height + 0.4, 1),
        }))}
        geometry={geo.pillar}
        material={mat.metal}
        castShadow={shadows}
      />
    </group>
  );
}

/** Pre-translates a geometry so instance transforms stay a single position. */
function translated<T extends THREE.BufferGeometry>(g: T, x: number, y: number, z: number): T {
  g.translate(x, y, z);
  return g;
}
