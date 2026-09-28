"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONTACT } from "@/config/site";
import { experienceLandmarks } from "@/data/missions";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { team } from "@/data/team";
import { useDisposable } from "@/hooks/useDisposable";
import { mutable } from "@/lib/journey";
import {
  BOARDS,
  FRAMES,
  serviceCardBoard,
  serviceCardGone,
  serviceCardUp,
  type BoardPlacement,
} from "@/lib/landmarkLayout";
import { ROAD_HALF_WIDTH } from "@/lib/route";
import type { Service } from "@/types";
import { FacadeBoard, useBoardMaterial } from "./FacadeBoard";
import {
  experienceBoard,
  finalBoard,
  processBoard,
  projectBoard,
  serviceBoard,
  teamBoard,
} from "./facades";
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

interface CommonProps {
  shadows: boolean;
  /** Texture pixels per metre for facade boards. */
  signDensity: number;
}

/** Position and turn for a board placed on its structure. */
const boardAt = (b: BoardPlacement) => ({
  position: [b.center[0], b.center[1], b.center[2]] as [number, number, number],
  rotationY: b.back ? Math.PI : 0,
});

/** Hands a board control to a new tab, or to the mail client for `mailto:`. */
function openLink(url: string): void {
  if (url.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
}

// ---------------------------------------------------------------------------
// Mission 01 — the studio headquarters, with a lit marker per team member.

export function Headquarters({ shadows, signDensity }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(team.map((t) => t.accent));
  const litGlass = useLitGlass(["#7DA3FF"]);
  const board = useMemo(() => teamBoard(BOARDS.hq), []);
  const { position, rotationY } = FRAMES.hq;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
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

      <FacadeBoard spec={board} density={signDensity} {...boardAt(BOARDS.hq)} />

      {/* One lit pillar per team member, colour-matched to their role on the facade. */}
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
// Mission 02 — monoliths marking each strand of experience, each turned a
// little towards oncoming traffic so its face reads on the approach.

export function ExperienceDistrict({ shadows, signDensity }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(experienceLandmarks.map((l) => l.accent));
  const litGlass = useLitGlass(experienceLandmarks.map((l) => l.accent));
  const boards = useMemo(
    () => experienceLandmarks.map((l) => experienceBoard(l, BOARDS.experience)),
    [],
  );
  const face = boardAt(BOARDS.experience);

  return (
    <group>
      {experienceLandmarks.map((landmark, i) => {
        const { position, rotationY } = FRAMES.experience[i];
        const height = 13 + i * 1.6;

        return (
          <group key={landmark.id} position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 0.3, 0]} material={m.plinth} receiveShadow={shadows}>
              <boxGeometry args={[10, 0.6, 7]} />
            </mesh>
            <mesh position={[0, height / 2, 0]} material={m.shell} castShadow={shadows}>
              <boxGeometry args={[7.2, height, 3.4]} />
            </mesh>
            <mesh position={[0, height / 2, 1.72]} material={litGlass.get(landmark.accent)}>
              <boxGeometry args={[6.6, height * 0.86, 0.1]} />
            </mesh>
            {/* A single accent strip reads at speed without resorting to neon. */}
            <mesh position={[0, 7.3, 1.8]} material={accents.get(landmark.accent)}>
              <boxGeometry args={[6.2, 0.14, 0.1]} />
            </mesh>
            <mesh position={[0, height + 0.08, 0]} material={accents.get(landmark.accent)}>
              <boxGeometry args={[7.6, 0.16, 3.8]} />
            </mesh>

            <FacadeBoard spec={boards[i]} density={signDensity} {...face} />

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

export function ProjectDistrict({ shadows, signDensity }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(projects.map((p) => p.accent));
  const litGlass = useLitGlass(projects.map((p) => p.accent));
  const boards = useMemo(() => projects.map((p) => projectBoard(p, BOARDS.project)), []);
  const face = boardAt(BOARDS.project);

  return (
    <group>
      {projects.map((project, i) => {
        const { position, rotationY } = FRAMES.projects[i];
        const link = project.liveUrl ?? project.githubUrl;
        // Taller than anything the generator produces, so a case study reads as
        // a destination rather than another block in the skyline.
        const height = 30 + (i % 2) * 8;
        const accent = accents.get(project.accent);

        return (
          <group key={project.id} position={position} rotation={[0, rotationY, 0]}>
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
              position={[0, height - 6, 5.6]}
              width={11}
              aspect={6}
              opacity={0.9}
            />
            <WorldLabel
              text={project.category.toUpperCase()}
              position={[0, height - 7.9, 5.6]}
              width={12}
              aspect={12}
              color={project.accent}
              opacity={0.85}
            />

            <FacadeBoard
              spec={boards[i]}
              density={signDensity}
              {...face}
              onSelect={link ? () => openLink(link) : undefined}
            />
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Mission 04 — the interchange. One card per service rises out of the road and
// stands in the car's way; each scroll past a card sinks it back into the road.

export function Interchange({ shadows, signDensity }: CommonProps) {
  const m = useStructureMaterials();
  const { position, rotationY } = FRAMES.interchange;

  return (
    <group>
      {/* Widened apron the cards stand on */}
      <group position={position} rotation={[0, rotationY, 0]}>
        <mesh
          position={[0, 0.03, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={m.apron}
          receiveShadow={shadows}
        >
          <planeGeometry args={[62, 46]} />
        </mesh>
      </group>

      {services.map((service, i) => (
        <ServiceCard
          key={service.id}
          service={service}
          index={i}
          shadows={shadows}
          signDensity={signDensity}
        />
      ))}
    </group>
  );
}

interface ServiceCardProps extends CommonProps {
  service: Service;
  index: number;
}

function ServiceCard({ service, index, shadows, signDensity }: ServiceCardProps) {
  const card = useRef<THREE.Group>(null);
  const spec = useMemo(() => serviceBoard(service, BOARDS.serviceCard), [service]);
  const face = useBoardMaterial(spec, signDensity);
  const placement = serviceCardBoard(index);
  const { position, rotationY } = FRAMES.serviceCards[index];

  const [, cy, cz] = placement.center;
  const plate = { width: placement.width + 0.3, height: placement.height + 0.3 };
  // Far enough below the road that the whole card is hidden before it rises.
  const depth = cy + plate.height / 2 + 0.6;

  // Every card fades on its own, so each owns its materials.
  const mats = useDisposable(() => ({
    body: new THREE.MeshStandardMaterial({
      color: "#1A1F2D",
      roughness: 0.55,
      metalness: 0.35,
      transparent: true,
    }),
    edge: new THREE.MeshBasicMaterial({ color: service.accent, toneMapped: false, transparent: true }),
    slot: new THREE.MeshBasicMaterial({
      color: service.accent,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
    }),
  }));

  useFrame(() => {
    const g = card.current;
    if (!g) return;
    const p = mutable.smooth;
    const up = serviceCardUp(index, p);
    const gone = serviceCardGone(index, p);
    const shown = up * (1 - gone);

    g.visible = shown > 0.002;
    // Up out of the road on the approach, back down into it once read.
    g.position.y = -(1 - up) * depth - gone * depth * 0.55;
    face.opacity = shown;
    mats.body.opacity = shown;
    mats.edge.opacity = shown;
    // The slot in the road lights just before its card breaks the surface.
    mats.slot.opacity = Math.min(1, up * 3) * (1 - gone) * 0.85;
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.06, 0]} material={mats.slot}>
        <boxGeometry args={[plate.width + 0.5, 0.02, 0.5]} />
      </mesh>

      <group ref={card}>
        <mesh position={[0, cy, 0]} material={mats.body} castShadow={shadows}>
          <boxGeometry args={[plate.width, plate.height, 0.22]} />
        </mesh>
        <mesh position={[0, cy + plate.height / 2 + 0.05, 0]} material={mats.edge}>
          <boxGeometry args={[plate.width, 0.1, 0.24]} />
        </mesh>
        <mesh position={[0, cy, cz]} rotation={[0, Math.PI, 0]} material={face}>
          <planeGeometry args={[placement.width, placement.height]} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Mission 05 — numbered gantries over the delivery route.

export function Checkpoints({ shadows, signDensity }: CommonProps) {
  const m = useStructureMaterials();
  const span = (ROAD_HALF_WIDTH + 1.6) * 2;
  const boards = useMemo(() => processSteps.map((s) => processBoard(s, BOARDS.checkpoint)), []);
  const face = boardAt(BOARDS.checkpoint);
  const beam = BOARDS.checkpoint.center[1] + BOARDS.checkpoint.height / 2 + 0.3;

  return (
    <group>
      {processSteps.map((step, i) => {
        const { position, rotationY } = FRAMES.checkpoints[i];

        return (
          <group key={step.index} position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[-span / 2, beam / 2, 0]} material={m.frame} castShadow={shadows}>
              <boxGeometry args={[0.34, beam, 0.34]} />
            </mesh>
            <mesh position={[span / 2, beam / 2, 0]} material={m.frame} castShadow={shadows}>
              <boxGeometry args={[0.34, beam, 0.34]} />
            </mesh>
            <mesh position={[0, beam, 0]} material={m.shell} castShadow={shadows}>
              <boxGeometry args={[span, 0.6, 0.5]} />
            </mesh>
            <mesh position={[0, BOARDS.checkpoint.center[1], 0]} material={m.shell}>
              <boxGeometry
                args={[BOARDS.checkpoint.width + 0.3, BOARDS.checkpoint.height + 0.3, 0.4]}
              />
            </mesh>

            <FacadeBoard spec={boards[i]} density={signDensity} {...face} />
            {/* The caption alone on the far side, for anyone looking back. */}
            <WorldLabel
              text={step.index + "  " + step.title.toUpperCase()}
              position={[0, BOARDS.checkpoint.center[1], 0.22]}
              width={span * 0.6}
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

export function Destination({ shadows, signDensity }: CommonProps) {
  const m = useStructureMaterials();
  const accents = useAccentMaterials(["#7DA3FF"]);
  const litGlass = useLitGlass(["#7DA3FF"]);
  const board = useMemo(() => finalBoard(BOARDS.final), []);
  const { position, rotationY } = FRAMES.final;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
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

      <FacadeBoard
        spec={board}
        density={signDensity}
        {...boardAt(BOARDS.final)}
        onSelect={() => openLink(`mailto:${CONTACT.email}`)}
      />
    </group>
  );
}
