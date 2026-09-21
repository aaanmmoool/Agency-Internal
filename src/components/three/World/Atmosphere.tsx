"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/config/scene";
import type { QualitySettings } from "@/config/quality";
import { carState } from "@/lib/carState";
import { markReady } from "@/lib/loading";

interface Props {
  quality: QualitySettings;
}

/**
 * Sky, fog and the entire lighting rig.
 *
 * The realtime light budget is deliberately small: one directional key light
 * (the only shadow caster in the scene), one hemisphere fill, and a locally
 * generated environment map for reflections. Everything else in the world is
 * lit by the environment, which costs nothing per frame.
 */
export function Atmosphere({ quality }: Props) {
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const previousFog = scene.fog;
    const previousBackground = scene.background;
    scene.fog = new THREE.Fog(COLORS.fog, quality.fogNear, quality.fogFar);
    scene.background = new THREE.Color(COLORS.background);
    return () => {
      scene.fog = previousFog;
      scene.background = previousBackground;
    };
  }, [scene, quality.fogNear, quality.fogFar]);

  useEffect(() => markReady("environment"), []);

  return (
    <>
      {/* Sky fill and a low ambient floor keep unlit faces readable. */}
      <hemisphereLight args={["#44568A", "#0C1018", 1.5]} />
      <ambientLight intensity={0.38} />
      <KeyLight quality={quality} />
      <SkyDome />

      {/*
        A self-contained environment map: rendered once from the lightformers
        below, so there is no HDRI download and no per-frame cost.
      */}
      <Environment resolution={quality.tier === "low" ? 64 : 128} frames={1}>
        <color attach="background" args={["#05060A"]} />
        {/* A cool key panel overhead and a warm rim behind, nothing more. */}
        <Lightformer intensity={2.2} position={[0, 10, -8]} scale={[26, 9, 1]} color="#6E8CD6" />
        <Lightformer intensity={1.1} position={[-12, 4, 8]} scale={[14, 6, 1]} color="#3C4E78" />
        <Lightformer intensity={0.8} position={[12, 3, 10]} scale={[12, 5, 1]} color="#8A6A4C" />
      </Environment>
    </>
  );
}

/**
 * A directional light that travels with the car.
 *
 * Shadows only matter near the camera, so the light rides along and its shadow
 * frustum stays small — a 1024 map covers the visible area at full resolution
 * instead of being stretched over the whole route.
 */
function KeyLight({ quality }: Props) {
  const ref = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    const light = ref.current;
    if (!light) return;
    const { position } = carState;
    light.position.set(position.x + 26, position.y + 42, position.z + 18);
    light.target.position.set(position.x, position.y, position.z);
    light.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={ref}
      intensity={2.1}
      color="#C3D2F2"
      castShadow={quality.shadows}
      shadow-mapSize-width={quality.shadowMapSize}
      shadow-mapSize-height={quality.shadowMapSize}
      shadow-camera-near={1}
      shadow-camera-far={140}
      shadow-camera-left={-38}
      shadow-camera-right={38}
      shadow-camera-top={38}
      shadow-camera-bottom={-38}
      shadow-bias={-0.0009}
      shadow-normalBias={0.03}
    />
  );
}

/**
 * A vertical gradient sphere — cheaper and calmer than an HDRI backdrop.
 * It rides with the camera so it stays infinitely distant at any point on the route.
 */
function SkyDome() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color("#141E38") },
          uMid: { value: new THREE.Color("#0C1120") },
          uBottom: { value: new THREE.Color("#060810") },
        },
        vertexShader: /* glsl */ `
          varying float vHeight;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vHeight = normalize(position).y;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uMid;
          uniform vec3 uBottom;
          varying float vHeight;
          void main() {
            float h = vHeight * 0.5 + 0.5;
            vec3 color = mix(uBottom, uMid, smoothstep(0.0, 0.5, h));
            color = mix(color, uTop, smoothstep(0.48, 1.0, h));
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    ref.current?.position.copy(state.camera.position);
  });

  return (
    <mesh ref={ref} material={material} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[500, 24, 16]} />
    </mesh>
  );
}
