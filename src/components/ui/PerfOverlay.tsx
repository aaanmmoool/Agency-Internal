"use client";

import { useState, useSyncExternalStore } from "react";
import type { QualityTier } from "@/types";
import { getPerfSample, getPerfServerSample, subscribePerf } from "@/lib/perf";

interface Props {
  tier: QualityTier;
}

/**
 * Development-only stats readout.
 *
 * Mounted from `page.tsx` behind a `NODE_ENV` check, so it is removed from
 * production bundles at build time.
 */
export function PerfOverlay({ tier }: Props) {
  const sample = useSyncExternalStore(subscribePerf, getPerfSample, getPerfServerSample);
  // Collapsed by default so it never sits over the landing call to action.
  const [open, setOpen] = useState(false);

  const rows: [string, string][] = [
    ["fps", String(sample.fps)],
    ["frame", `${sample.frameMs.toFixed(2)} ms`],
    ["draws", String(sample.drawCalls)],
    ["tris", sample.triangles.toLocaleString()],
    ["geom", String(sample.geometries)],
    ["tex", String(sample.textures)],
    ["progs", String(sample.programs)],
    ["tier", tier],
    ["load", sample.loadMs ? `${sample.loadMs} ms` : "—"],
  ];

  return (
    <div className="fixed right-4 bottom-16 z-[60] text-right font-mono text-[0.62rem] text-ink-muted">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded border border-edge bg-void/90 px-2 py-1 tracking-label uppercase"
      >
        perf {open ? "−" : "+"}
      </button>

      {open && (
        <dl className="mt-1 ml-auto grid w-max grid-cols-[auto_auto] gap-x-3 gap-y-0.5 rounded border border-edge bg-void/90 px-2.5 py-2 tabular-nums">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-faint">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
