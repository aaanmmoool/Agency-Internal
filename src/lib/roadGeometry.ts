import * as THREE from "three";
import { ROAD_HALF_WIDTH, SIDEWALK_WIDTH, offsetPoint, pointAt } from "./route";

/**
 * Builds the road as ribbon geometry swept along the route spline.
 *
 * The entire road, both kerbs and every lane marking add up to four draw calls
 * regardless of how long the route is — far cheaper than tiling road segments,
 * and it follows the curve exactly with no seams.
 */

export interface RoadGeometries {
  surface: THREE.BufferGeometry;
  kerbs: THREE.BufferGeometry;
  centreLine: THREE.BufferGeometry;
  edgeLines: THREE.BufferGeometry;
}

/** Sweeps a constant-width strip along the route between two lateral offsets. */
function ribbon(
  segments: number,
  innerAt: (t: number) => number,
  outerAt: (t: number) => number,
  height: (t: number) => number,
  uvRepeat: number,
): THREE.BufferGeometry {
  const count = segments + 1;
  const positions = new Float32Array(count * 2 * 3);
  const uvs = new Float32Array(count * 2 * 2);
  const normals = new Float32Array(count * 2 * 3);
  const indices = new Uint32Array(segments * 6);

  const p = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const t = i / segments;
    const h = height(t);

    offsetPoint(t, innerAt(t), h, p);
    positions[i * 6 + 0] = p.x;
    positions[i * 6 + 1] = p.y;
    positions[i * 6 + 2] = p.z;

    offsetPoint(t, outerAt(t), h, p);
    positions[i * 6 + 3] = p.x;
    positions[i * 6 + 4] = p.y;
    positions[i * 6 + 5] = p.z;

    uvs[i * 4 + 0] = 0;
    uvs[i * 4 + 1] = t * uvRepeat;
    uvs[i * 4 + 2] = 1;
    uvs[i * 4 + 3] = t * uvRepeat;

    normals[i * 6 + 1] = 1;
    normals[i * 6 + 4] = 1;
  }

  for (let i = 0; i < segments; i++) {
    // Counter-clockwise seen from above, so the strip survives backface culling.
    // Vertex layout per step is [inner, outer]; `a` is the inner vertex.
    const a = i * 2;
    const o = i * 6;
    indices[o + 0] = a;
    indices[o + 1] = a + 1;
    indices[o + 2] = a + 2;
    indices[o + 3] = a + 1;
    indices[o + 4] = a + 3;
    indices[o + 5] = a + 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

/** Emits a quad every other step, producing dashed markings in one geometry. */
function dashes(
  segments: number,
  lateral: number,
  halfWidth: number,
  dashOn: number,
  height: number,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const p = new THREE.Vector3();
  let vertex = 0;

  for (let i = 0; i < segments; i += dashOn * 2) {
    const t0 = i / segments;
    const t1 = Math.min((i + dashOn) / segments, 1);
    for (const t of [t0, t1]) {
      offsetPoint(t, lateral - halfWidth, height, p);
      positions.push(p.x, p.y, p.z);
      offsetPoint(t, lateral + halfWidth, height, p);
      positions.push(p.x, p.y, p.z);
    }
    indices.push(vertex, vertex + 1, vertex + 2, vertex + 1, vertex + 3, vertex + 2);
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    vertex += 4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/** Continuous strips for the two edge lines, merged into one geometry. */
function edgeLines(segments: number, height: number): THREE.BufferGeometry {
  const left = ribbon(
    segments,
    () => -ROAD_HALF_WIDTH + 0.18,
    () => -ROAD_HALF_WIDTH + 0.42,
    () => height,
    1,
  );
  const right = ribbon(
    segments,
    () => ROAD_HALF_WIDTH - 0.42,
    () => ROAD_HALF_WIDTH - 0.18,
    () => height,
    1,
  );
  const merged = mergeGeometries([left, right]);
  left.dispose();
  right.dispose();
  return merged;
}

/** Minimal position-only merge; avoids pulling in the full BufferGeometryUtils. */
function mergeGeometries(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let vertexCount = 0;
  let indexCount = 0;
  for (const g of list) {
    vertexCount += g.getAttribute("position").count;
    indexCount += g.getIndex()!.count;
  }

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);

  let vOffset = 0;
  let iOffset = 0;
  for (const g of list) {
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const nor = g.getAttribute("normal") as THREE.BufferAttribute;
    positions.set(pos.array as Float32Array, vOffset * 3);
    normals.set(nor.array as Float32Array, vOffset * 3);
    const idx = g.getIndex()!;
    for (let i = 0; i < idx.count; i++) indices[iOffset + i] = idx.getX(i) + vOffset;
    vOffset += pos.count;
    iOffset += idx.count;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

export function buildRoad(segments: number): RoadGeometries {
  const surface = ribbon(
    segments,
    () => -ROAD_HALF_WIDTH,
    () => ROAD_HALF_WIDTH,
    () => 0.02,
    segments / 12,
  );

  const leftKerb = ribbon(
    segments,
    () => -ROAD_HALF_WIDTH - SIDEWALK_WIDTH,
    () => -ROAD_HALF_WIDTH,
    () => 0.17,
    1,
  );
  const rightKerb = ribbon(
    segments,
    () => ROAD_HALF_WIDTH,
    () => ROAD_HALF_WIDTH + SIDEWALK_WIDTH,
    () => 0.17,
    1,
  );
  const kerbs = mergeGeometries([leftKerb, rightKerb]);
  leftKerb.dispose();
  rightKerb.dispose();

  return {
    surface,
    kerbs,
    centreLine: dashes(segments, 0, 0.13, 3, 0.035),
    edgeLines: edgeLines(segments, 0.03),
  };
}

export function disposeRoad(road: RoadGeometries): void {
  road.surface.dispose();
  road.kerbs.dispose();
  road.centreLine.dispose();
  road.edgeLines.dispose();
}

/** Ground plane sized to comfortably contain the whole route. */
export function routeBounds(): { center: THREE.Vector3; size: number } {
  const box = new THREE.Box3();
  const p = new THREE.Vector3();
  for (let i = 0; i <= 200; i++) {
    box.expandByPoint(pointAt(i / 200, p).clone());
  }
  const size = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) + 260;
  return { center: box.getCenter(new THREE.Vector3()), size };
}
