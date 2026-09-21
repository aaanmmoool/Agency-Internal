"use client";

import { useEffect, useState } from "react";

interface Disposable {
  dispose(): void;
}

/**
 * Creates GPU resources once and disposes them when the component unmounts.
 *
 * Every geometry and material in the world goes through here — this is what
 * stops a quality-tier change from leaking the previous scene. The lazy
 * `useState` initialiser guarantees the factory runs exactly once.
 */
export function useDisposable<T extends Record<string, Disposable>>(factory: () => T): T {
  const [resources] = useState(factory);

  useEffect(
    () => () => {
      for (const resource of Object.values(resources)) resource.dispose();
    },
    [resources],
  );

  return resources;
}
