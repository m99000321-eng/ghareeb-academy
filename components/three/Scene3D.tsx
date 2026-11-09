"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  OrbitControls,
  Sparkles,
  Stars,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { MathUtils } from "three";
import type { Group } from "three";
import type { GearKind } from "@/lib/products";
import { GearModel } from "./GearModel";

export type SceneVariant = "hero" | "config" | "product";

export type Scene3DProps = {
  variant?: SceneVariant;
  color?: string;
  accent?: string;
  metalness?: number;
  roughness?: number;
  model?: GearKind;
};

const shards = Array.from({ length: 16 }, (_, index) => {
  const angle = (index / 16) * Math.PI * 2;
  return {
    angle,
    radius: 2.35 + (index % 3) * 0.3,
    y: Math.sin(index * 1.7) * 1.15,
    size: 0.045 + (index % 4) * 0.018,
    color: index % 2 === 0 ? "#c8ff2e" : "#8b5cf6",
  };
});

function Portal() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.06;
  });

  return (
    <group ref={group} position={[0, 0.1, -2.2]} rotation={[Math.PI / 2.3, 0, 0]}>
      <mesh>
        <torusGeometry args={[2.55, 0.018, 12, 200]} />
        <meshBasicMaterial color="#c8ff2e" toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2.7]}>
        <torusGeometry args={[2.8, 0.007, 8, 200]} />
        <meshBasicMaterial color="#8b5cf6" toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 3.6]}>
        <torusGeometry args={[2.3, 0.005, 8, 200]} />
        <meshBasicMaterial color="#22d3ee" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Shards() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.14;
  });

  return (
    <group ref={group}>
      {shards.map((shard, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(shard.angle) * shard.radius,
            shard.y,
            Math.sin(shard.angle) * shard.radius,
          ]}
        >
          <tetrahedronGeometry args={[shard.size, 0]} />
          <meshBasicMaterial color={shard.color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Pedestal() {
  return (
    <group position={[0, -1.95, 0]}>
      <mesh>
        <cylinderGeometry args={[1.55, 1.7, 0.18, 64]} />
        <meshStandardMaterial color="#0b0b18" metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.26, 96]} />
        <meshBasicMaterial color="#c8ff2e" transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.1} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CursorRig({ enabled }: { enabled: boolean }) {
  useFrame((state, delta) => {
    if (!enabled) return;
    const { camera, pointer } = state;
    camera.position.x = MathUtils.damp(camera.position.x, pointer.x * 0.55, 2.5, delta);
    camera.position.y = MathUtils.damp(camera.position.y, 0.35 + pointer.y * 0.3, 2.5, delta);
    camera.lookAt(0, 0.2, 0);
  });
  return null;
}

export default function Scene3D({
  variant = "hero",
  color = "#c8ff2e",
  accent = "#8b5cf6",
  metalness = 0.25,
  roughness = 0.3,
  model = "glove",
}: Scene3DProps) {
  const isHero = variant === "hero";
  const isConfig = variant === "config";
  const isProduct = variant === "product";

  return (
    <Canvas
      dpr={[1, 1.7]}
      camera={{
        position: [0, isConfig ? 0.5 : 0.35, 7.3],
        fov: isHero ? 37 : 40,
      }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={
        <div className="grid h-full w-full place-items-center bg-ink text-sm text-white/40">
          جهازك لا يدعم WebGL
        </div>
      }
    >
      <ambientLight intensity={isHero ? 0.38 : 0.4} />
      <directionalLight
        position={[4.5, 7, 5]}
        intensity={isHero ? 2.5 : 2.0}
        color="#ffffff"
      />
      <directionalLight
        position={[-5, 3.5, 2]}
        intensity={isHero ? 1.15 : 0.75}
        color={isHero ? "#8b5cf6" : "#dfe6ff"}
      />
      <directionalLight position={[0, 2, -6]} intensity={isHero ? 0.9 : 0.9} color="#f6e6c8" />
      <pointLight
        position={[-4, 2, -3]}
        intensity={isHero ? 30 : 8}
        color={isHero ? "#8b5cf6" : "#cdd7f0"}
        distance={24}
      />
      <pointLight
        position={[4, -2, 3]}
        intensity={isHero ? 18 : 6}
        color={isHero ? "#c8ff2e" : "#ffe7bd"}
        distance={20}
      />

      <Suspense fallback={null}>
        {isHero ? (
          <Environment resolution={160}>
            <Lightformer
              form="rect"
              intensity={2.4}
              color="#ffffff"
              scale={[8, 8, 1]}
              position={[0, 5, -6]}
            />
            <Lightformer
              form="rect"
              intensity={2.2}
              color="#8b5cf6"
              scale={[6, 6, 1]}
              position={[-6, 0, 2]}
              rotation={[0, Math.PI / 2, 0]}
            />
            <Lightformer
              form="rect"
              intensity={1.8}
              color="#c8ff2e"
              scale={[5, 5, 1]}
              position={[6, -1, 2]}
              rotation={[0, -Math.PI / 2, 0]}
            />
            <Lightformer
              form="circle"
              intensity={1.4}
              color="#22d3ee"
              scale={[3, 3, 1]}
              position={[0, -4, 1]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </Environment>
        ) : (
          <Environment files="/hdri/studio.hdr" environmentIntensity={0.85} resolution={256} />
        )}

        {isHero ? (
          <>
            <Stars
              radius={70}
              depth={36}
              count={1500}
              factor={3.4}
              saturation={0}
              fade
              speed={0.5}
            />
            <Portal />
            <Shards />
            <Sparkles
              count={60}
              scale={[9, 6, 7]}
              size={2}
              speed={0.35}
              color="#c8ff2e"
            />
            <Sparkles
              count={36}
              scale={[8, 6, 6]}
              size={2.4}
              speed={0.25}
              color="#8b5cf6"
            />
          </>
        ) : null}

        <CursorRig enabled={isHero} />

        <group
          position={[0, isHero ? 0 : 0.2, 0]}
          rotation={[0.08, isConfig ? -0.2 : -0.4, 0]}
        >
          <Float
            speed={isHero ? 1.4 : 1}
            rotationIntensity={isHero ? 0.3 : 0.18}
            floatIntensity={isHero ? 0.9 : 0.5}
          >
            <GearModel
              kind={model}
              color={color}
              accent={accent}
              metalness={metalness}
              roughness={roughness}
              spin={isProduct ? 0.1 : isHero ? 0.06 : 0.18}
              scale={isHero ? 1.04 : isConfig ? 0.95 : 1.05}
            />
          </Float>
          {isConfig ? <Pedestal /> : null}
        </group>

        {isProduct ? (
          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={1.1}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 1.7}
          />
        ) : null}

        {!isHero ? (
          <ContactShadows
            position={[0, isConfig ? -1.88 : -2.02, 0]}
            opacity={isConfig ? 0.55 : 0.42}
            scale={9}
            blur={2.6}
            far={4.4}
            resolution={512}
            color="#000000"
          />
        ) : null}

        {!isHero ? (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.24}
              luminanceThreshold={0.74}
              luminanceSmoothing={0.2}
              mipmapBlur
              radius={0.55}
            />
            <Vignette offset={0.34} darkness={0.42} />
          </EffectComposer>
        ) : null}
      </Suspense>
    </Canvas>
  );
}
