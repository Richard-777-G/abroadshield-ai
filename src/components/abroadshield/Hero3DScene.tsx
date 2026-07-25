"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  MeshTransmissionMaterial,
  ContactShadows,
  Float,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

/**
 * The hero artifact — a single polished glass torus knot.
 *
 * Design intent (senior-designer pass):
 *  - ONE object, not a constellation of primitives.
 *  - Real materiality: transmission, roughness, thickness-based tint.
 *  - Slow, deliberate motion — no spinning screensaver energy.
 *  - Grounded with a soft contact shadow so it has weight.
 *  - A faint particle field for depth, not chaos.
 */
function GlassArtifact() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (!ref.current) return;
    // gentle, slow rotation — deliberately unhurried
    ref.current.rotation.y += delta * 0.12;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <mesh ref={ref} castShadow>
        <torusKnotGeometry args={[1.1, 0.34, 220, 32, 2, 3]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={1.2}
          chromaticAberration={0.06}
          anisotropicBlur={0.1}
          distortion={0.2}
          distortionScale={0.4}
          temporalDistortion={0.1}
          roughness={0.08}
          ior={1.25}
          color="#bfe9da"
          attenuationColor="#5fc7a8"
          attenuationDistance={1.4}
          background={new THREE.Color("#0e1118")}
        />
      </mesh>
    </Float>
  );
}

/**
 * A faint, atmospheric particle field — depth without noise.
 * Far fewer points than before, larger and softer.
 */
function Atmosphere() {
  const ref = useRef<THREE.Points>(null!);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });

  // build a thin spherical shell of points
  const geo = useRef<THREE.BufferGeometry>(null!);
  return (
    <points ref={ref}>
      <bufferGeometry ref={geo}>
        <bufferAttribute
          attach="attributes-position"
          args={[
            (() => {
              const n = 240;
              const arr = new Float32Array(n * 3);
              for (let i = 0; i < n; i++) {
                const r = 3.5 + Math.random() * 2;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
                arr[i * 3 + 2] = r * Math.cos(phi);
              }
              return arr;
            })(),
            3,
          ]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#9fcfc0"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Subtle pointer parallax — the whole rig drifts a few degrees with the
 * cursor. Deliberately restrained.
 */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { pointer } = useThree();

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y +=
      (pointer.x * 0.22 - group.current.rotation.y) * 0.035;
    group.current.rotation.x +=
      (-pointer.y * 0.16 - group.current.rotation.x) * 0.035;
  });

  return <group ref={group}>{children}</group>;
}

export default function Hero3DScene() {
  return (
    <Canvas
      camera={{ position: [0.4, 0.2, 5.2], fov: 38 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* lighting rig: key + rim + fill */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} color="#eaf6ef" castShadow />
      <directionalLight position={[-5, -1, 2]} intensity={0.35} color="#f3e6cf" />
      <spotLight position={[0, 5, 3]} intensity={2.2} angle={0.6} penumbra={1} color="#bff0d8" />

      <Suspense fallback={null}>
        <ParallaxRig>
          <GlassArtifact />
          <Atmosphere />
          {/* sparse, slow sparkles for life */}
          <Sparkles
            count={28}
            scale={6}
            size={1.6}
            speed={0.12}
            opacity={0.5}
            color="#bfe9da"
          />
        </ParallaxRig>

        {/* ground the artifact with a soft contact shadow */}
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.35}
          scale={9}
          blur={3.2}
          far={4}
          resolution={512}
          color="#000814"
        />

        {/* environment for realistic reflections on the glass */}
        <Environment preset="studio" environmentIntensity={0.45} />
      </Suspense>

      <fog attach="fog" args={["#0e1118", 7, 16]} />
    </Canvas>
  );
}
