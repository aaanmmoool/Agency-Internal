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
}

/**
 * All six mission destinations, bundled into one lazily loaded chunk.
 *
 * These are static structures — they mount once and never re-render, so there
 * is no benefit to splitting them further.
 */
export default function Districts({ shadows }: Props) {
  useEffect(() => markReady("projects"), []);

  return (
    <>
      <Headquarters shadows={shadows} />
      <ExperienceDistrict shadows={shadows} />
      <ProjectDistrict shadows={shadows} />
      <Interchange shadows={shadows} />
      <Checkpoints shadows={shadows} />
      <Destination shadows={shadows} />
    </>
  );
}
