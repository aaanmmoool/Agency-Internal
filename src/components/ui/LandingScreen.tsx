"use client";

import { LANDING, SITE } from "@/config/site";
import { Button, cx } from "./primitives";

interface Props {
  visible: boolean;
  /** Disabled until the critical scene chunks are ready. */
  ready: boolean;
  onStart: () => void;
  onSkipTo3D: () => void;
}

/**
 * The cinematic landing screen.
 *
 * The 3D world is already rendering behind this, holding a slow orbit of the
 * car — starting the mission fades this layer out rather than swapping scenes.
 */
export function LandingScreen({ visible, ready, onStart, onSkipTo3D }: Props) {
  return (
    <div
      className={cx(
        "fixed inset-0 z-40 flex flex-col transition-opacity duration-[900ms] ease-[var(--ease-out-expo)]",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!visible}
      inert={!visible || undefined}
    >
      {/* A single soft vignette so the type holds against the world behind it. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 60%, rgba(6,7,11,0.94) 0%, rgba(6,7,11,0.72) 40%, rgba(6,7,11,0.25) 100%)",
        }}
      />

      <header className="relative flex items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
        <p className="text-[0.72rem] font-medium tracking-label text-ink uppercase">
          {SITE.name}
        </p>
        <p className="hidden text-[0.66rem] tracking-label text-ink-faint uppercase sm:block">
          Engineering Studio
        </p>
      </header>

      <div className="relative flex flex-1 items-center px-6 pb-24 sm:px-10">
        <div className="max-w-2xl">
          <h1 className="text-[clamp(2.1rem,7vw,4.4rem)] leading-[0.98] font-medium tracking-display text-balance text-ink">
            {LANDING.headline}
          </h1>

          <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-ink-muted sm:text-base">
            {LANDING.subheading}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button onClick={onStart} className={ready ? "" : "pointer-events-none opacity-40"}>
              {LANDING.cta}
            </Button>
            <button
              type="button"
              onClick={onSkipTo3D}
              className="text-left text-[0.72rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink-muted"
            >
              {LANDING.secondaryCta}
            </button>
          </div>

          {!ready && (
            <p className="mt-5 font-mono text-[0.66rem] tracking-label text-ink-faint uppercase">
              Preparing the route…
            </p>
          )}
        </div>
      </div>

      <footer className="relative px-6 pb-8 sm:px-10">
        <p className="text-[0.66rem] tracking-label text-ink-faint uppercase">
          Scroll to drive · Left and right arrows jump between missions
        </p>
      </footer>
    </div>
  );
}
