# 3D assets

**This directory is empty on purpose.** The world currently ships as procedural
geometry rather than GLB files — see "Why" below. Everything here describes how
to replace that with authored assets, and what the code expects when you do.

## Why there are no GLB files yet

Authored assets need Blender, which is not part of this repository's build. Instead
of shipping placeholder GLBs that would have to be thrown away, the world is built
from primitives and `InstancedMesh` in `src/components/three/World`. That has some
real advantages worth keeping in mind before replacing it:

- the whole city is about twenty draw calls and roughly 25k triangles
- there is nothing to download, so the world is interactive almost immediately
- the layout is derived from the route spline, so moving a waypoint moves the city

Replace it where an authored asset genuinely beats a primitive: the car, the
headquarters, and the final destination building are the three that would benefit
most. The repeated props (buildings, trees, street lights, signs) should stay
instanced whatever their geometry comes from.

## Pipeline

```
Blender
  ↓  decimate / retopologise to the triangle budget below
  ↓  apply all modifiers
  ↓  UV unwrap
  ↓  bake lighting and AO into the base colour map
  ↓  export glTF 2.0 (.glb), +Y up, selected objects only
  ↓  gltf-transform: draco + ktx2 (commands below)
  ↓  check the file size against the budget
  → public/models/
```

Compression, using [glTF-Transform](https://gltf-transform.dev):

```bash
npx @gltf-transform/cli optimize car.raw.glb car.glb \
  --compress draco \
  --texture-compress ktx2 \
  --texture-size 1024
```

## Budgets

| File              | Contents                             | Triangles | Target size |
| ----------------- | ------------------------------------ | --------- | ----------- |
| `car.glb`         | body + 4 wheels, named parts         | ≤ 12k     | ≤ 400 KB    |
| `office.glb`      | headquarters and destination building| ≤ 25k     | ≤ 900 KB    |
| `city.glb`        | building variants for instancing     | ≤ 20k     | ≤ 700 KB    |
| `environment.glb` | bridge, kerbs, gantries              | ≤ 15k     | ≤ 600 KB    |
| `props.glb`       | trees, street lights, signs, barriers| ≤ 8k      | ≤ 300 KB    |

Nothing should approach the tens of megabytes; if a file does, the budget was
missed, not the compression.

## What the code expects

**The car** (`src/components/three/Car/CarModel.tsx`) is the cleanest drop-in
point. `CarRig` only ever touches the model through two things:

- `wheelRefs` — four `THREE.Group`s, ordered front-left, front-right, rear-left,
  rear-right. The group is rotated for steering and spin, so in Blender each wheel
  needs its own object with the origin at the hub centre.
- `materials` — from `src/lib/carMaterials.ts`. The rig animates
  `materials.brake.emissiveIntensity` and `materials.headlight.emissiveIntensity`
  every frame, so those two materials must be reachable on the loaded model.

Replace the primitives in `CarModel` with a `useGLTF("/models/car.glb")` and
resolve the same parts from the loaded scene. Nothing else in the codebase changes.

**Buildings and props** are placed by `src/lib/worldGen.ts`, which produces plain
transform arrays. To use authored meshes, keep the generator as-is and pass the
loaded geometry to `InstancedField` instead of the primitives in `City.tsx`. Bake
lighting into the base colour: the scene has one realtime shadow-casting light and
that budget should not grow.

**Loading.** Register any new asset as a step in `src/lib/loading.ts` so the
loading screen reflects it, and load it inside the deferred `Suspense` boundary in
`Scene.tsx` unless it is needed for the first interactive frame.

## Draco decoder

`useGLTF` pulls the Draco decoder from a CDN by default. For a self-contained
deployment, copy `node_modules/three/examples/jsm/libs/draco/` into
`public/draco/` and point the loader at it.
