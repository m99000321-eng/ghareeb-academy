"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { GearKind } from "@/lib/products";

const GOLD = "#d9b45b";
const DARK = "#0b0b18";

type SurfaceProps = {
  color: string;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  side?: THREE.Side;
  emissive?: string;
  emissiveIntensity?: number;
};

function Surface({
  color,
  metalness = 0.2,
  roughness = 0.45,
  clearcoat = 0.4,
  side,
  emissive = color,
  emissiveIntensity = 0.04,
}: SurfaceProps) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={0.35}
      sheen={0.25}
      sheenColor="#ffffff"
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      side={side}
    />
  );
}

function Gold({ tone = GOLD }: { tone?: string }) {
  return (
    <meshStandardMaterial
      color={tone}
      metalness={0.92}
      roughness={0.24}
      emissive={tone}
      emissiveIntensity={0.16}
    />
  );
}

function Dark({ tone = DARK }: { tone?: string }) {
  return <meshStandardMaterial color={tone} metalness={0.55} roughness={0.42} />;
}

function shade(color: string, factor: number) {
  const c = new THREE.Color(color);
  c.multiplyScalar(factor);
  return `#${c.getHexString()}`;
}

type MatProps = {
  color: string;
  accent: string;
  metalness: number;
  roughness: number;
};

/* ---------------------------------- glove --------------------------------- */

const gloveProfile: Array<[number, number]> = [
  [0, -1.16],
  [0.5, -1.14],
  [0.6, -1.03],
  [0.7, -0.78],
  [0.83, -0.42],
  [0.93, 0],
  [0.97, 0.38],
  [0.98, 0.72],
  [0.95, 0.96],
  [0.86, 1.1],
  [0.68, 1.2],
  [0.38, 1.26],
  [0, 1.28],
];

function Glove({ color, accent, metalness, roughness }: MatProps) {
  const points = useMemo(
    () => gloveProfile.map(([r, y]) => new THREE.Vector2(r, y)),
    [],
  );
  const cuff = shade(color, 0.45);

  return (
    <group position={[0, 0.35, 0]} rotation={[0.04, 0, 0.03]}>
      <mesh scale={[1.04, 1, 0.95]}>
        <latheGeometry args={[points, 72]} />
        <Surface
          color={color}
          metalness={metalness}
          roughness={roughness}
          clearcoat={0.55}
        />
      </mesh>

      {/* thumb */}
      <mesh position={[0.58, -0.28, 0.26]} scale={[0.95, 1, 1]}>
        <sphereGeometry args={[0.36, 36, 36]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0.72, -0.04, 0.4]} rotation={[0.4, 0, -0.32]}>
        <capsuleGeometry args={[0.25, 0.34, 12, 32]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* cuff */}
      <mesh position={[0, -1.52, 0]}>
        <cylinderGeometry args={[0.64, 0.7, 0.92, 56, 1, false]} />
        <Surface color={cuff} metalness={0.3} roughness={0.55} clearcoat={0.25} />
      </mesh>
      <mesh position={[0, -1.96, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.69, 0.055, 16, 72]} />
        <Surface color={shade(color, 0.34)} metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.97, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.61, 48]} />
        <meshStandardMaterial color="#020208" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* cuff bands + strap */}
      <mesh position={[0, -1.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.66, 0.028, 12, 64]} />
        <Gold />
      </mesh>
      <mesh position={[0, -1.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.71, 0.04, 12, 64]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0, -1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.705, 0.035, 12, 64]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0.7, -1.45, 0]}>
        <boxGeometry args={[0.07, 0.26, 0.22]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* -------------------------------- MMA glove ------------------------------- */

function MmaGlove({ color, accent, metalness, roughness }: MatProps) {
  const wrap = shade(color, 0.5);
  return (
    <group position={[0, 0.15, 0]} rotation={[0.08, 0.18, 0]}>
      <RoundedBox args={[1.34, 1.62, 1.02]} radius={0.44} smoothness={5} position={[0, 0.28, 0]}>
        <Surface color={color} metalness={metalness} roughness={roughness} clearcoat={0.5} />
      </RoundedBox>

      {/* knuckle pad */}
      <RoundedBox args={[1.3, 0.72, 0.52]} radius={0.24} smoothness={5} position={[0, 0.72, 0.3]} rotation={[0.32, 0, 0]}>
        <Surface color={shade(color, 0.78)} metalness={metalness} roughness={roughness} />
      </RoundedBox>

      {/* open fingers */}
      {[-0.44, -0.15, 0.15, 0.44].map((x, index) => (
        <group key={x} position={[x, 0.96 - Math.abs(x) * 0.12, 0.18 + Math.abs(x) * 0.06]}>
          <mesh rotation={[0.16, 0, 0]}>
            <capsuleGeometry args={[0.135, 0.34 + index * 0.02, 10, 24]} />
            <Surface color={color} metalness={metalness} roughness={roughness} />
          </mesh>
          <mesh position={[0, 0.17, 0]} rotation={[0.16, 0, 0]}>
            <torusGeometry args={[0.115, 0.03, 10, 28]} />
            <Dark tone={accent} />
          </mesh>
        </group>
      ))}

      {/* thumb */}
      <mesh position={[0.68, 0.34, 0.26]} rotation={[0.2, 0, -0.55]}>
        <capsuleGeometry args={[0.19, 0.36, 10, 28]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0.72, 0.12, 0.26]} rotation={[0.2, 0, -0.55]}>
        <torusGeometry args={[0.2, 0.035, 10, 32]} />
        <Dark tone={accent} />
      </mesh>

      {/* back strap + wrist wrap */}
      <RoundedBox args={[0.46, 0.26, 0.62]} radius={0.08} smoothness={4} position={[0.22, 0.98, 0.12]} rotation={[0.32, 0, -0.14]}>
        <Gold />
      </RoundedBox>
      <mesh position={[0, -0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.62, 48]} />
        <Surface color={wrap} metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <torusGeometry args={[0.54, 0.035, 12, 56]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ---------------------------------- staff --------------------------------- */

function Staff({ color, accent }: MatProps) {
  return (
    <group rotation={[0, 0, 0.55]}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.078, 4.3, 40]} />
        <Surface color={color} metalness={0.15} roughness={0.4} clearcoat={0.7} />
      </mesh>
      {[2.24, -2.24].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.34, 32]} />
            <Gold tone={accent === DARK ? GOLD : accent} />
          </mesh>
          <mesh position={[0, y > 0 ? -0.19 : 0.19, 0]}>
            <torusGeometry args={[0.095, 0.016, 8, 32]} />
            <Gold />
          </mesh>
        </group>
      ))}
      {[1.45, 0.35, -0.35, -1.45].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.081, 0.011, 8, 32]} />
          <Gold />
        </mesh>
      ))}
      <Sparkles count={24} scale={[3.4, 4.2, 1]} size={1.4} speed={0.3} color={GOLD} />
    </group>
  );
}

