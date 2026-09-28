"use client";

import { useEffect, useMemo } from "react";
import { invalidate, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  boardFontsLoaded,
  boardFontsReady,
  createBoardTexture,
  redrawBoard,
  type BoardSpec,
} from "@/lib/boardTexture";

/**
 * The unlit material a board is drawn with, owning its canvas texture.
 *
 * Laid out once — then again only if the page typeface arrives after the first
 * paint. Callers may animate `opacity`; the material is already transparent.
 */
export function useBoardMaterial(spec: BoardSpec, density: number): THREE.MeshBasicMaterial {
  const texture = useMemo(() => createBoardTexture(spec, density), [spec, density]);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
      }),
    [texture],
  );

  useEffect(() => {
    let live = true;
    if (!boardFontsLoaded()) {
      boardFontsReady().then(() => {
        if (!live) return;
        redrawBoard(texture, spec, density);
        invalidate();
      });
    }
    return () => {
      live = false;
      texture.dispose();
    };
  }, [texture, spec, density]);

  useEffect(() => () => material.dispose(), [material]);

  return material;
}

interface Props {
  spec: BoardSpec;
  /** Texture pixels per world metre, from the quality tier. */
  density: number;
  position: [number, number, number];
  rotationY?: number;
  /** Makes the board a control: pointer cursor on hover, `onSelect` on click. */
  onSelect?: () => void;
}

/**
 * Content painted onto a building.
 *
 * One unlit quad carrying a canvas texture, so a board costs a single draw call
 * and never touches React while driving.
 */
export function FacadeBoard({ spec, density, position, rotationY = 0, onSelect }: Props) {
  const material = useBoardMaterial(spec, density);

  const handlers = onSelect
    ? {
        onClick: (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onSelect();
        },
        onPointerOver: (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          document.body.style.cursor = "";
        },
      }
    : undefined;

  // Never leave the pointer cursor behind if the board unmounts under it.
  useEffect(() => {
    if (!onSelect) return;
    return () => {
      document.body.style.cursor = "";
    };
  }, [onSelect]);

  return (
    <mesh position={position} rotation={[0, rotationY, 0]} material={material} {...handlers}>
      <planeGeometry args={[spec.width, spec.height]} />
    </mesh>
  );
}
