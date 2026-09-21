"use client";

import { useSyncExternalStore } from "react";
import {
  LOAD_STEPS,
  getLoadServerSnapshot,
  getLoadSnapshot,
  subscribeLoading,
} from "@/lib/loading";
import { cx } from "./primitives";

interface Props {
  /** Fades out once the world is interactive and the landing screen takes over. */
  done: boolean;
}

const BAR_CELLS = 24;

/**
 * The cinematic loader.
 *
 * Progress comes from real readiness signals published by the scene chunks —
 * nothing here is on a timer, so the bar cannot finish before the world does.
 */
export function LoadingScreen({ done }: Props) {
  const loading = useSyncExternalStore(subscribeLoading, getLoadSnapshot, getLoadServerSnapshot);
  const filled = Math.round(loading.progress * BAR_CELLS);

  return (
    <div
      id="world-loader"
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center bg-void transition-opacity duration-700",
        done ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      role="status"
      aria-live="polite"
      aria-label={`Loading the interactive world, ${Math.round(loading.progress * 100)} percent`}
    >
      <div className="w-full max-w-sm px-6">
        <p className="font-mono text-[0.7rem] tracking-label text-ink-faint uppercase">
          Initializing world
        </p>

        <div className="mt-4 font-mono text-sm text-accent" aria-hidden="true">
          <span className="text-ink-faint">[</span>
          {"█".repeat(filled)}
          <span className="text-edge-strong">{"░".repeat(BAR_CELLS - filled)}</span>
          <span className="text-ink-faint">]</span>
        </div>

        <ul className="mt-7 space-y-2">
          {LOAD_STEPS.map((step) => {
            const ready = loading.ready.includes(step.id);
            return (
              <li
                key={step.id}
                className="flex items-center justify-between font-mono text-[0.68rem] tracking-label uppercase"
              >
                <span className={ready ? "text-ink-muted" : "text-ink-faint"}>{step.label}</span>
                <span className={ready ? "text-accent" : "text-edge-strong"}>
                  {ready ? "READY" : "····"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
