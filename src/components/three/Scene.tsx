"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import type { QualitySettings } from "@/config/quality";
import { CameraController } from "./Camera/CameraController";
import { CarRig } from "./Car/CarRig";
import { Atmosphere } from "./World/Atmosphere";
import { Road } from "./World/Road";

/**
 * Secondary scene chunks.
 *
 * The road, the car and the lighting are enough to be interactive, so the city
 * and the landmark structures are split out and mounted once the first frame
 * has been presented. They arrive within a frame or two on desktop and keep the
 * time-to-interactive low on constrained devices.
 */
const City = lazy(() => import("./World/City").then((m) => ({ default: m.City })));
const Districts = lazy(() => import("./World/Districts"));

interface Props {
  quality: QualitySettings;
  reducedMotion: boolean;
}

/** Defers non-critical scene chunks until the browser is idle. */
function useDeferredScene(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const schedule =
      typeof window.requestIdleCallback === "function"
        ? (fn: () => void) => window.requestIdleCallback(fn, { timeout: 600 })
        : (fn: () => void) => window.setTimeout(fn, 120);

    const handle = schedule(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      if (typeof handle === "number") clearTimeout(handle);
    };
  }, []);

  return ready;
}

/**
 * The 3D world root.
 *
 * Every child animates through `useFrame` against the shared journey store, so
 * this component renders once per quality change and never again while driving.
 */
export function Scene({ quality, reducedMotion }: Props) {
  const deferred = useDeferredScene();

  return (
    <>
      <Atmosphere quality={quality} />
      <Road segments={quality.roadSegments} shadows={quality.shadows} />

      {/* Car before camera: the controller reads the transform written this frame. */}
      <CarRig
        effects={quality.carEffects}
        shadows={quality.shadows}
        reducedMotion={reducedMotion}
      />
      <CameraController reducedMotion={reducedMotion} />

      {deferred && (
        <Suspense fallback={null}>
          <City quality={quality} />
          <Districts shadows={quality.shadows} signDensity={quality.signDensity} />
        </Suspense>
      )}
    </>
  );
}