/* ---------------------------------- sword --------------------------------- */

function Sword({ color, accent }: MatProps) {
  return (
    <group rotation={[0, 0, 0.5]} scale={0.94}>
      <mesh position={[0, 0.7, 0]} scale={[1, 1, 0.4]}>
        <cylinderGeometry args={[0.062, 0.1, 2.9, 4, 1]} />
        <meshStandardMaterial color="#dfe7f2" metalness={0.68} roughness={0.22} emissive="#7d8ea6" emissiveIntensity={0.28} />
      </mesh>
      <mesh position={[0, 2.16, 0]} scale={[1, 1, 0.4]}>
        <coneGeometry args={[0.068, 0.22, 4]} />
        <meshStandardMaterial color="#dfe7f2" metalness={0.68} roughness={0.22} emissive="#7d8ea6" emissiveIntensity={0.28} />
      </mesh>
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[0.7, 0.1, 0.14]} />
        <Gold />
      </mesh>
      <mesh position={[0, -1.16, 0]}>
        <cylinderGeometry args={[0.085, 0.095, 0.68, 24]} />
        <Surface color={accent === DARK ? "#1a1a28" : accent} metalness={0.3} roughness={0.6} />
      </mesh>
      {[-0.95, -1.08, -1.21, -1.34].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[0, 0, 0.18]}>
          <torusGeometry args={[0.093, 0.014, 8, 28]} />
          <Gold />
        </mesh>
      ))}
      <mesh position={[0, -1.56, 0]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <Gold />
      </mesh>
      <mesh position={[0, -1.82, 0]} rotation={[0, 0, 0.1]}>
        <coneGeometry args={[0.1, 0.42, 20]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  );
}

/* -------------------------------- headgear -------------------------------- */

