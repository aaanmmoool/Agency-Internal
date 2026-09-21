import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    /*
      The 3D layer is imperative by design.

      React Three Fiber's render loop works by mutating Three.js objects in
      place — camera transforms, instance matrices, material uniforms — inside
      `useFrame`. That is the supported pattern and the reason the scene can
      animate at 60fps without re-rendering React. `react-hooks/immutability`
      reads those mutations as render-phase side effects, which they are not:
      `useFrame` runs outside the render phase entirely.

      Scoped to the 3D tree only, so the rule keeps protecting the UI layer.
    */
    files: ["src/components/three/**/*.tsx", "src/components/three/**/*.ts"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
