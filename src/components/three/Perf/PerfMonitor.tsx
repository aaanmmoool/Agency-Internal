"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { getLoadMs, pushSample } from "@/lib/perf";

/**
 * Samples renderer statistics once per second and publishes them to the
 * overlay. Development only — see the guard in `Experience.tsx`.
 */
export function PerfMonitor() {
  const gl = useThree((s) => s.gl);
  const state = useRef({ frames: 0, elapsed: 0, worstFrame: 0 });

  useFrame((_, delta) => {
    const s = state.current;
    s.frames += 1;
    s.elapsed += delta;
    s.worstFrame = Math.max(s.worstFrame, delta * 1000);

    if (s.elapsed < 1) return;

    const info = gl.info;
    const memory = info.memory;
    const render = info.render;

    pushSample({
      fps: Math.round(s.frames / s.elapsed),
      frameMs: Number(((s.elapsed / s.frames) * 1000).toFixed(2)),
      drawCalls: render.calls,
      triangles: render.triangles,
      programs: info.programs?.length ?? 0,
      geometries: memory.geometries,
      textures: memory.textures,
      // Three does not expose texture bytes; estimate from count and a typical size.
      textureMB: Number(((memory.textures * 0.75) / 1).toFixed(1)),
      loadMs: getLoadMs(),
    });

    s.frames = 0;
    s.elapsed = 0;
    s.worstFrame = 0;
  });

  return null;
}
