"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Icosahedron, Torus, Sparkles, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { PHASES } from "./data";

/**
 * The core shield geometry — a faceted icosahedron with an emissive
 * emerald core, wrapped in a translucent wireframe shell. Slowly
 * rotates and breathes.
 */
function ShieldCore() {
  const inner = useRef<THREE.Mesh>(null!);
  const wire = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (inner.current) {
      inner.current.rotation.y = t * 0.18;
      inner.current.rotation.x = Math.sin(t * 0.3) * 0.12;
      const s = 1 + Math.sin(t * 0.9) * 0.025;
      inner.current.scale.setScalar(s);
    }
    if (wire.current) {
      wire.current.rotation.y = -t * 0.12;
      wire.current.rotation.z = t * 0.05;
    }
  });

  return (
    <group>
      {/* glowing core */}
      <Icosahedron ref={inner} args={[1.15, 0]}>
        <meshStandardMaterial
          color="#2dd4a7"
          emissive="#0fd4a7"
          emissiveIntensity={0.85}
          roughness={0.18}
          metalness={0.55}
          flatShading
        />
      </Icosahedron>
      {/* wireframe shell */}
      <Icosahedron ref={wire} args={[1.55, 1]}>
        <meshBasicMaterial
          color="#7fffd4"
          wireframe
          transparent
          opacity={0.22}
        />
      </Icosahedron>
      {/* inner light */}
      <pointLight position={[0, 0, 0]} color="#2dd4a7" intensity={2.4} distance={6} />
    </group>
  );
}

/**
 * Four orbiting phase rings — one per journey phase, each tilted on a
 * different axis and tinted with its phase accent.
 */
function PhaseRings() {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.08;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.04;
    }
  });

  const rings = PHASES.map((p, i) => {
    const radius = 2.35 + i * 0.32;
    const tube = 0.012;
    const tilt = (Math.PI / 2.6) + i * 0.18;
    const yaw = (i / PHASES.length) * Math.PI * 2;
    return (
      <group key={p.id} rotation={[tilt, yaw, 0]}>
        <Torus args={[radius, tube, 16, 96]}>
          <meshBasicMaterial color={p.colorHex} transparent opacity={0.55} />
        </Torus>
        {/* phase node on the ring */}
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial
            color={p.colorHex}
            emissive={p.colorHex}
            emissiveIntensity={1.4}
          />
        </mesh>
        {/* tiny glow halo around the node */}
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshBasicMaterial color={p.colorHex} transparent opacity={0.18} />
        </mesh>
      </group>
    );
  });

  return <group ref={group}>{rings}</group>;
}

/**
 * Particle field — drifting motes that suggest a wider universe the
 * student is stepping into.
 */
function ParticleField() {
  const positions = useMemo(() => {
    const count = 600;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null!);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#9ff5dd"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

/**
 * Soft parallax: the whole scene drifts slightly with the pointer,
 * giving a real 3D feel without forcing the user to drag.
 */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { pointer } = useThree();

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y +=
        (pointer.x * 0.35 - group.current.rotation.y) * 0.04;
      group.current.rotation.x +=
        (-pointer.y * 0.25 - group.current.rotation.x) * 0.04;
    }
  });

  return <group ref={group}>{children}</group>;
}

export default function Hero3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#9ff5dd" />
      <directionalLight position={[-5, -2, 2]} intensity={0.4} color="#ffb454" />

      <ParallaxRig>
        <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.5}>
          <ShieldCore />
        </Float>
        <PhaseRings />
        <Sparkles
          count={60}
          scale={9}
          size={2.4}
          speed={0.3}
          opacity={0.5}
          color="#7fffd4"
        />
        <ParticleField />
      </ParallaxRig>

      <fog attach="fog" args={["#0a0e16", 8, 18]} />
    </Canvas>
  );
}
