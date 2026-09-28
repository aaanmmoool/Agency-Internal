"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA } from "@/config/scene";
import type { QualitySettings } from "@/config/quality";
import { cameraState } from "@/lib/cameraState";
import { mutable } from "@/lib/journey";
import { Scene } from "./Scene";
import { PerfMonitor } from "./Perf/PerfMonitor";

interface Props {
  quality: QualitySettings;
  reducedMotion: boolean;
}

/**
 * The single Canvas for the whole site.
 *
 * It is mounted once, fixed behind the HTML layer, and takes no props that
 * change while driving — the HUD re-rendering never touches the 3D tree.
 */
export function Experience({ quality, reducedMotion }: Props) {
  return (
    <Canvas
      // Starts continuous; FrameloopManager drops to demand once settled.
      frameloop="always"
      dpr={quality.dpr}
      shadows={quality.shadows}
      camera={{ fov: CAMERA.fov, near: CAMERA.near, far: quality.far, position: [0, 5, 112] }}
      gl={{
        antialias: quality.antialias,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.18;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      // The canvas is decorative; all content has an HTML equivalent.
      aria-hidden="true"
    >
      <FrameloopManager />
      <Scene quality={quality} reducedMotion={reducedMotion} />
      {process.env.NODE_ENV === "development" && <PerfMonitor />}
    </Canvas>
  );
}

/**
 * Switches between continuous and demand rendering.
 *
 * Continuous while the landing shot is orbiting, the journey is in motion or
 * the camera is still easing into a shot; demand once everything has settled,
 * which drops a parked scene to zero GPU work. Any `invalidate()` from the
 * journey driver runs one frame, which is enough for this to notice motion and
 * switch back.
 */
function FrameloopManager() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const current = useRef<"always" | "demand">("always");
  const warmup = useRef(0);

  useEffect(() => {
    // Give the environment map and the deferred chunks a few frames to settle.
    warmup.current = performance.now() + 1500;
  }, []);

  useFrame(() => {
    const warming = performance.now() < warmup.current;
    const want: "always" | "demand" =
      warming ||
      mutable.phase !== "driving" ||
      mutable.moving ||
      cameraState.settling
        ? "always"
        : "demand";

    if (want !== current.current) {
      current.current = want;
      setFrameloop(want);
    }
  });

  return null;
}
