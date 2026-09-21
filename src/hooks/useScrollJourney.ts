"use client";

import { useEffect } from "react";
import { invalidate } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JOURNEY } from "@/config/scene";
import { clamp, damp } from "@/lib/math";
import type { QualityTier } from "@/types";
import { mutable, publish } from "@/lib/journey";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll distance for the whole journey, in viewport heights.
 *
 * Constrained devices get a shorter run: the same content and the same route,
 * covered in fewer screens, so a phone is not asked to hold 60fps for as long.
 */
export const SCROLL_SCREENS: Record<QualityTier, number> = {
  high: 17,
  medium: 15,
  low: 11,
};

interface Options {
  /** The full-height scroll sizer element. */
  container: React.RefObject<HTMLElement | null>;
  /** Scrolling only drives the journey once the mission has started. */
  enabled: boolean;
  reducedMotion: boolean;
}

/**
 * The one and only scroll listener in the application.
 *
 * ScrollTrigger writes a single normalised value; a single rAF loop damps it,
 * publishes discrete changes to React and drives demand-based rendering. No
 * other module attaches a scroll handler.
 */
export function useScrollJourney({ container, enabled, reducedMotion }: Options): void {
  useEffect(() => {
    const el = container.current;
    if (!el || !enabled) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        mutable.target = clamp(self.progress);
      },
    });

    // Seed from current scroll position so a refresh mid-journey resumes cleanly.
    mutable.target = clamp(trigger.progress);
    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
    };
  }, [container, enabled]);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let last = performance.now();
    let settleTimer = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // Clamp dt so a backgrounded tab does not produce a huge jump on return.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      mutable.elapsed += dt;

      const previous = mutable.smooth;
      mutable.smooth = reducedMotion
        ? mutable.target
        : damp(mutable.smooth, mutable.target, JOURNEY.smoothing, dt);

      const delta = mutable.smooth - previous;
      mutable.velocity = dt > 0 ? delta / dt : 0;

      const active = Math.abs(delta) > JOURNEY.idleThreshold * dt * 60;
      if (active) {
        settleTimer = JOURNEY.settleTime;
      } else if (settleTimer > 0) {
        settleTimer -= dt;
      }

      mutable.moving = settleTimer > 0;
      if (mutable.moving) invalidate();
      publish();
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, reducedMotion]);
}

/** Scroll the window so the journey lands on `t` (0..1). */
export function scrollToProgress(t: number, smooth = true): void {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({
    top: clamp(t) * max,
    behavior: smooth ? "smooth" : "auto",
  });
}