function Headgear({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.12, 0]} rotation={[0.12, 0.24, 0]}>
      <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.18, 1]}>
        <torusGeometry args={[0.78, 0.16, 20, 72]} />
        <Surface color={shade(color, 0.72)} metalness={metalness} roughness={roughness} />
      </mesh>

      <mesh position={[0, -0.02, 0]} scale={[1.02, 0.94, 1.24]}>
        <sphereGeometry args={[0.8, 48, 32, 0, Math.PI * 2, 0, 1.66]} />
        <Surface color={color} metalness={metalness} roughness={roughness} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 0.94, 1.24]}>
        <torusGeometry args={[0.79, 0.05, 12, 64, Math.PI]} />
        <Dark tone={accent} />
      </mesh>

      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, -0.34, 0.14]} scale={[0.34, 0.62, 0.72]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]}>
          <sphereGeometry args={[0.46, 32, 28]} />
          <Surface color={color} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      <mesh position={[0, 0.02, 0.88]} scale={[1.06, 0.52, 0.28]}>
        <sphereGeometry args={[0.44, 32, 24]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>

      <mesh position={[0, -0.26, 0.08]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.46, 0.042, 10, 48, Math.PI]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0, -0.26, 0.54]}>
        <boxGeometry args={[0.16, 0.1, 0.08]} />
        <Gold />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.72, -0.02, 0.62]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <Gold />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------ shin / chest ------------------------------ */

function Shin({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.55, 0.5, 2, 40, 1, true, -Math.PI * 0.39, Math.PI * 0.78]} />
        <Surface color={color} metalness={metalness} roughness={roughness} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.28, 0.05]} scale={[1, 0.74, 0.9]}>
        <sphereGeometry args={[0.46, 32, 32]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0, -0.74, 0.36]} rotation={[0.55, 0, 0]} scale={[1.05, 1, 0.9]}>
        <RoundedBox args={[0.66, 0.26, 0.62]} radius={0.1} smoothness={4}>
          <Surface color={color} metalness={metalness} roughness={roughness} />
        </RoundedBox>
      </mesh>
      {[0.9, -0.05].map((y) => (
        <mesh key={y} position={[0, y, -0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.98]}>
          <torusGeometry args={[0.53, 0.045, 10, 56]} />
          <Dark tone={accent} />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0.52]} rotation={[0.08, 0, 0]}>
        <torusGeometry args={[0.18, 0.02, 8, 40]} />
        <Gold />
      </mesh>
      <mesh position={[0, 0.45, 0.515]}>
        <circleGeometry args={[0.09, 24]} />
        <Gold />
      </mesh>
    </group>
  );
}

