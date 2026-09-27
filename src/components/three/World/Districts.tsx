"use client";

import { useEffect } from "react";
import { markReady } from "@/lib/loading";
import {
  Checkpoints,
  Destination,
  ExperienceDistrict,
  Headquarters,
  Interchange,
  ProjectDistrict,
} from "./Landmarks";

interface Props {
  shadows: boolean;
  /** Texture pixels per metre for the text painted on each building. */
  signDensity: number;
}

/**
 * All six mission destinations, bundled into one lazily loaded chunk.
 *
 * These are static structures — they mount once and never re-render, so there
 * is no benefit to splitting them further.
 */
export default function Districts({ shadows, signDensity }: Props) {
  useEffect(() => markReady("projects"), []);

  return (
    <>
      <Headquarters shadows={shadows} signDensity={signDensity} />
      <ExperienceDistrict shadows={shadows} signDensity={signDensity} />
      <ProjectDistrict shadows={shadows} signDensity={signDensity} />
      <Interchange shadows={shadows} signDensity={signDensity} />
      <Checkpoints shadows={shadows} signDensity={signDensity} />
      <Destination shadows={shadows} signDensity={signDensity} />
    </>
  );
}
