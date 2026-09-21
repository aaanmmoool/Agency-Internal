"use client";

import { processSteps } from "@/data/process";
import { Eyebrow, Panel, cx } from "../primitives";

interface Props {
  /** Index of the checkpoint the car is passing, or -1 between them. */
  activeIndex: number;
}

/** Mission 05 — the five delivery checkpoints. */
export function ProcessPanel({ activeIndex }: Props) {
  return (
    <Panel labelledBy="mission-process-heading" className="max-w-lg">
      <Eyebrow className="text-ink-faint">Mission 05</Eyebrow>
      <h2
        id="mission-process-heading"
        className="mt-2 text-2xl font-medium tracking-display text-ink sm:text-3xl"
      >
        How We Work
      </h2>

      <ol className="mt-6 space-y-4">
        {processSteps.map((step, i) => {
          const isActive = i === activeIndex;
          const isPassed = activeIndex > i;
          return (
            <li key={step.index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cx(
                    "font-mono text-[0.72rem] transition-colors duration-500",
                    isActive ? "text-accent" : isPassed ? "text-ink-muted" : "text-ink-faint",
                  )}
                >
                  {step.index}
                </span>
                {i < processSteps.length - 1 && (
                  <span
                    className={cx(
                      "mt-2 w-px flex-1 transition-colors duration-500",
                      isPassed ? "bg-ink-faint" : "bg-edge",
                    )}
                  />
                )}
              </div>

              <div className="pb-1">
                <h3
                  className={cx(
                    "text-[0.78rem] tracking-label uppercase transition-colors duration-500",
                    isActive ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {step.title}
                </h3>
                <div
                  className={cx(
                    "grid transition-all duration-500 ease-[var(--ease-out-expo)]",
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pt-2 text-[0.84rem] leading-relaxed text-ink-muted">
                      {step.description}
                    </p>
                    <p className="mt-2 text-[0.76rem] leading-relaxed text-ink-faint">
                      <span className="tracking-label uppercase">Output</span> — {step.output}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
