"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  CHECKPOINT_ANCHORS,
  FINAL_BUILDING,
  HQ,
  INTERCHANGE,
  LANDMARK_ANCHORS,
  PROJECT_ANCHORS,
  SERVICE_SPREAD,
} from "@/config/world";
import { experienceLandmarks } from "@/data/missions";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { team } from "@/data/team";
import { useDisposable } from "@/hooks/useDisposable";
import { ROAD_HALF_WIDTH, headingAt, offsetPoint } from "@/lib/route";
import { routeT } from "@/lib/timeline";
import { WorldLabel } from "./WorldLabel";

/** One shared unlit material per accent colour. */
function useAccentMaterials(colors: string[]) {
  const key = colors.join("|");
  return useMemo(() => {
    const map = new Map<string, THREE.MeshBasicMaterial>();
    for (const c of key.split("|")) {
      if (!map.has(c)) {
        map.set(c, new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
      }
    }
    return map;
  }, [key]);
}

/**
 * Glazing that emits a little of its building's accent colour.
 *
 * The world is lit at night by one directional light, so a landmark's
 * road-facing elevation would otherwise fall into shadow and read as a black
 * slab. A low emissive value makes the facade legible without adding a light.
 */
function useLitGlass(colors: string[]) {
  const key = colors.join("|");
  return useMemo(() => {
    const map = new Map<string, THREE.MeshStandardMaterial>();
    for (const c of key.split("|")) {
      if (!map.has(c)) {
        map.set(
          c,
          new THREE.MeshStandardMaterial({
            color: "#0D1526",
            roughness: 0.14,
            metalness: 0.7,
            emissive: new THREE.Color(c),
            emissiveIntensity: 0.34,
            envMapIntensity: 1.5,
          }),
        );
      }
    }
    return map;
  }, [key]);
}

/** Shared shell / glass / frame materials for every built structure. */
function useStructureMaterials() {
  return useDisposable(
    () => ({
      shell: new THREE.MeshStandardMaterial({
        color: "#262C3C",
        roughness: 0.74,
        metalness: 0.24,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: "#111A2E",
        roughness: 0.12,
        metalness: 0.9,
        envMapIntensity: 1.4,
      }),
      frame: new THREE.MeshStandardMaterial({
        color: "#404963",
        roughness: 0.5,
        metalness: 0.7,
      }),
      plinth: new THREE.MeshStandardMaterial({
        color: "#181D2C",
        roughness: 0.9,
        metalness: 0.05,
      }),
      apron: new THREE.MeshStandardMaterial({
        color: "#191D2A",
        roughness: 0.95,
        metalness: 0.02,
      }),
    }),
  );
}

/** Rotation that turns a structure to face back across the carriageway. */
function facingRoad(heading: number, lateral: number): number {
  return heading + (lateral < 0 ? Math.PI / 2 : -Math.PI / 2);
}

interface CommonProps {
  shadows: boolean;
}

// ---------------------------------------------------------------------------
// Mission 01 — the studio headquarters, with a lit marker per team member.

export function Headquarters({ shadows }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(team.map((t) => t.accent));
  const litGlass = useLitGlass(["#7DA3FF"]);

  const rt = routeT(HQ.at);
  const base = offsetPoint(rt, HQ.lateral, 0);
  const facing = facingRoad(headingAt(rt), HQ.lateral);

  return (
    <group position={base} rotation={[0, facing, 0]}>
      <mesh position={[0, 0.35, 0]} material={m.plinth} receiveShadow={shadows}>
        <boxGeometry args={[34, 0.7, 26]} />
      </mesh>
      {/* Main block with a recessed glass core */}
      <mesh position={[0, 9, -3]} material={m.shell} castShadow={shadows}>
        <boxGeometry args={[24, 17, 15]} />
      </mesh>
      <mesh position={[0, 8.4, 4.6]} material={litGlass.get("#7DA3FF")} castShadow={shadows}>
        <boxGeometry args={[17, 15.4, 0.6]} />
      </mesh>
      <mesh position={[0, 18, -3]} material={m.frame}>
        <boxGeometry args={[25, 0.5, 16]} />
      </mesh>
      {/* Entrance canopy */}
      <mesh position={[0, 5.4, 6.4]} material={m.frame} castShadow={shadows}>
        <boxGeometry args={[12, 0.36, 4]} />
      </mesh>

      <WorldLabel
        text="HEADQUARTERS"
        position={[0, 20.4, -3]}
        width={17}
        aspect={7.5}
        opacity={0.8}
      />

      {/* One lit pillar per team member, colour-matched to their card. */}
      {team.map((member, i) => (
        <group key={member.id} position={[-7.5 + i * 5, 0, 9.5]}>
          <mesh position={[0, 1.6, 0]} material={m.frame}>
            <boxGeometry args={[0.5, 3.2, 0.5]} />
          </mesh>
          <mesh position={[0, 3.5, 0]} material={accents.get(member.accent)}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Mission 02 — monoliths marking each strand of experience.

export function ExperienceDistrict({ shadows }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(experienceLandmarks.map((l) => l.accent));
  const litGlass = useLitGlass(experienceLandmarks.map((l) => l.accent));

  return (
    <group>
      {experienceLandmarks.map((landmark, i) => {
        const anchor = LANDMARK_ANCHORS[i];
        const rt = routeT(anchor.at);
        const base = offsetPoint(rt, anchor.lateral, 0);
        const facing = facingRoad(headingAt(rt), anchor.lateral);
        const height = 13 + i * 1.6;

        return (
          <group key={landmark.id} position={base} rotation={[0, facing, 0]}>
            <mesh position={[0, 0.3, 0]} material={m.plinth} receiveShadow={shadows}>
              <boxGeometry args={[9, 0.6, 9]} />
            </mesh>
            <mesh position={[0, height / 2, 0]} material={m.shell} castShadow={shadows}>
              <boxGeometry args={[4.6, height, 4.6]} />
            </mesh>
            <mesh
              position={[0, height / 2, 2.32]}
              material={litGlass.get(landmark.accent)}
            >
              <boxGeometry args={[2.8, height * 0.7, 0.1]} />
            </mesh>
            {/* A single accent strip reads at speed without resorting to neon. */}
            <mesh position={[0, height / 2, 2.34]} material={accents.get(landmark.accent)}>
              <boxGeometry args={[0.52, height * 0.78, 0.1]} />
            </mesh>
            <mesh position={[0, height + 0.5, 0]} material={accents.get(landmark.accent)}>
              <boxGeometry args={[1.4, 0.16, 1.4]} />
            </mesh>
            <WorldLabel
              text={landmark.label.toUpperCase()}
              position={[0, height + 1.9, 0]}
              width={8}
              aspect={5}
              opacity={0.82}
              backToBack
            />
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Mission 03 — one tower per case study.

export function ProjectDistrict({ shadows }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(projects.map((p) => p.accent));
  const litGlass = useLitGlass(projects.map((p) => p.accent));

  return (
    <group>
      {projects.map((project, i) => {
        const anchor = PROJECT_ANCHORS[i];
        const rt = routeT(anchor.at);
        const base = offsetPoint(rt, anchor.lateral, 0);
        const facing = facingRoad(headingAt(rt), anchor.lateral);
        // Taller than anything the generator produces, so a case study reads as
        // a destination rather than another block in the skyline.
        const height = 30 + (i % 2) * 8;
        const accent = accents.get(project.accent);

        return (
          <group key={project.id} position={base} rotation={[0, facing, 0]}>
            <mesh position={[0, 0.3, 0]} material={m.plinth} receiveShadow={shadows}>
              <boxGeometry args={[24, 0.6, 20]} />
            </mesh>
            {/* Accent band around the plinth: visible long before the tower is */}
            <mesh position={[0, 0.72, 10]} material={accent}>
              <boxGeometry args={[24, 0.12, 0.14]} />
            </mesh>

            <mesh position={[0, height / 2, -1]} material={m.shell} castShadow={shadows}>
              <boxGeometry args={[14, height, 12]} />
            </mesh>
            {/* Glass curtain on the road-facing elevation */}
            <mesh
              position={[0, height / 2 - 1, 5.2]}
              material={litGlass.get(project.accent)}
              castShadow={shadows}
            >
              <boxGeometry args={[10.4, height - 4, 0.5]} />
            </mesh>
            {/* Vertical accent fins either side of the glazing */}
            <mesh position={[5.6, height / 2, 5.1]} material={accent}>
              <boxGeometry args={[0.44, height - 3, 0.16]} />
            </mesh>
            <mesh position={[-5.6, height / 2, 5.1]} material={accent}>
              <boxGeometry args={[0.44, height - 3, 0.16]} />
            </mesh>
            <mesh position={[0, height + 0.6, -1]} material={m.frame}>
              <boxGeometry args={[15, 0.7, 13]} />
            </mesh>
            {/* Roof beacon */}
            <mesh position={[0, height + 1.5, -1]} material={accent}>
              <boxGeometry args={[1.1, 1.1, 1.1]} />
            </mesh>

            <WorldLabel
              text={"PROJECT " + project.index}
              position={[0, height * 0.66, 5.6]}
              width={11}
              aspect={6}
              opacity={0.9}
            />
            <WorldLabel
              text={project.category.toUpperCase()}
              position={[0, height * 0.66 - 1.9, 5.6]}
              width={12}
              aspect={12}
              color={project.accent}
              opacity={0.85}
            />
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Mission 04 — the interchange, where the road splits into service routes.

export function Interchange({ shadows }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(services.map((s) => s.accent));

  const rt = routeT(INTERCHANGE.at);
  const base = offsetPoint(rt, 0, 0);
  const heading = headingAt(rt);

  return (
    <group position={base} rotation={[0, heading, 0]}>
      {/* Widened apron under the split */}
      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={m.apron}
        receiveShadow={shadows}
      >
        <planeGeometry args={[62, 46]} />
      </mesh>

      {services.map((service, i) => (
        <group key={service.id} position={[SERVICE_SPREAD[i], 0, -13]}>
          {/* Gate uprights and lintel */}
          <mesh position={[-2.6, 4, 0]} material={m.frame} castShadow={shadows}>
            <boxGeometry args={[0.42, 8, 0.42]} />
          </mesh>
          <mesh position={[2.6, 4, 0]} material={m.frame} castShadow={shadows}>
            <boxGeometry args={[0.42, 8, 0.42]} />
          </mesh>
          <mesh position={[0, 8.2, 0]} material={m.shell} castShadow={shadows}>
            <boxGeometry args={[6, 0.8, 0.6]} />
          </mesh>
          <mesh position={[0, 7.5, 0.34]} material={accents.get(service.accent)}>
            <boxGeometry args={[5.4, 0.14, 0.08]} />
          </mesh>
          <WorldLabel
            text={service.title.toUpperCase()}
            position={[0, 9.8, 0]}
            width={9}
            aspect={9}
            opacity={0.8}
            backToBack
          />
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Mission 05 — numbered gantries over the delivery route.

export function Checkpoints({ shadows }: CommonProps) {
  const m = useStructureMaterials();
  const span = (ROAD_HALF_WIDTH + 1.6) * 2;

  return (
    <group>
      {processSteps.map((step, i) => {
        const anchor = CHECKPOINT_ANCHORS[i];
        const rt = routeT(anchor.at);
        const base = offsetPoint(rt, 0, 0);
        const heading = headingAt(rt);
        const caption = step.index + "  " + step.title.toUpperCase();

        return (
          <group key={step.index} position={base} rotation={[0, heading, 0]}>
            <mesh position={[-span / 2, 3.4, 0]} material={m.frame} castShadow={shadows}>
              <boxGeometry args={[0.34, 6.8, 0.34]} />
            </mesh>
            <mesh position={[span / 2, 3.4, 0]} material={m.frame} castShadow={shadows}>
              <boxGeometry args={[0.34, 6.8, 0.34]} />
            </mesh>
            <mesh position={[0, 6.9, 0]} material={m.shell} castShadow={shadows}>
              <boxGeometry args={[span, 0.7, 0.5]} />
            </mesh>
            {/* Legible from both approach directions. */}
            <WorldLabel
              text={caption}
              position={[0, 6.9, 0.31]}
              width={span * 0.86}
              aspect={11}
              opacity={0.88}
            />
            <WorldLabel
              text={caption}
              position={[0, 6.9, -0.31]}
              rotationY={Math.PI}
              width={span * 0.86}
              aspect={11}
              opacity={0.5}
            />
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Final mission — the destination building.

export function Destination({ shadows }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(["#7DA3FF"]);
  const litGlass = useLitGlass(["#7DA3FF"]);

  const rt = routeT(FINAL_BUILDING.at);
  const base = offsetPoint(rt, FINAL_BUILDING.lateral, 0);
  const facing = facingRoad(headingAt(rt), FINAL_BUILDING.lateral);

  return (
    <group position={base} rotation={[0, facing, 0]}>
      <mesh position={[0, 0.3, 0]} material={m.plinth} receiveShadow={shadows}>
        <boxGeometry args={[40, 0.6, 30]} />
      </mesh>
      {/* Stepped mass, so it reads as architecture rather than a box */}
      <mesh position={[0, 13, -6]} material={m.shell} castShadow={shadows}>
        <boxGeometry args={[26, 26, 16]} />
      </mesh>
      <mesh position={[0, 7, 2.5]} material={m.shell} castShadow={shadows}>
        <boxGeometry args={[19, 14, 6]} />
      </mesh>
      {/* Full-height glazing over the entrance */}
      <mesh position={[0, 7.4, 5.8]} material={litGlass.get("#7DA3FF")} castShadow={shadows}>
        <boxGeometry args={[13, 13, 0.5]} />
      </mesh>
      <mesh position={[0, 2.1, 6.2]} material={m.frame}>
        <boxGeometry args={[6.4, 4.2, 0.45]} />
      </mesh>
      <mesh position={[0, 4.35, 6.45]} material={accents.get("#7DA3FF")}>
        <boxGeometry args={[6.6, 0.12, 0.1]} />
      </mesh>
      {/* Crown */}
      <mesh position={[0, 26.4, -6]} material={m.frame}>
        <boxGeometry args={[27, 0.8, 17]} />
      </mesh>

      <WorldLabel
        text="MISSION COMPLETE"
        position={[0, 28.8, -6]}
        width={20}
        aspect={8}
        opacity={0.85}
      />
    </group>
  );
}