function Chest({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.1, 0]} scale={[1, 1, 0.62]}>
        <cylinderGeometry args={[0.95, 0.85, 1.7, 48, 1, true, -Math.PI * 0.45, Math.PI * 0.9]} />
        <Surface color={color} metalness={metalness} roughness={roughness} side={THREE.DoubleSide} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <RoundedBox key={x} args={[0.2, 0.95, 0.24]} radius={0.08} smoothness={4} position={[x, 1.05, -0.05]} rotation={[-0.35, 0, 0]}>
          <Dark tone={accent} />
        </RoundedBox>
      ))}
      <mesh position={[0, -0.62, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.7]}>
        <torusGeometry args={[0.86, 0.05, 10, 64]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0, 0.3, 0.62]}>
        <circleGeometry args={[0.17, 32]} />
        <Gold />
      </mesh>
      <mesh position={[0, 0.3, 0.615]}>
        <torusGeometry args={[0.24, 0.02, 8, 40]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ---------------------------------- wraps --------------------------------- */

function Wraps({ color, accent }: MatProps) {
  const tail = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.35, 0.2, 0.1),
        new THREE.Vector3(0.8, -0.05, 0.28),
        new THREE.Vector3(0.95, -0.55, 0.5),
        new THREE.Vector3(0.72, -1.0, 0.28),
        new THREE.Vector3(0.35, -1.16, 0.1),
      ]),
    [],
  );

  return (
    <group position={[0, 0.25, 0]} rotation={[0.05, -0.2, 0.06]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.52, 0.52, 0.78, 48]} />
        <Surface color={color} metalness={0.1} roughness={0.75} clearcoat={0.15} />
      </mesh>
      {[-0.22, 0, 0.22].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.515, 0.018, 8, 48]} />
          <Dark tone={accent} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.05, 10, 40]} />
        <Dark tone={accent} />
      </mesh>
      <mesh scale={[1, 1, 0.42]}>
        <tubeGeometry args={[tail, 64, 0.16, 8, false]} />
        <Surface color={color} metalness={0.1} roughness={0.8} clearcoat={0.1} side={THREE.DoubleSide} />
      </mesh>
      <RoundedBox args={[0.34, 0.12, 0.36]} radius={0.04} smoothness={4} position={[0.4, -1.14, 0.12]} rotation={[0, -0.2, 0.1]}>
        <Dark tone={accent} />
      </RoundedBox>
      <mesh position={[-0.1, 0.55, 0.06]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ---------------------------------- bag ----------------------------------- */

function Bag({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh>
        <cylinderGeometry args={[0.62, 0.62, 2.3, 56, 1]} />
        <Surface color={color} metalness={metalness} roughness={roughness} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 1.15, 0]} scale={[1, 0.3, 1]}>
        <sphereGeometry args={[0.62, 40, 24]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0, -1.15, 0]} scale={[1, 0.24, 1]}>
        <sphereGeometry args={[0.62, 40, 24]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      {[0.62, -0.62].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.625, 0.035, 10, 64]} />
          <Gold tone={accent === DARK ? GOLD : accent} />
        </mesh>
      ))}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.18, 0.24, 0.22, 32]} />
        <Dark tone={accent} />
      </mesh>
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 0.28, 1.72, Math.sin(angle) * 0.28]}
          rotation={[Math.sin(angle) * 0.12, 0, -Math.cos(angle) * 0.12]}
        >
          <cylinderGeometry args={[0.018, 0.018, 0.8, 8]} />
          <Gold />
        </mesh>
      ))}
      <mesh position={[0, 2.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.028, 8, 32]} />
        <Gold />
      </mesh>
      <mesh position={[0, 0.05, 0.635]}>
        <circleGeometry args={[0.16, 32]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ------------------------------- mouthguard ------------------------------- */

function Mouthguard({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.05, 0]} rotation={[1.15, 0.1, 0.15]} scale={1.25}>
      <mesh>
        <torusGeometry args={[0.6, 0.17, 20, 64, Math.PI]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[0.93, 0.93, 1.1]}>
        <torusGeometry args={[0.6, 0.09, 16, 64, Math.PI]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.24, 20]} />
        <meshStandardMaterial color="#020208" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.012, 6, 64, Math.PI]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ---------------------------------- belt ---------------------------------- */

function Belt({ color, accent }: MatProps) {
  return (
    <group position={[0, 0.15, 0]} rotation={[0.22, -0.25, 0.08]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.82, 1]}>
        <torusGeometry args={[0.92, 0.13, 16, 72]} />
        <Surface color={color} metalness={0.15} roughness={0.65} clearcoat={0.2} />
      </mesh>
      <RoundedBox args={[0.54, 0.42, 0.14]} radius={0.05} smoothness={4} position={[0, 0.02, 0.78]}>
        <Gold />
      </RoundedBox>
      <mesh position={[0, 0.02, 0.86]}>
        <boxGeometry args={[0.32, 0.22, 0.06]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0.34, -0.55, 0.74]} rotation={[0.18, 0, 0.1]}>
        <boxGeometry args={[0.24, 0.95, 0.07]} />
        <Surface color={color} metalness={0.15} roughness={0.65} />
      </mesh>
      <mesh position={[0.3, -1.0, 0.68]} rotation={[0.18, 0, 0.1]}>
        <boxGeometry args={[0.26, 0.1, 0.08]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ---------------------------------- knee ---------------------------------- */

function Knee({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.1, 0]} rotation={[0.15, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.46, 0.5, 1.4, 40, 1, true]} />
        <Surface color={shade(color, 0.5)} metalness={0.2} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0.1]} scale={[1.08, 1.2, 0.72]}>
        <sphereGeometry args={[0.5, 40, 32]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      {[0.55, -0.55].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.47, 0.055, 10, 56]} />
          <Dark tone={accent} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0.45]} rotation={[0.12, 0, 0]}>
        <torusGeometry args={[0.16, 0.022, 8, 36]} />
        <Gold />
      </mesh>
      <mesh position={[0, 0.05, 0.445]} rotation={[0.12, 0, 0]}>
        <circleGeometry args={[0.13, 32]} />
        <Dark tone={accent} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- fan ----------------------------------- */

