import * as THREE from "three";
import { COLORS } from "@/config/scene";

export interface CarMaterials {
  body: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  tyre: THREE.MeshStandardMaterial;
  hub: THREE.MeshStandardMaterial;
  brake: THREE.MeshStandardMaterial;
  headlight: THREE.MeshStandardMaterial;
}

export interface CarGeometries {
  wheel: THREE.CylinderGeometry;
  hub: THREE.CylinderGeometry;
}

/** One material per part, shared by every mesh that uses it. */
export function createCarMaterials(): CarMaterials {
  return {
    body: new THREE.MeshStandardMaterial({
      color: "#D8E0F0",
      roughness: 0.26,
      metalness: 0.64,
      envMapIntensity: 1.15,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: "#10131B",
      roughness: 0.52,
      metalness: 0.3,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: "#16203A",
      roughness: 0.1,
      metalness: 0.82,
      envMapIntensity: 2.1,
    }),
    tyre: new THREE.MeshStandardMaterial({
      color: "#0C0D12",
      roughness: 0.86,
      metalness: 0.04,
    }),
    hub: new THREE.MeshStandardMaterial({
      color: "#98A2B8",
      roughness: 0.3,
      metalness: 0.88,
    }),
    brake: new THREE.MeshStandardMaterial({
      color: "#2E0A0A",
      emissive: new THREE.Color(COLORS.brake),
      emissiveIntensity: 0.5,
      toneMapped: false,
    }),
    headlight: new THREE.MeshStandardMaterial({
      color: "#E7EEFF",
      emissive: new THREE.Color(COLORS.headlight),
      emissiveIntensity: 2.2,
      toneMapped: false,
    }),
  };
}

export function createCarGeometries(): CarGeometries {
  const wheel = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
  wheel.rotateZ(Math.PI / 2);
  const hub = new THREE.CylinderGeometry(0.19, 0.19, 0.3, 10);
  hub.rotateZ(Math.PI / 2);
  return { wheel, hub };
}

export function disposeCar(materials: CarMaterials, geometries: CarGeometries): void {
  Object.values(materials).forEach((m) => m.dispose());
  Object.values(geometries).forEach((g) => g.dispose());
}
