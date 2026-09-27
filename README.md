# Overland — interactive studio portfolio

A scroll-driven 3D experience for a four-person engineering studio. The visitor
drives through a stylised world and each district is a section of the portfolio:
the team, their experience, the work, the services and how the studio delivers.

Built with Next.js, React Three Fiber, GSAP ScrollTrigger and Tailwind.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
npx tsc --noEmit && npx eslint src   # types and lint
```

## Read this first

Two things are deliberate and will look like omissions otherwise.

**The content is placeholder.** `src/data/team.ts`, `src/data/projects.ts` and
`src/config/site.ts` contain stand-in names, case studies, contact details and a
studio name. Every one is marked. Replace them before the site goes anywhere near
a client. The team entries are written deliberately flat — roles describe what
someone does, experience is a plain year count, and employment at a company is
described as employment rather than as client work. Keep that tone when you swap
the real details in.

**There are no GLB files.** The world is procedural geometry and instanced
meshes, not authored assets, because building them needs Blender. The whole city
is roughly twenty draw calls and 25k triangles as a result. `public/models/README.md`
has the full pipeline, the per-file budgets and the exact drop-in points if you
want to replace it with authored work.

## How it fits together

```
src/
  app/            route, metadata, robots, sitemap, generated OG card
  components/
    three/        the 3D layer — Car, Camera, World, Perf
    ui/           HUD, loading and landing screens
    sections/     the static HTML document
  config/         scene constants, quality tiers, world layout, site identity
  data/           team, projects, services, process, missions
  hooks/          journey subscription, scroll driver, quality, keyboard
  lib/            route spline, timeline warp, world generator, stores
```

### The journey

One value drives everything. `useScrollJourney` attaches a single ScrollTrigger to
a tall scroll track and writes normalised progress into `lib/journey.ts`. A single
rAF loop damps it and publishes to React **only when a discrete value changes** —
the mission, the whole-percent progress, the XP total. The HUD
re-renders a handful of times per journey; the 3D scene reads the mutable value
directly inside `useFrame` and never re-renders at all.

`lib/timeline.ts` maps scroll progress to distance along the route through an
integrated speed profile, so the car genuinely eases off at each destination
instead of the slowdown being faked in the camera. Every consumer — car, camera,
buildings, signage — goes through `routeT()`, which is what keeps the world and the
timeline in agreement.

### The world

`lib/route.ts` holds one Catmull-Rom spline. The road ribbon, every building, every
tree and every sign is positioned relative to it, so moving a waypoint moves the
city. `lib/worldGen.ts` produces deterministic transform arrays from a fixed seed;
`InstancedField` buckets them into spatial cells so frustum culling can reject the
parts of the city behind the camera.

### The signage

There is no HTML over the world: everything the visitor reads is painted onto the
buildings. `lib/boardTexture.ts` lays content out in world metres and draws it once
into a canvas texture in the page's own typeface; `World/facades.ts` decides what
each building says, from the same `data/` the text version reads. Each board is one
unlit quad and one draw call.

`lib/landmarkLayout.ts` is the single source for where every landmark and board
sits. The buildings are drawn from it, and the camera reads the same numbers: near
each stop it stands off along the board's normal, just far enough for the board to
fit the frame, so the text is square to the screen and readable. On a narrow screen
it stands no further back than a widescreen shot would and slides across a wide
board as you scroll through the stop instead.

### The camera

`CameraController` is the only thing that moves the camera. Each mission declares
a mode (cinematic, follow, destination, showcase, orbit) which resolves to an
offset in the car's frame of reference. The damping is applied to that **offset**,
not to a world position — damping a world position makes the lag proportional to
speed, which strands the camera behind the world on a fast scroll.

### Rendering

One Canvas, mounted once. `FrameloopManager` runs continuously while the landing
shot is orbiting or the journey is moving, and drops to demand rendering when
everything has settled, so a parked scene does no GPU work. Lighting is one
shadow-casting directional light that rides with the car, one hemisphere fill, and
a locally generated environment map — no HDRI download, no post-processing.

## Accessibility and SEO

The server renders the complete site as ordinary HTML (`components/sections/StaticContent.tsx`).
The 3D world is layered over it on the client only when WebGL is available and the
visitor has not opted out. That ordering is deliberate: without JavaScript, without
WebGL, or for a crawler that does not execute scripts, the document *is* the site.

- Every word shown in the 3D experience also appears in the static document
- A skip link leaves the 3D world for the text version; the HUD offers the same
- Left and right arrows jump between missions; up, down and space scroll normally
- `prefers-reduced-motion` disables the cinematic camera, the landing orbit, body
  roll and suspension, and snaps the car to the route rather than easing along it
- JSON-LD describes the studio, its people and its work, mirroring the document

## Performance

Development builds include a stats overlay (bottom right, collapsed). It is behind
a `NODE_ENV` check and is not in the production bundle.

Three quality tiers are resolved once on mount from pointer type, viewport, core
count, device memory and save-data (`config/quality.ts`). They change instance
counts, road tessellation, pixel ratio, shadows, fog distance and the length of the
journey. Constrained devices get the same content over a shorter run rather than a
degraded version of it.

## Deploying

Set `SITE.url` in `src/config/site.ts` — the canonical URL, sitemap, robots and
JSON-LD all read from it. Then deploy to Vercel; nothing else needs configuration.