function Fan({ color, accent }: MatProps) {
  const alpha = Math.PI * 0.34;
  const ribs = 7;
  return (
    <group position={[0, 0.15, 0]} rotation={[0.16, -0.15, 0]}>
      <mesh position={[0, -0.9, 0]}>
        <circleGeometry args={[1.78, 56, Math.PI / 2 - alpha, alpha * 2]} />
        <Surface
          color={color}
          metalness={0.1}
          roughness={0.68}
          clearcoat={0.15}
          side={THREE.DoubleSide}
          emissiveIntensity={0.06}
        />
      </mesh>
      <mesh position={[0, -0.9, 0]} rotation={[0, 0, Math.PI / 2 - alpha]}>
        <torusGeometry args={[1.78, 0.018, 8, 64, alpha * 2]} />
        <Gold />
      </mesh>
      {Array.from({ length: ribs }).map((_, index) => {
        const angle = -alpha + (index / (ribs - 1)) * alpha * 2;
        return (
          <mesh
            key={index}
            position={[Math.sin(angle) * 0.89, -0.9 + Math.cos(angle) * 0.89, 0.01]}
            rotation={[0, 0, -angle]}
          >
            <boxGeometry args={[0.028, 1.78, 0.035]} />
            <Gold tone={accent === DARK ? GOLD : accent} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.9, 0.02]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ---------------------------------- shoe ---------------------------------- */

function Shoe({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.15, 0]} rotation={[0.1, -1.02, 0]}>
      <RoundedBox args={[0.86, 0.18, 2.3]} radius={0.07} smoothness={4} position={[0, -0.62, 0]}>
        <meshStandardMaterial color="#0d0d16" metalness={0.2} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.76, 0.56, 1.55]} radius={0.22} smoothness={5} position={[0, -0.24, 0.12]}>
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </RoundedBox>
      <mesh position={[0, -0.36, 0.86]} scale={[0.92, 0.72, 0.9]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0, -0.2, -0.78]} scale={[0.95, 0.9, 0.8]}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0, 0.02, -0.66]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.075, 10, 40]} />
        <Surface color={shade(color, 0.5)} metalness={0.1} roughness={0.8} />
      </mesh>
      {[-0.3, 0, 0.3].map((z) => (
        <mesh key={z} position={[0, 0.02, z]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.56, 0.03, 0.05]} />
          <Gold />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.39, -0.32, 0.1]}>
          <boxGeometry args={[0.02, 0.12, 1.15]} />
          <Gold />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------------- shorts --------------------------------- */

function Shorts({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.25, 0]} rotation={[0.1, -0.2, 0]}>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.72, 0.78, 0.3, 40]} />
        <Dark tone={accent} />
      </mesh>
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.66, 1.25, 0.82]}
          radius={0.16}
          smoothness={5}
          position={[side * 0.37, -0.15, 0]}
          rotation={[0, 0, side * 0.08]}
        >
          <Surface color={color} metalness={metalness} roughness={roughness} clearcoat={0.15} />
        </RoundedBox>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.68, -0.2, 0.16]} rotation={[0, 0, side * 0.08]}>
          <boxGeometry args={[0.055, 1.05, 0.06]} />
          <Gold />
        </mesh>
      ))}
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.44, 0.74]} rotation={[0.1, 0, 0]}>
          <capsuleGeometry args={[0.025, 0.3, 6, 12]} />
          <Gold />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- mitts --------------------------------- */

function Mitts({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.1, 0]} rotation={[0.06, -0.22, -0.1]}>
      <mesh scale={[1.08, 1, 0.52]}>
        <sphereGeometry args={[0.82, 48, 40]} />
        <Surface color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      <mesh position={[0, 0, -0.06]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.78, 0.085, 12, 64]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0, 0.02, 0.4]}>
        <torusGeometry args={[0.3, 0.034, 10, 48]} />
        <Gold />
      </mesh>
      <mesh position={[0, 0.02, 0.415]}>
        <circleGeometry args={[0.12, 32]} />
        <Gold />
      </mesh>
      <RoundedBox args={[0.34, 0.78, 0.3]} radius={0.12} smoothness={4} position={[-0.06, -0.66, -0.16]} rotation={[0.18, 0, 0.08]}>
        <Dark tone={accent} />
      </RoundedBox>
      <mesh position={[0.34, -0.46, -0.2]} rotation={[0.24, 0, 0.24]}>
        <torusGeometry args={[0.22, 0.055, 10, 32]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0.42, -0.36, -0.2]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* --------------------------------- uniform -------------------------------- */

function Uniform({ color, accent, metalness, roughness }: MatProps) {
  return (
    <group position={[0, 0.1, 0]} rotation={[0.04, -0.1, 0]}>
      <RoundedBox args={[1.5, 1.65, 0.5]} radius={0.14} smoothness={5} position={[0, 0.25, 0]}>
        <Surface color={color} metalness={0.05} roughness={0.85} clearcoat={0.08} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.52, 1.1, 0.48]}
          radius={0.16}
          smoothness={5}
          position={[side * 0.98, 0.45, 0]}
          rotation={[0, 0, side * 0.28]}
        >
          <Surface color={color} metalness={0.05} roughness={0.85} clearcoat={0.08} />
        </RoundedBox>
      ))}
      <RoundedBox args={[1.52, 0.62, 0.46]} radius={0.12} smoothness={5} position={[0, -0.8, 0]}>
        <Surface color={color} metalness={0.05} roughness={0.85} clearcoat={0.08} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.14, 0.78, 0.26]} rotation={[0, 0, side * -0.28]}>
          <boxGeometry args={[0.16, 0.66, 0.06]} />
          <Gold />
        </mesh>
      ))}
      <mesh position={[0, 1.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.29, 0.075, 12, 40]} />
        <Surface color={shade(color, 0.62)} metalness={0.1} roughness={0.8} clearcoat={0.1} />
      </mesh>
      <mesh position={[0, -0.45, 0.26]}>
        <boxGeometry args={[1.56, 0.2, 0.1]} />
        <Dark tone={accent} />
      </mesh>
      <mesh position={[0, -0.45, 0.32]}>
        <boxGeometry args={[0.16, 0.34, 0.06]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ---------------------------------- root ---------------------------------- */

const layout: Record<
  GearKind,
  { scale: number; position?: [number, number, number]; rotation?: [number, number, number] }
> = {
  glove: { scale: 1 },
  "mma-glove": { scale: 1.15, position: [0, -0.05, 0] },
  staff: { scale: 1 },
  sword: { scale: 1 },
  headgear: { scale: 1.1 },
  shin: { scale: 1 },
  chest: { scale: 1.05 },
  wraps: { scale: 1.15 },
  bag: { scale: 0.95, position: [0, -0.05, 0] },
  mouthguard: { scale: 1.15 },
  belt: { scale: 1.05 },
  knee: { scale: 1.15 },
  fan: { scale: 1 },
  shoe: { scale: 1.15, position: [0, 0.05, 0] },
  shorts: { scale: 1.05 },
  mitts: { scale: 1.1 },
  uniform: { scale: 1.05 },
};

export type GearModelProps = MatProps & {
  kind?: GearKind;
  spin?: number;
  scale?: number;
};

export function GearModel({
  kind = "glove",
  color = "#ff3d6e",
  accent = DARK,
  metalness = 0.2,
  roughness = 0.45,
  spin = 0.12,
  scale = 1,
}: GearModelProps) {
  const root = useRef<THREE.Group>(null);
  const props: MatProps = { color, accent, metalness, roughness };
  const placed = layout[kind];

  useFrame((state, delta) => {
    if (!root.current) return;
    root.current.rotation.y += delta * spin;
    root.current.rotation.z = 0.03 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
  });

  return (
    <group ref={root} scale={scale}>
      <group
        position={placed.position}
        rotation={placed.rotation}
        scale={placed.scale}
      >
        {kind === "glove" ? <Glove {...props} /> : null}
        {kind === "mma-glove" ? <MmaGlove {...props} /> : null}
        {kind === "staff" ? <Staff {...props} /> : null}
        {kind === "sword" ? <Sword {...props} /> : null}
        {kind === "headgear" ? <Headgear {...props} /> : null}
        {kind === "shin" ? <Shin {...props} /> : null}
        {kind === "chest" ? <Chest {...props} /> : null}
        {kind === "wraps" ? <Wraps {...props} /> : null}
        {kind === "bag" ? <Bag {...props} /> : null}
        {kind === "mouthguard" ? <Mouthguard {...props} /> : null}
        {kind === "belt" ? <Belt {...props} /> : null}
        {kind === "knee" ? <Knee {...props} /> : null}
        {kind === "fan" ? <Fan {...props} /> : null}
        {kind === "shoe" ? <Shoe {...props} /> : null}
        {kind === "shorts" ? <Shorts {...props} /> : null}
        {kind === "mitts" ? <Mitts {...props} /> : null}
        {kind === "uniform" ? <Uniform {...props} /> : null}
      </group>
    </group>
  );
}
