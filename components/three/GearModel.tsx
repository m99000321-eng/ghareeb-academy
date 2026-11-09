"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { GearKind } from "@/lib/products";
import { getSurfaceMaps, type SurfaceKind } from "./textures";

const GOLD = "#d9b45b";
const DARK = "#0b0b18";

type P3 = [number, number, number];

type SurfaceProps = {
  color: string;
  finish?: SurfaceKind;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  bumpScale?: number;
  side?: THREE.Side;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
};

function Surface({
  color,
  finish = "leather",
  metalness = 0.04,
  roughness = 0.52,
  clearcoat = 0.22,
  bumpScale,
  side,
  emissiveIntensity = 0.012,
  transparent,
  opacity,
}: SurfaceProps) {
  const maps = useMemo(() => getSurfaceMaps(finish), [finish]);
  const [leatherDiff, leatherNormal, leatherRough] = useTexture([
    "/tex/leather_diff.jpg",
    "/tex/leather_normal.jpg",
    "/tex/leather_rough.jpg",
  ]);
  const isLeather = finish === "leather";

  useMemo(() => {
    for (const texture of [leatherDiff, leatherNormal, leatherRough]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2.2, 2.2);
      texture.anisotropy = 4;
    }
    leatherDiff.colorSpace = THREE.SRGBColorSpace;
    leatherNormal.colorSpace = THREE.NoColorSpace;
    leatherRough.colorSpace = THREE.NoColorSpace;
  }, [leatherDiff, leatherNormal, leatherRough]);

  const normalScale = useMemo(() => new THREE.Vector2(0.75, 0.75), []);
  const scale =
    bumpScale ??
    (finish === "leather" ? 0.038 : finish === "fabric" ? 0.02 : 0.01);
  const rough = Math.min(0.88, roughness + (finish === "leather" ? 0.1 : 0.04));

  return (
    <meshPhysicalMaterial
      color={color}
      map={isLeather ? leatherDiff : maps?.grain ?? undefined}
      normalMap={isLeather ? leatherNormal : undefined}
      normalScale={isLeather ? normalScale : undefined}
      roughnessMap={isLeather ? leatherRough : undefined}
      bumpMap={isLeather ? undefined : maps?.bump ?? undefined}
      bumpScale={scale}
      metalness={metalness}
      roughness={isLeather ? 0.92 : rough}
      clearcoat={Math.min(clearcoat, 0.14)}
      clearcoatRoughness={0.58}
      sheen={finish === "fabric" ? 0.7 : 0.12}
      sheenColor="#ffffff"
      sheenRoughness={0.75}
      emissive={color}
      emissiveIntensity={emissiveIntensity * 0.6}
      envMapIntensity={0.9}
      side={side}
      transparent={transparent}
      opacity={opacity}
    />
  );
}

function Gold({ tone = GOLD, roughness = 0.26 }: { tone?: string; roughness?: number }) {
  return (
    <meshStandardMaterial
      color={tone}
      metalness={1}
      roughness={roughness}
      envMapIntensity={1.35}
    />
  );
}

function Steel() {
  return (
    <meshStandardMaterial
      color="#b9c4d4"
      metalness={0.9}
      roughness={0.3}
      envMapIntensity={1.1}
    />
  );
}

function Dark({
  tone = DARK,
  roughness = 0.7,
  side,
}: {
  tone?: string;
  roughness?: number;
  side?: THREE.Side;
}) {
  return (
    <meshStandardMaterial
      color={tone}
      metalness={0.18}
      roughness={roughness}
      envMapIntensity={0.9}
      side={side}
    />
  );
}

function shade(color: string, factor: number) {
  const c = new THREE.Color(color);
  c.multiplyScalar(factor);
  return `#${c.getHexString()}`;
}

function luminance(color: string) {
  const c = new THREE.Color(color);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

function trimColor(accent: string, color: string) {
  return luminance(accent) < 0.12 ? shade(color, 0.42) : accent;
}

function circlePoints(radius: number, y: number, zScale = 1, segments = 16): P3[] {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2;
    return [
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius * zScale,
    ] as P3;
  });
}

/* -------------------------------- details --------------------------------- */

function Stitches({
  points,
  count = 24,
  size = 0.008,
  color = "#14141c",
}: {
  points: P3[];
  count?: number;
  size?: number;
  color?: string;
}) {
  const geometry = useMemo(
    () => new THREE.BoxGeometry(size * 2.4, size * 0.7, size * 0.7),
    [size],
  );
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0.05 }),
    [color],
  );
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    [points],
  );
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const axis = new THREE.Vector3(1, 0, 0);
    for (let index = 0; index < count; index += 1) {
      const t = (index + 0.5) / count;
      dummy.position.copy(curve.getPointAt(t));
      dummy.quaternion.setFromUnitVectors(axis, curve.getTangentAt(t).normalize());
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [curve, count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <instancedMesh ref={ref} args={[geometry, material, count]} />;
}

function Laces({
  points,
  radius = 0.013,
  color = "#16161f",
  metalness = 0.1,
}: {
  points: P3[];
  radius?: number;
  color?: string;
  metalness?: number;
}) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    [points],
  );

  return (
    <mesh>
      <tubeGeometry args={[curve, 56, radius, 8, false]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={0.62} />
    </mesh>
  );
}

function Eyelet({ position, rotation = [0, 0, 0] }: { position: P3; rotation?: P3 }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <torusGeometry args={[0.026, 0.008, 8, 24]} />
        <Gold />
      </mesh>
      <mesh>
        <circleGeometry args={[0.024, 16]} />
        <meshStandardMaterial color="#050508" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Rivet({ position, scale = 1 }: { position: P3; scale?: number }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.02, 12, 12]} />
      <Gold />
    </mesh>
  );
}

function LogoPatch({
  position,
  rotation = [0, 0, 0],
  size = 0.34,
}: {
  position: P3;
  rotation?: P3;
  size?: number;
}) {
  const logo = useTexture("/brand/logo.png");
  logo.colorSpace = THREE.SRGBColorSpace;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.003]}>
        <planeGeometry args={[size * 1.07, size * 1.07]} />
        <Gold roughness={0.36} />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={logo} roughness={0.44} metalness={0.22} />
      </mesh>
    </group>
  );
}

type MatProps = {
  color: string;
  accent: string;
  metalness: number;
  roughness: number;
};

/* ---------------------------------- glove --------------------------------- */

const gloveProfile: Array<[number, number]> = [
  [0, -1.12],
  [0.44, -1.1],
  [0.57, -1.02],
  [0.64, -0.86],
  [0.72, -0.62],
  [0.83, -0.32],
  [0.91, 0],
  [0.96, 0.32],
  [0.985, 0.6],
  [0.975, 0.85],
  [0.93, 1.03],
  [0.81, 1.16],
  [0.62, 1.24],
  [0.36, 1.27],
  [0, 1.28],
];

function Glove({ color, accent, metalness, roughness }: MatProps) {
  const points = useMemo(
    () => gloveProfile.map(([r, y]) => new THREE.Vector2(r, y)),
    [],
  );
  const cuff = shade(color, 0.46);
  const trim = trimColor(accent, color);
  const leather = {
    metalness: Math.min(0.1, metalness * 0.4),
    roughness: THREE.MathUtils.clamp(roughness, 0.36, 0.7),
  };

  return (
    <group position={[0, 0.35, 0]} rotation={[0.04, 0.1, 0.03]}>
      <mesh scale={[1.06, 1, 0.94]}>
        <latheGeometry args={[points, 88]} />
        <Surface color={color} finish="leather" {...leather} clearcoat={0.16} />
      </mesh>

      {/* reinforced knuckle panel */}
      <mesh position={[0, 0.7, 0.44]} scale={[0.88, 0.64, 0.56]}>
        <sphereGeometry args={[1, 44, 32]} />
        <Surface color={shade(color, 0.94)} finish="leather" {...leather} clearcoat={0.1} />
      </mesh>
      <mesh position={[0, 0.7, 0.5]} scale={[0.875, 0.635, 1]}>
        <torusGeometry args={[0.99, 0.012, 8, 64]} />
        <Dark tone={shade(color, 0.34)} roughness={0.88} />
      </mesh>
      <Stitches
        points={Array.from({ length: 19 }, (_, index) => {
          const angle = (index / 18) * Math.PI * 2;
          return [
            Math.cos(angle) * 0.85,
            0.7 + Math.sin(angle) * 0.61,
            0.51,
          ] as P3;
        })}
        count={32}
        size={0.009}
        color={shade(color, 0.26)}
      />

      {/* knuckle panel seam */}
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.94, 1]}>
        <torusGeometry args={[0.985, 0.011, 8, 88]} />
        <Dark tone={shade(color, 0.3)} roughness={0.8} />
      </mesh>

      {/* back-of-hand seam */}
      <Stitches
        points={[
          [0, -0.92, -0.58],
          [0, -0.55, -0.79],
          [0, -0.16, -0.87],
          [0, 0.3, -0.92],
          [0, 0.72, -0.88],
          [0, 1.02, -0.68],
        ]}
        count={20}
        size={0.0065}
        color={shade(color, 0.22)}
      />

      {/* palm pad + grip bar */}
      <mesh position={[0, -0.3, -0.79]} scale={[0.7, 0.8, 0.2]}>
        <sphereGeometry args={[1, 44, 32]} />
        <Surface color={shade(color, 0.5)} finish="leather" {...leather} />
      </mesh>
      <RoundedBox
        args={[0.5, 0.15, 0.12]}
        radius={0.05}
        smoothness={4}
        position={[0, -0.6, -0.95]}
        rotation={[0.1, 0, 0]}
      >
        <Surface color={shade(color, 0.3)} finish="leather" {...leather} />
      </RoundedBox>

      {/* thumb */}
      <mesh position={[0.72, -0.24, 0.28]} scale={[0.64, 0.9, 0.72]}>
        <sphereGeometry args={[0.5, 44, 32]} />
        <Surface color={shade(color, 0.88)} finish="leather" {...leather} clearcoat={0.2} />
      </mesh>
      <mesh position={[0.9, 0.16, 0.48]} rotation={[0.55, 0, -0.3]}>
        <capsuleGeometry args={[0.235, 0.34, 16, 40]} />
        <Surface color={shade(color, 0.88)} finish="leather" {...leather} clearcoat={0.2} />
      </mesh>
      <mesh position={[0.78, -0.02, 0.4]} rotation={[0.35, 0.1, -0.25]}>
        <torusGeometry args={[0.255, 0.014, 8, 44]} />
        <Dark tone={shade(color, 0.3)} />
      </mesh>
      <Stitches
        points={[
          [0.46, -0.5, 0.5],
          [0.66, -0.32, 0.58],
          [0.86, -0.02, 0.6],
          [1.0, 0.3, 0.5],
        ]}
        count={11}
        size={0.006}
        color={shade(color, 0.22)}
      />

      {/* brand patch on the back of the hand */}
      <LogoPatch position={[0, 0.34, -0.93]} rotation={[0, Math.PI, 0]} size={0.3} />

      {/* cuff */}
      <mesh position={[0, -1.64, 0]}>
        <cylinderGeometry args={[0.61, 0.67, 1.16, 56, 1]} />
        <Surface color={cuff} finish="leather" metalness={0.05} roughness={0.66} clearcoat={0.12} />
      </mesh>
      <mesh position={[0, -1.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.525, 0.075, 14, 64]} />
        <Surface color={shade(color, 0.58)} finish="leather" metalness={0.05} roughness={0.6} />
      </mesh>
      <mesh position={[0, -2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.675, 0.055, 12, 64]} />
        <Dark tone={shade(color, 0.3)} />
      </mesh>
      <mesh position={[0, -2.215, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.59, 48]} />
        <meshStandardMaterial color="#040409" roughness={0.96} side={THREE.DoubleSide} />
      </mesh>

      {/* velcro strap across the cuff */}
      <group position={[0, -1.64, 0]}>
        <mesh>
          <cylinderGeometry args={[0.695, 0.715, 0.52, 56, 1, true, -0.85, 1.7]} />
          <Surface
            color={trim}
            finish="leather"
            metalness={0.05}
            roughness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        <RoundedBox
          args={[0.4, 0.24, 0.05]}
          radius={0.02}
          smoothness={4}
          position={[0, 0, 0.73]}
        >
          <Dark tone={shade(color, 0.28)} roughness={0.9} />
        </RoundedBox>
        <LogoPatch position={[0, 0, 0.765]} size={0.3} />
      </group>

      {/* cuff lacing at the back */}
      {[-0.17, 0.17].map((x) =>
        [-1.98, -1.8, -1.62, -1.44, -1.26].map((y) => (
          <Eyelet key={`${x}-${y}`} position={[x, y, -0.66]} rotation={[0, Math.PI, 0]} />
        )),
      )}
      <Laces
        points={[
          [-0.17, -1.96, -0.675],
          [0.17, -1.84, -0.675],
          [-0.17, -1.72, -0.675],
          [0.17, -1.6, -0.675],
          [-0.17, -1.48, -0.675],
          [0.17, -1.36, -0.675],
          [-0.17, -1.24, -0.675],
        ]}
        radius={0.013}
        color="#24242f"
      />
      <Rivet position={[0, -2.02, -0.69]} scale={0.8} />
      <Rivet position={[0, -1.3, -0.69]} scale={0.8} />
    </group>
  );
}

/* -------------------------------- MMA glove ------------------------------- */

function MmaGlove({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const wrap = shade(color, 0.4);
  const leather = {
    metalness: Math.min(0.08, metalness * 0.35),
    roughness: THREE.MathUtils.clamp(roughness, 0.46, 0.72),
  };
  const fingerX = [-0.405, -0.135, 0.135, 0.405];
  const fingerY = [0.84, 0.9, 0.9, 0.84];

  return (
    <group position={[0, 0.04, 0]} rotation={[0.05, 0.3, 0]}>
      {/* wrist cuff */}
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.45, 0.5, 0.72, 48]} />
        <Surface color={wrap} finish="leather" metalness={0.05} roughness={0.7} clearcoat={0.08} />
      </mesh>
      <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.458, 0.032, 10, 56]} />
        <Surface color={trim} finish="leather" metalness={0.04} roughness={0.66} />
      </mesh>
      <mesh position={[0, -0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.508, 0.045, 10, 56]} />
        <Dark tone={shade(color, 0.28)} />
      </mesh>

      {/* velcro closure */}
      <group position={[0, -0.56, 0]}>
        <mesh>
          <cylinderGeometry args={[0.51, 0.53, 0.3, 56, 1, true, -1.0, 2.0]} />
          <Surface
            color={trim}
            finish="leather"
            metalness={0.05}
            roughness={0.64}
            side={THREE.DoubleSide}
          />
        </mesh>
        <RoundedBox
          args={[0.38, 0.2, 0.06]}
          radius={0.02}
          smoothness={4}
          position={[0, 0, 0.545]}
        >
          <Dark tone={shade(color, 0.26)} roughness={0.9} />
        </RoundedBox>
        <LogoPatch position={[0, 0, 0.58]} size={0.19} />
      </group>

      {/* padded back of the hand */}
      <RoundedBox
        args={[1.12, 1.06, 0.58]}
        radius={0.27}
        smoothness={6}
        position={[0, 0.24, -0.05]}
      >
        <Surface color={color} finish="leather" {...leather} />
      </RoundedBox>

      {/* knuckle padding row */}
      {fingerX.map((x, index) => (
        <group key={`knuckle-${x}`} position={[x, fingerY[index], 0.0]}>
          <RoundedBox
            args={[0.255, 0.4, 0.46]}
            radius={0.115}
            smoothness={5}
            rotation={[-0.24, 0, 0]}
          >
            <Surface color={shade(color, 0.92)} finish="leather" {...leather} />
          </RoundedBox>
          <mesh position={[0, 0.16, 0.06]} rotation={[0.35, 0, 0]}>
            <capsuleGeometry args={[0.088, 0.2 + (1 - Math.abs(x)) * 0.08, 10, 24]} />
            <Surface color={shade(color, 0.34)} finish="leather" roughness={0.82} metalness={0.02} />
          </mesh>
          <mesh position={[0, 0.27, 0.2]} rotation={[1.05, 0, 0]}>
            <capsuleGeometry args={[0.082, 0.13, 10, 24]} />
            <Surface color={shade(color, 0.34)} finish="leather" roughness={0.82} metalness={0.02} />
          </mesh>
          <mesh position={[0, 0.14, 0.16]} rotation={[Math.PI / 2 - 0.4, 0, 0]}>
            <torusGeometry args={[0.1, 0.022, 8, 26]} />
            <Surface color={shade(color, 0.55)} finish="leather" metalness={0.04} roughness={0.66} />
          </mesh>
        </group>
      ))}

      {/* knuckle seam + stitch row */}
      <mesh position={[0, 0.6, 0.27]} rotation={[0.06, 0, 0]}>
        <torusGeometry args={[0.51, 0.014, 8, 60, Math.PI * 1.15]} />
        <Dark tone={shade(color, 0.34)} roughness={0.88} />
      </mesh>
      <Stitches
        points={[
          [-0.5, 0.48, 0.29],
          [-0.24, 0.58, 0.31],
          [0.24, 0.58, 0.31],
          [0.5, 0.48, 0.29],
        ]}
        count={18}
        size={0.006}
        color={shade(color, 0.28)}
      />

      {/* open palm side (rear) */}
      <RoundedBox
        args={[0.96, 0.88, 0.08]}
        radius={0.035}
        smoothness={4}
        position={[0, 0.24, -0.31]}
        rotation={[0, Math.PI, 0]}
      >
        <Surface color={shade(color, 0.3)} finish="leather" roughness={0.84} metalness={0.02} />
      </RoundedBox>
      <mesh position={[0, -0.06, -0.32]} rotation={[0, Math.PI, 0]} scale={[0.72, 0.26, 0.14]}>
        <sphereGeometry args={[0.6, 32, 24]} />
        <Surface color={shade(color, 0.4)} finish="leather" roughness={0.8} metalness={0.02} />
      </mesh>

      {/* back-of-hand panel + badge */}
      <LogoPatch position={[0, 0.2, 0.25]} size={0.25} />

      {/* thumb */}
      <group position={[0.64, 0.28, 0.16]} rotation={[0.2, 0, -0.7]}>
        <mesh scale={[0.66, 1, 0.72]}>
          <sphereGeometry args={[0.2, 32, 24]} />
          <Surface color={shade(color, 0.9)} finish="leather" {...leather} />
        </mesh>
        <mesh position={[0, 0.3, 0.02]} rotation={[0.1, 0, 0]}>
          <capsuleGeometry args={[0.1, 0.3, 10, 26]} />
          <Surface color={shade(color, 0.34)} finish="leather" roughness={0.82} metalness={0.02} />
        </mesh>
        <mesh position={[0, 0.17, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.135, 0.026, 8, 30]} />
          <Surface color={shade(color, 0.55)} finish="leather" metalness={0.04} roughness={0.66} />
        </mesh>
      </group>

      <Stitches
        points={[
          [-0.44, -0.02, 0.32],
          [-0.2, -0.06, 0.34],
          [0.2, -0.06, 0.34],
          [0.44, -0.02, 0.32],
        ]}
        count={16}
        size={0.0055}
        color={shade(color, 0.3)}
      />
    </group>
  );
}

/* ---------------------------------- staff --------------------------------- */

function Staff({ color }: MatProps) {
  const wood = shade(color, 0.72);
  return (
    <group rotation={[0, 0, 0.5]}>
      <mesh>
        <cylinderGeometry args={[0.066, 0.076, 4.15, 40]} />
        <Surface color={wood} finish="wood" metalness={0.02} roughness={0.5} clearcoat={0.4} />
      </mesh>

      {[2.07, -2.07].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.092, 0.086, 0.3, 32]} />
            <Gold />
          </mesh>
          <mesh position={[0, y > 0 ? 0.15 : -0.15, 0]}>
            <sphereGeometry args={[0.086, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Gold />
          </mesh>
          <mesh position={[0, y > 0 ? -0.14 : 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.086, 0.012, 8, 32]} />
            <Gold tone="#b98f3d" />
          </mesh>
        </group>
      ))}

      {/* center grip */}
      <mesh>
        <cylinderGeometry args={[0.083, 0.083, 0.72, 40]} />
        <Surface color="#12121a" finish="leather" metalness={0.05} roughness={0.66} />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.085, 0.017, 10, 40]} />
        <Gold />
      </mesh>
      <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.085, 0.017, 10, 40]} />
        <Gold />
      </mesh>
      {[1.35, -1.35].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.075, 0.009, 8, 32]} />
          <Gold tone="#b98f3d" />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- sword --------------------------------- */

function Sword({ color, accent }: MatProps) {
  const wrapColor = luminance(accent) < 0.12 ? "#181822" : accent;
  const tassel = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -1.42, 0),
        new THREE.Vector3(0.12, -1.62, 0.05),
        new THREE.Vector3(0.06, -1.86, 0.02),
        new THREE.Vector3(-0.04, -2.02, 0),
      ]),
    [],
  );
  const helixA = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 72; i += 1) {
      const t = i / 72;
      const a = t * Math.PI * 6;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.082, -1.26 + t * 0.68, Math.sin(a) * 0.082));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);
  const helixB = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 72; i += 1) {
      const t = i / 72;
      const a = -t * Math.PI * 6;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.082, -1.26 + t * 0.68, Math.sin(a) * 0.082));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  return (
    <group rotation={[0, 0, 0.42]} scale={0.95}>
      <mesh position={[0, 0.95, 0]} scale={[1, 1, 0.3]}>
        <cylinderGeometry args={[0.058, 0.083, 2.75, 4, 1]} />
        <Steel />
      </mesh>
      <mesh position={[0, 2.38, 0]} scale={[1, 1, 0.3]}>
        <coneGeometry args={[0.06, 0.2, 4]} />
        <Steel />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.012, 2.6, 0.006]} />
        <meshStandardMaterial color="#b9c6d8" metalness={0.95} roughness={0.18} />
      </mesh>

      {/* guard */}
      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.245, 0.245, 0.055, 40]} />
        <Gold />
      </mesh>
      <mesh position={[0, -0.49, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.02, 32]} />
        <Dark tone="#171720" />
      </mesh>
      {[0.11, -0.11].map((x) => (
        <Rivet key={x} position={[x, -0.46, 0.2]} scale={0.9} />
      ))}

      {/* wrapped handle */}
      <mesh position={[0, -0.92, 0]}>
        <cylinderGeometry args={[0.075, 0.08, 0.78, 28]} />
        <Surface color={wrapColor} finish="leather" metalness={0.04} roughness={0.68} />
      </mesh>
      <mesh>
        <tubeGeometry args={[helixA, 90, 0.011, 6, false]} />
        <Gold tone="#c9a44c" />
      </mesh>
      <mesh>
        <tubeGeometry args={[helixB, 90, 0.011, 6, false]} />
        <Gold tone="#c9a44c" />
      </mesh>

      {/* pommel + tassel */}
      <mesh position={[0, -1.36, 0]}>
        <sphereGeometry args={[0.105, 24, 16]} />
        <Gold />
      </mesh>
      <mesh position={[0, -1.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.055, 0.012, 8, 24]} />
        <Gold />
      </mesh>
      <mesh>
        <tubeGeometry args={[tassel, 40, 0.018, 6, false]} />
        <meshStandardMaterial color={luminance(accent) < 0.12 ? "#8f1f2b" : accent} roughness={0.8} />
      </mesh>
      <mesh position={[-0.04, -2.14, 0]} scale={[1, 1.4, 1]}>
        <coneGeometry args={[0.075, 0.26, 16]} />
        <meshStandardMaterial
          color={luminance(accent) < 0.12 ? "#8f1f2b" : accent}
          roughness={0.75}
        />
      </mesh>
      <mesh position={[0, -1.26, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* -------------------------------- headgear -------------------------------- */

function PadTube({
  points,
  radius,
  color,
  finish = "leather",
}: {
  points: P3[];
  radius: number;
  color: string;
  finish?: SurfaceKind;
}) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    [points],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 56, radius, 12, false]} />
      <Surface color={color} finish={finish} metalness={0.04} roughness={0.55} />
    </mesh>
  );
}

function Headgear({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const leather = {
    metalness: Math.min(0.08, metalness * 0.35),
    roughness: THREE.MathUtils.clamp(roughness, 0.44, 0.7),
  };
  const opening = Math.PI * 0.44;

  const edgePoints = (side: number): P3[] =>
    Array.from({ length: 12 }, (_, index) => {
      const theta = 0.52 + (index / 11) * 1.56;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      return [
        side * 0.8 * Math.sin(opening / 2) * sinT,
        0.8 * cosT * 1.05,
        0.8 * Math.cos(opening / 2) * sinT * 1.06,
      ] as P3;
    });

  const browPoints = useMemo<P3[]>(() => {
    const theta = 0.5;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    return Array.from({ length: 15 }, (_, index) => {
      const phi =
        Math.PI / 2 - opening / 2 - 0.04 + (index / 14) * (opening + 0.08);
      return [
        -0.805 * Math.cos(phi) * sinT,
        0.805 * cosT * 1.05,
        0.805 * Math.sin(phi) * sinT * 1.06,
      ] as P3;
    });
  }, [opening]);

  const chinBar = useMemo<P3[]>(
    () => [
      [-0.5, -0.32, 0.36],
      [-0.34, -0.5, 0.44],
      [-0.14, -0.62, 0.49],
      [0.14, -0.62, 0.49],
      [0.34, -0.5, 0.44],
      [0.5, -0.32, 0.36],
    ],
    [],
  );

  return (
    <group position={[0, 0.1, 0]} rotation={[0.06, 0.24, 0]}>
      {/* inner liner */}
      <mesh scale={[1, 1.05, 1.06]}>
        <sphereGeometry
          args={[0.765, 48, 36, Math.PI / 2 + opening / 2, Math.PI * 2 - opening, 0, 2.08]}
        />
        <Dark tone={shade(color, 0.2)} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>

      {/* padded shell */}
      <mesh scale={[1, 1.05, 1.06]}>
        <sphereGeometry
          args={[0.8, 64, 44, Math.PI / 2 + opening / 2, Math.PI * 2 - opening, 0, 2.08]}
        />
        <Surface
          color={color}
          finish="leather"
          {...leather}
          clearcoat={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* forehead cover */}
      <mesh scale={[1, 1.05, 1.06]}>
        <sphereGeometry
          args={[
            0.805,
            48,
            28,
            Math.PI / 2 - opening / 2 - 0.03,
            opening + 0.06,
            0,
            0.52,
          ]}
        />
        <Surface
          color={shade(color, 0.94)}
          finish="leather"
          {...leather}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* padded face opening rim */}
      {[-1, 1].map((side) => (
        <PadTube
          key={side}
          points={edgePoints(side)}
          radius={0.07}
          color={shade(color, 0.95)}
        />
      ))}
      <PadTube points={browPoints} radius={0.08} color={shade(color, 0.97)} />
      <Stitches
        points={browPoints.map(([x, y, z]) => [x, y + 0.05, z + 0.01] as P3)}
        count={24}
        size={0.0055}
        color={shade(color, 0.28)}
      />

      {/* crown ridge */}
      <PadTube
        points={[
          [0, 0.82, 0.22],
          [0, 0.865, 0],
          [0, 0.8, -0.28],
        ]}
        radius={0.045}
        color={shade(color, 0.86)}
      />

      {/* ear pads + vents */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.8, -0.16, 0]}>
          <mesh scale={[0.24, 0.44, 0.52]}>
            <sphereGeometry args={[0.5, 40, 32]} />
            <Surface color={shade(color, 0.9)} finish="leather" {...leather} />
          </mesh>
          <mesh
            position={[side * 0.13, -0.02, 0]}
            rotation={[0, (side * Math.PI) / 2, 0]}
          >
            <circleGeometry args={[0.15, 32]} />
            <Dark tone="#0d0d15" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
          <mesh
            position={[side * 0.135, -0.02, 0]}
            rotation={[0, (side * Math.PI) / 2, 0]}
          >
            <torusGeometry args={[0.15, 0.018, 8, 36]} />
            <Gold />
          </mesh>
          <Rivet position={[side * 0.15, 0.3, 0.16]} scale={0.8} />
        </group>
      ))}

      {/* cheek pads */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.46, -0.4, 0.3]}
          scale={[0.24, 0.3, 0.24]}
          rotation={[0.1, 0, side * 0.15]}
        >
          <sphereGeometry args={[0.5, 36, 28]} />
          <Surface color={color} finish="leather" {...leather} />
        </mesh>
      ))}

      {/* chin bar + cup */}
      <PadTube points={chinBar} radius={0.088} color={shade(color, 0.78)} />
      <PadTube
        points={chinBar.map(([x, y, z]) => [x * 0.99, y - 0.055, z + 0.012] as P3)}
        radius={0.032}
        color={trim === shade(color, 0.42) ? shade(color, 0.55) : trim}
      />
      <mesh position={[0, -0.68, 0.43]} scale={[0.27, 0.16, 0.21]}>
        <sphereGeometry args={[1, 32, 24]} />
        <Surface color={shade(color, 0.88)} finish="leather" {...leather} />
      </mesh>
      <RoundedBox
        args={[0.12, 0.085, 0.055]}
        radius={0.018}
        smoothness={3}
        position={[0, -0.68, 0.62]}
      >
        <Gold />
      </RoundedBox>

      {/* rear lacing */}
      {(
        [
          [-0.15, 0.02, -0.845],
          [0.15, 0.02, -0.845],
          [-0.15, 0.2, -0.82],
          [0.15, 0.2, -0.82],
          [-0.15, 0.38, -0.75],
          [0.15, 0.38, -0.75],
          [-0.15, 0.56, -0.625],
          [0.15, 0.56, -0.625],
        ] as P3[]
      ).map(([x, y, z]) => (
        <Eyelet key={`${x}-${y}`} position={[x, y, z]} rotation={[0, Math.PI, 0]} />
      ))}
      <Laces
        points={[
          [-0.15, 0.04, -0.86],
          [0.15, 0.16, -0.845],
          [-0.15, 0.28, -0.775],
          [0.15, 0.4, -0.765],
          [-0.15, 0.52, -0.665],
        ]}
        radius={0.011}
        color="#2a2a34"
      />
      <Rivet position={[0, 0.62, -0.61]} scale={0.8} />

      {/* forehead badge */}
      <LogoPatch position={[0, 0.56, 0.63]} size={0.2} />
      <Rivet position={[0, 0.3, 0.72]} scale={0.7} />
    </group>
  );
}

/* ------------------------------ shin / chest ------------------------------ */

function Shin({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const leather = {
    metalness: Math.min(0.08, metalness * 0.35),
    roughness: THREE.MathUtils.clamp(roughness, 0.46, 0.72),
  };
  const arc = Math.PI * 0.9;
  const backArc = Math.PI * 0.95;

  return (
    <group position={[0, -0.06, 0]} rotation={[0.03, 0.2, 0]}>
      {/* lining */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.545, 0.395, 1.82, 48, 1, true, -arc / 2 - 0.05, arc + 0.1]} />
        <Dark tone={shade(color, 0.22)} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>

      {/* anatomical plate */}
      <mesh position={[0, 0.12, 0]} scale={[1, 1, 1.08]}>
        <cylinderGeometry args={[0.56, 0.4, 1.78, 64, 1, true, -arc / 2, arc]} />
        <Surface
          color={color}
          finish="leather"
          {...leather}
          clearcoat={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* top + bottom piping */}
      {(
        [
          [1.01, 0.572],
          [-0.77, 0.412],
        ] as Array<[number, number]>
      ).map(([y, radius]) => (
        <mesh key={y} position={[0, y, 0]} scale={[1, 1, 1.08]}>
          <cylinderGeometry args={[radius, radius, 0.075, 64, 1, true, -arc / 2, arc]} />
          <Surface
            color={trim}
            finish="leather"
            metalness={0.04}
            roughness={0.66}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* side trim on the cut edges */}
      {[-1, 1].map((side) => (
        <PadTube
          key={side}
          points={[
            [side * 0.553, 0.98, 0.097],
            [side * 0.5, 0.5, 0.088],
            [side * 0.44, 0.0, 0.078],
            [side * 0.395, -0.6, 0.068],
          ]}
          radius={0.024}
          color={trim}
          finish="leather"
        />
      ))}

      {/* knee cap */}
      <mesh position={[0, 0.9, 0.22]} scale={[0.56, 0.29, 0.42]}>
        <sphereGeometry args={[1, 44, 32]} />
        <Surface color={shade(color, 1.6)} finish="leather" {...leather} />
      </mesh>
      <Stitches
        points={[
          [-0.4, 0.84, 0.4],
          [-0.2, 0.94, 0.52],
          [0.2, 0.94, 0.52],
          [0.4, 0.84, 0.4],
        ]}
        count={16}
        size={0.006}
        color={shade(color, 0.28)}
      />

      {/* raised foam channels */}
      {[-0.2, 0, 0.2].map((x) => (
        <PadTube
          key={x}
          points={[
            [x * 0.9, 0.72, 0.52],
            [x, 0.22, 0.535],
            [x * 0.88, -0.3, 0.51],
            [x * 0.78, -0.66, 0.46],
          ]}
          radius={0.036}
          color={shade(color, 0.84)}
          finish="leather"
        />
      ))}
      <Stitches
        points={[
          [-0.33, 0.55, 0.49],
          [-0.31, 0.0, 0.5],
          [-0.3, -0.56, 0.47],
        ]}
        count={18}
        size={0.0055}
        color={shade(color, 0.3)}
      />
      <Stitches
        points={[
          [0.33, 0.55, 0.49],
          [0.31, 0.0, 0.5],
          [0.3, -0.56, 0.47],
        ]}
        count={18}
        size={0.0055}
        color={shade(color, 0.3)}
      />

      {/* calf straps */}
      {(
        [
          [0.56, 0.545],
          [-0.26, 0.49],
        ] as Array<[number, number]>
      ).map(([y, radius]) => (
        <group key={y}>
          <mesh position={[0, y, 0]} scale={[1, 1, 1.02]}>
            <cylinderGeometry
              args={[radius, radius, 0.13, 56, 1, true, Math.PI - backArc / 2, backArc]}
            />
            <Surface
              color={trim}
              finish="fabric"
              metalness={0.02}
              roughness={0.92}
              side={THREE.DoubleSide}
            />
          </mesh>
          {[-1, 1].map((side) => (
            <RoundedBox
              key={side}
              args={[0.09, 0.14, 0.06]}
              radius={0.02}
              smoothness={3}
              position={[side * (radius * 0.86), y, 0.24]}
              rotation={[0, side * -0.55, 0]}
            >
              <Gold />
            </RoundedBox>
          ))}
        </group>
      ))}

      <LogoPatch position={[0, 0.3, 0.548]} size={0.28} />

      {/* instep flap */}
      <group position={[0, -0.82, 0.22]} rotation={[0.95, 0, 0]}>
        <RoundedBox args={[0.74, 0.13, 0.5]} radius={0.055} smoothness={5}>
          <Surface color={shade(color, 1.35)} finish="leather" {...leather} />
        </RoundedBox>
        <mesh position={[0, 0.075, 0.02]}>
          <boxGeometry args={[0.62, 0.018, 0.4]} />
          <Dark tone={shade(color, 0.32)} />
        </mesh>
        <mesh position={[0, 0.082, 0.02]}>
          <boxGeometry args={[0.1, 0.022, 0.42]} />
          <Surface color={trim} finish="leather" metalness={0.04} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.09, -0.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.05]} />
          <Surface color={trim} finish="leather" metalness={0.04} roughness={0.72} />
        </mesh>
      </group>
    </group>
  );
}

function Chest({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const leather = {
    metalness: Math.min(0.08, metalness * 0.35),
    roughness: THREE.MathUtils.clamp(roughness, 0.4, 0.68),
  };
  const arc = Math.PI * 0.88;
  const segments: Array<{ y: number; top: number; bottom: number }> = [
    { y: -0.52, top: 0.875, bottom: 0.825 },
    { y: 0.02, top: 0.925, bottom: 0.875 },
    { y: 0.56, top: 0.95, bottom: 0.9 },
  ];

  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, 0.02, 0]} scale={[1, 1, 0.64]}>
        <cylinderGeometry args={[0.93, 0.8, 1.62, 48, 1, true, -arc / 2, arc]} />
        <Dark tone={shade(color, 0.22)} roughness={0.9} />
      </mesh>

      {segments.map((segment) => (
        <mesh key={segment.y} position={[0, segment.y, 0]} scale={[1, 1, 0.68]}>
          <cylinderGeometry
            args={[segment.top, segment.bottom, 0.5, 56, 1, true, -arc / 2, arc]}
          />
          <Surface
            color={color}
            finish="leather"
            {...leather}
            clearcoat={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* shoulder straps */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.56, 0.76, -0.08]} rotation={[-0.55, 0, side * 0.2]}>
          <RoundedBox args={[0.26, 0.72, 0.22]} radius={0.09} smoothness={4} position={[0, 0.15, 0]}>
            <Surface color={trim} finish="leather" metalness={0.05} roughness={0.66} />
          </RoundedBox>
          <RoundedBox args={[0.2, 0.1, 0.09]} radius={0.02} smoothness={3} position={[0, -0.1, 0.11]}>
            <Gold />
          </RoundedBox>
        </group>
      ))}

      {/* side closures */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.18, 0.5, 0.16]}
          radius={0.06}
          smoothness={4}
          position={[side * 0.87, -0.12, -0.18]}
          rotation={[0, side * 0.4, 0]}
        >
          <Dark tone={shade(color, 0.28)} roughness={0.85} />
        </RoundedBox>
      ))}

      {/* edge trim */}
      <group rotation={[0, Math.PI / 2 - arc / 2, 0]}>
        <mesh position={[0, 0.81, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.68, 1]}>
          <torusGeometry args={[0.95, 0.024, 8, 64, arc]} />
          <Gold tone={GOLD} roughness={0.4} />
        </mesh>
      </group>

      <LogoPatch position={[0, 0.56, 0.642]} size={0.34} />
      {[-0.52, 0.02].map((y) => (
        <Stitches
          key={y}
          points={circlePoints(0.9, y, 0.68, 20)}
          count={28}
          size={0.0055}
          color={shade(color, 0.28)}
        />
      ))}
    </group>
  );
}

/* ---------------------------------- wraps --------------------------------- */

function Wraps({ color, accent }: MatProps) {
  const trim = trimColor(accent, color);
  const spiral = useMemo(() => {
    const pts: P3[] = [];
    for (let i = 0; i <= 130; i += 1) {
      const t = i / 130;
      const angle = t * Math.PI * 5.4;
      pts.push([-0.34 + t * 0.68, Math.cos(angle) * 0.5, Math.sin(angle) * 0.5]);
    }
    return pts;
  }, []);

  return (
    <group position={[0, 0.28, 0]} rotation={[0.1, -0.28, 0.06]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 56]} />
        <Surface color={color} finish="fabric" metalness={0.01} roughness={0.94} clearcoat={0.05} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.5, 0.032, 10, 56]} />
          <Surface color={shade(color, 0.6)} finish="fabric" metalness={0.01} roughness={0.94} />
        </mesh>
      ))}
      <Laces points={spiral} radius={0.011} color={shade(color, 0.36)} />
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.508, 0.016, 8, 56]} />
        <Gold tone={GOLD} roughness={0.4} />
      </mesh>
      <LogoPatch position={[0, 0.06, 0.512]} size={0.26} />

      {/* hanging tail + closure */}
      <mesh position={[0.44, -0.5, 0.34]} rotation={[0.18, -0.18, 0.16]}>
        <RoundedBox args={[0.3, 0.78, 0.06]} radius={0.02} smoothness={3}>
          <Surface color={color} finish="fabric" metalness={0.01} roughness={0.94} />
        </RoundedBox>
      </mesh>
      <RoundedBox
        args={[0.26, 0.16, 0.04]}
        radius={0.015}
        smoothness={3}
        position={[0.42, -0.84, 0.38]}
        rotation={[0.18, -0.18, 0.16]}
      >
        <Dark tone={trim} roughness={0.92} />
      </RoundedBox>
      <mesh position={[0.56, -0.3, 0.42]} rotation={[0.2, 0.1, 0.1]}>
        <torusGeometry args={[0.12, 0.028, 8, 28]} />
        <Surface color={shade(color, 0.7)} finish="fabric" metalness={0.01} roughness={0.92} />
      </mesh>
      <Rivet position={[-0.12, 0.3, 0.47]} scale={0.8} />
    </group>
  );
}

/* ---------------------------------- bag ----------------------------------- */

function Bag({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const leather = {
    metalness: Math.min(0.08, metalness * 0.35),
    roughness: THREE.MathUtils.clamp(roughness, 0.42, 0.7),
  };
  const seams = [Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4];

  return (
    <group position={[0, 0.02, 0]}>
      <mesh>
        <cylinderGeometry args={[0.62, 0.62, 2.16, 60, 1]} />
        <Surface color={color} finish="leather" {...leather} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 1.1, 0]} scale={[1, 0.28, 1]}>
        <sphereGeometry args={[0.62, 48, 28]} />
        <Surface color={color} finish="leather" {...leather} />
      </mesh>
      <mesh position={[0, -1.1, 0]} scale={[1, 0.28, 1]}>
        <sphereGeometry args={[0.62, 48, 28]} />
        <Surface color={color} finish="leather" {...leather} />
      </mesh>

      {[1.02, -1.02].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0]}>
            <cylinderGeometry args={[0.642, 0.642, 0.2, 60]} />
            <Surface color={shade(color, 0.5)} finish="leather" metalness={0.05} roughness={0.63} />
          </mesh>
          <mesh position={[0, y + (y > 0 ? 0.1 : -0.1), 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.642, 0.018, 8, 64]} />
            <Gold tone={GOLD} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {seams.map((angle) => (
        <Stitches
          key={angle}
          points={Array.from({ length: 8 }, (_, index) => {
            const y = -0.9 + (index / 7) * 1.8;
            return [Math.cos(angle) * 0.624, y, Math.sin(angle) * 0.624] as P3;
          })}
          count={26}
          size={0.006}
          color={shade(color, 0.3)}
        />
      ))}

      {[0.74, -0.74].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.623, 0.007, 6, 64]} />
          <Dark tone={shade(color, 0.32)} />
        </mesh>
      ))}

      <LogoPatch position={[0, 0.18, 0.625]} size={0.4} />

      {/* hanging chains */}
      {[
        [0.3, 0.3],
        [-0.3, 0.3],
        [0.3, -0.3],
        [-0.3, -0.3],
      ].map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          {Array.from({ length: 7 }, (_, index) => (
            <mesh
              key={index}
              position={[0, 1.22 + index * 0.115, 0]}
              rotation={[index % 2 === 0 ? 0 : Math.PI / 2, index % 2 === 0 ? Math.PI / 2 : 0, 0]}
            >
              <torusGeometry args={[0.042, 0.012, 8, 22]} />
              <Gold tone={GOLD} roughness={0.32} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 2.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.024, 10, 36]} />
        <Gold />
      </mesh>
      <mesh position={[0, 2.02, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.1, 24]} />
        <Gold tone={GOLD} roughness={0.34} />
      </mesh>

      {/* top straps */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.15, 1.52, 0]} rotation={[0, 0, side * 0.12]}>
          <boxGeometry args={[0.07, 0.72, 0.16]} />
          <Surface color={trim} finish="leather" metalness={0.04} roughness={0.64} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------- mouthguard ------------------------------- */

function Mouthguard({ color, accent, metalness }: MatProps) {
  const trim = trimColor(accent, color);
  return (
    <group position={[0, 0.08, 0]} rotation={[1.18, 0.16, 0.12]} scale={1.2}>
      <mesh rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.55, 0.17, 22, 72, Math.PI]} />
        <Surface
          color={color}
          finish="gel"
          metalness={Math.min(0.04, metalness * 0.2)}
          roughness={0.18}
          clearcoat={1}
          emissiveIntensity={0.02}
        />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2 - Math.PI * 0.28]}>
        <torusGeometry args={[0.55, 0.205, 20, 64, Math.PI * 0.56]} />
        <Surface
          color={color}
          finish="gel"
          metalness={Math.min(0.04, metalness * 0.2)}
          roughness={0.16}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0, -0.05]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.46, 0.062, 12, 56, Math.PI]} />
        <Dark tone={shade(color, 0.35)} roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.24, 20]} />
        <meshStandardMaterial color="#04040a" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.55, -0.02]}>
        <boxGeometry args={[0.1, 0.12, 0.26]} />
        <Surface color={trim} finish="gel" metalness={0.02} roughness={0.18} clearcoat={1} />
      </mesh>
      {[-1, 1].map((side) => (
        <Rivet key={side} position={[side * 0.63, 0.02, 0.16]} scale={0.75} />
      ))}
    </group>
  );
}

/* ---------------------------------- belt ---------------------------------- */

function Belt({ color, accent, metalness }: MatProps) {
  const trim = trimColor(accent, color);
  const arc = Math.PI * 1.12;
  const radius = 1.04;
  const depth = 0.7;
  const plateZ = radius * depth + 0.04;
  const leather = {
    metalness: Math.min(0.06, metalness * 0.3),
    roughness: 0.56,
  };

  const edgeStitches = useMemo(() => {
    const pts: P3[] = [];
    for (let i = 0; i <= 30; i += 1) {
      const angle = -arc / 2 + (i / 30) * arc;
      pts.push([Math.sin(angle) * (radius + 0.012), 0.2, Math.cos(angle) * (radius + 0.012) * depth]);
    }
    return pts;
  }, [arc]);

  return (
    <group position={[0, 0.05, 0]} rotation={[0.04, -0.12, 0.04]}>
      {/* strap */}
      <mesh position={[0, 0, 0]} scale={[1, 1, depth]}>
        <cylinderGeometry args={[radius, radius, 0.56, 72, 1, true, -arc / 2, arc]} />
        <Surface
          color={color}
          finish="leather"
          {...leather}
          clearcoat={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[1, 1, depth]}>
        <cylinderGeometry args={[radius - 0.02, radius - 0.02, 0.56, 72, 1, true, -arc / 2, arc]} />
        <Dark tone={shade(color, 0.22)} roughness={0.9} />
      </mesh>

      {/* gold edge piping */}
      {[0.27, -0.27].map((y) => (
        <mesh key={y} position={[0, y, 0]} scale={[1, 1, depth]}>
          <cylinderGeometry args={[radius + 0.012, radius + 0.012, 0.028, 72, 1, true, -arc / 2, arc]} />
          <Gold tone={GOLD} roughness={0.38} />
        </mesh>
      ))}
      <Stitches points={edgeStitches} count={54} size={0.006} color={shade(color, 0.3)} />
      <Stitches
        points={edgeStitches.map(([x, , z]) => [x, -0.2, z] as P3)}
        count={54}
        size={0.006}
        color={shade(color, 0.3)}
      />

      {/* center plate */}
      <group position={[0, 0.02, plateZ]}>
        <mesh scale={[0.52, 0.58, 0.075]}>
          <sphereGeometry args={[1, 48, 32]} />
          <Gold />
        </mesh>
        <mesh position={[0, 0, 0.045]} scale={[0.42, 0.47, 0.025]}>
          <sphereGeometry args={[1, 40, 28]} />
          <Dark tone="#141420" roughness={0.55} />
        </mesh>
        <LogoPatch position={[0, 0, 0.085]} size={0.48} />
        {Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          return (
            <Rivet
              key={index}
              position={[Math.cos(angle) * 0.49, Math.sin(angle) * 0.545, 0.03]}
              scale={0.75}
            />
          );
        })}
      </group>

      {/* side plates */}
      {[-1, 1].map((side) =>
        [0.52, 1.0].map((offset) => {
          const angle = side * offset;
          const x = Math.sin(angle) * (radius + 0.01);
          const z = Math.cos(angle) * (radius + 0.01) * depth;
          const scale = offset < 0.7 ? 0.24 : 0.18;
          return (
            <group key={`${side}-${offset}`} position={[x, 0.02, z]} rotation={[0, angle, 0]}>
              <mesh scale={[scale, scale * 1.14, 0.05]}>
                <sphereGeometry args={[1, 32, 24]} />
                <Gold />
              </mesh>
              <mesh position={[0, 0, 0.035]} scale={[scale * 0.68, scale * 0.8, 0.02]}>
                <sphereGeometry args={[1, 24, 18]} />
                <Dark tone="#15151f" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0, 0.05]}>
                <circleGeometry args={[scale * 0.32, 24]} />
                <Gold />
              </mesh>
            </group>
          );
        }),
      )}

      <Rivet position={[0, 0.18, plateZ + 0.06]} scale={0.8} />
      <Rivet position={[0, -0.18, plateZ + 0.06]} scale={0.8} />
      <Rivet position={[0.55, 0.22, plateZ - 0.03]} scale={0.75} />
      <Rivet position={[-0.55, 0.22, plateZ - 0.03]} scale={0.75} />
      <mesh position={[0, -0.02, plateZ - 0.01]}>
        <circleGeometry args={[0.56, 40]} />
        <Surface color={trim} finish="leather" metalness={0.03} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- knee ---------------------------------- */

function Knee({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const leather = {
    metalness: Math.min(0.06, metalness * 0.3),
    roughness: THREE.MathUtils.clamp(roughness, 0.42, 0.7),
  };

  return (
    <group position={[0, 0.08, 0]} rotation={[0.12, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.44, 0.4, 1.32, 48, 1, true]} />
        <Surface
          color={shade(color, 0.4)}
          finish="fabric"
          metalness={0.02}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* patella housing */}
      <mesh position={[0, 0.06, 0.3]} scale={[0.52, 0.62, 0.22]}>
        <sphereGeometry args={[1, 40, 28]} />
        <Surface color={color} finish="leather" {...leather} clearcoat={0.35} />
      </mesh>
      <mesh position={[0, 0.06, 0.44]}>
        <torusGeometry args={[0.245, 0.105, 16, 48]} />
        <Surface color={shade(color, 0.9)} finish="leather" {...leather} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0.43]} scale={[1, 1, 0.62]}>
        <sphereGeometry args={[0.23, 36, 24]} />
        <Surface color={shade(color, 0.8)} finish="leather" {...leather} />
      </mesh>
      <mesh position={[0, 0.06, 0.4]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.35, 0.008, 6, 48]} />
        <Dark tone={shade(color, 0.3)} />
      </mesh>
      <Stitches
        points={circlePoints(0.35, 0.06, 1, 16).map(([x, y]) => [x, y, 0.4] as P3)}
        count={26}
        size={0.0055}
        color={shade(color, 0.28)}
      />

      {/* straps */}
      {[0.54, -0.54].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.98, 1]}>
            <torusGeometry args={[0.435, 0.042, 10, 56]} />
            <Surface color={trim} finish="fabric" metalness={0.02} roughness={0.92} />
          </mesh>
          <RoundedBox
            args={[0.14, 0.11, 0.06]}
            radius={0.02}
            smoothness={3}
            position={[0.3, y, -0.26]}
            rotation={[0, 0.6, 0]}
          >
            <Gold />
          </RoundedBox>
        </group>
      ))}
      <mesh position={[0, 0.06, 0.5]}>
        <circleGeometry args={[0.055, 24]} />
        <Gold />
      </mesh>
    </group>
  );
}

/* ---------------------------------- fan ----------------------------------- */

function Fan({ color, accent }: MatProps) {
  const alpha = 1.02;
  const inner = 0.2;
  const outer = 1.72;
  const segments = 36;
  const trim = trimColor(accent, color);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i += 1) {
      const angle = -alpha + (2 * alpha * i) / segments;
      const depth = i % 2 === 0 ? 0.045 : -0.045;
      positions.push(Math.sin(angle) * inner, Math.cos(angle) * inner, 0);
      positions.push(Math.sin(angle) * outer, Math.cos(angle) * outer, depth);
      uvs.push(0, i / segments, 1, i / segments);
    }
    for (let i = 0; i < segments; i += 1) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const rim = useMemo(() => {
    const pts: P3[] = [];
    for (let i = 0; i <= 36; i += 1) {
      const angle = -alpha + (2 * alpha * i) / 36;
      pts.push([Math.sin(angle) * outer, Math.cos(angle) * outer, i % 2 === 0 ? 0.05 : -0.05]);
    }
    return pts;
  }, []);

  return (
    <group position={[0, 0.35, 0]} rotation={[0.12, -0.12, 0]}>
      <group position={[0, -0.85, 0]}>
        <mesh geometry={geometry}>
          <Surface
            color={color}
            finish="fabric"
            metalness={0.02}
            roughness={0.88}
            side={THREE.DoubleSide}
            clearcoat={0.08}
          />
        </mesh>
        <Laces points={rim} radius={0.012} color={GOLD} metalness={0.9} />

        {Array.from({ length: 9 }, (_, index) => {
          const angle = -alpha + (index / 8) * 2 * alpha;
          const mid = (inner + outer) / 2;
          return (
            <mesh
              key={index}
              position={[Math.sin(angle) * mid, Math.cos(angle) * mid, -0.055]}
              rotation={[0, 0, -angle]}
            >
              <boxGeometry args={[0.022, outer - inner, 0.026]} />
              <meshStandardMaterial color="#b98f3d" metalness={0.85} roughness={0.38} />
            </mesh>
          );
        })}

        {[-1, 1].map((side) => {
          const angle = side * alpha;
          return (
            <mesh
              key={side}
              position={[
                Math.sin(angle) * ((inner + outer) / 2),
                Math.cos(angle) * ((inner + outer) / 2),
                -0.06,
              ]}
              rotation={[0, 0, -angle]}
            >
              <boxGeometry args={[0.055, outer - inner + 0.12, 0.055]} />
              <Surface color={trim} finish="wood" metalness={0.05} roughness={0.5} clearcoat={0.5} />
            </mesh>
          );
        })}

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.12, 28]} />
          <Gold />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <circleGeometry args={[0.05, 24]} />
          <Gold />
        </mesh>

        <mesh>
          <tubeGeometry
            args={[
              new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, -0.08, 0),
                new THREE.Vector3(0.06, -0.3, 0.02),
                new THREE.Vector3(0.02, -0.48, 0),
              ]),
              24,
              0.014,
              6,
              false,
            ]}
          />
          <meshStandardMaterial color={trim} metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0.02, -0.56, 0]} scale={[1, 1.5, 1]}>
          <coneGeometry args={[0.065, 0.2, 14]} />
          <meshStandardMaterial color={trim} metalness={0.25} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------------------------- shoe ---------------------------------- */

function Shoe({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const fabric = {
    metalness: 0.01,
    roughness: THREE.MathUtils.clamp(roughness, 0.7, 0.96),
  };

  return (
    <group position={[0, 0.16, 0]} rotation={[0.08, -1.02, 0]}>
      <RoundedBox
        args={[0.78, 0.14, 2.08]}
        radius={0.06}
        smoothness={4}
        position={[0, -0.68, 0]}
      >
        <meshStandardMaterial color="#0c0c12" metalness={0.05} roughness={0.86} />
      </RoundedBox>
      <RoundedBox
        args={[0.8, 0.035, 2.09]}
        radius={0.015}
        smoothness={3}
        position={[0, -0.6, 0]}
      >
        <Surface color={shade(color, 0.5)} finish="rubber" metalness={0.03} roughness={0.8} />
      </RoundedBox>

      <RoundedBox
        args={[0.7, 0.46, 1.5]}
        radius={0.18}
        smoothness={5}
        position={[0, -0.4, 0.14]}
      >
        <Surface color={color} finish="fabric" {...fabric} clearcoat={0.05} />
      </RoundedBox>
      <mesh position={[0, -0.46, 0.9]} scale={[0.86, 0.5, 0.62]}>
        <sphereGeometry args={[0.42, 36, 28]} />
        <Surface color={shade(color, 0.86)} finish="fabric" {...fabric} />
      </mesh>
      <mesh position={[0, -0.48, 1.02]} scale={[0.72, 0.34, 0.5]}>
        <sphereGeometry args={[0.36, 32, 24]} />
        <Surface color={shade(color, 0.6)} finish="fabric" {...fabric} />
      </mesh>
      <mesh position={[0, -0.44, -0.78]} scale={[0.82, 0.6, 0.55]}>
        <sphereGeometry args={[0.36, 32, 24]} />
        <Surface color={shade(color, 0.9)} finish="fabric" {...fabric} />
      </mesh>

      {/* collar opening */}
      <mesh position={[0, -0.13, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.235, 0.05, 10, 40]} />
        <Surface color={shade(color, 0.5)} finish="fabric" {...fabric} />
      </mesh>
      <mesh position={[0, -0.13, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <Dark tone="#08080e" roughness={0.95} />
      </mesh>

      {/* tongue + elastic gusset */}
      <RoundedBox
        args={[0.3, 0.38, 0.09]}
        radius={0.04}
        smoothness={3}
        position={[0, -0.16, -0.28]}
        rotation={[-0.55, 0, 0]}
      >
        <Surface color={shade(color, 0.55)} finish="fabric" {...fabric} />
      </RoundedBox>
      <mesh position={[0, -0.25, 0.22]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.16, 0.26, 0.03]} />
        <Dark tone={shade(color, 0.32)} roughness={0.9} />
      </mesh>

      {/* gold stripe + stitching */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.352, -0.44, 0.06]}>
          <boxGeometry args={[0.012, 0.075, 1.12]} />
          <Gold tone={GOLD} roughness={0.42} />
        </mesh>
      ))}
      <Stitches
        points={[
          [-0.3, -0.2, 0.52],
          [-0.32, -0.28, 0.2],
          [-0.33, -0.34, -0.2],
          [-0.31, -0.32, -0.55],
        ]}
        count={18}
        size={0.0055}
        color={shade(color, 0.28)}
      />
      <LogoPatch
        position={[0.355, -0.4, -0.42]}
        rotation={[0, Math.PI / 2, 0]}
        size={0.2}
      />
      <mesh position={[-0.36, -0.52, 0.9]}>
        <boxGeometry args={[0.02, 0.08, 0.24]} />
        <Dark tone={trim} />
      </mesh>
    </group>
  );
}

/* --------------------------------- shorts --------------------------------- */

function Shorts({ color, accent, metalness }: MatProps) {
  const trim = trimColor(accent, color);
  return (
    <group position={[0, 0.35, 0]} rotation={[0.06, -0.24, 0]}>
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.64, 0.68, 0.34, 48]} />
        <Surface
          color={shade(color, 0.38)}
          finish="fabric"
          metalness={0.01}
          roughness={0.94}
        />
      </mesh>
      <mesh position={[0, 0.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.645, 0.012, 8, 56]} />
        <Gold tone={GOLD} roughness={0.46} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.35, -0.12, 0]}>
          <mesh scale={[1, 1, 0.74]} rotation={[0, 0, side * 0.07]}>
            <cylinderGeometry args={[0.33, 0.5, 1.15, 48, 1, true]} />
            <Surface
              color={color}
              finish="fabric"
              metalness={0.01}
              roughness={0.93}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, -0.575, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.74, 1]}>
            <torusGeometry args={[0.5, 0.028, 8, 56]} />
            <Gold tone={GOLD} roughness={0.44} />
          </mesh>
          <mesh position={[side * 0.32, 0.05, 0.02]}>
            <boxGeometry args={[0.035, 1.0, 0.06]} />
            <Gold tone={trim} roughness={0.55} />
          </mesh>
          <LogoPatch position={[side * 0.16, 0.1, 0.3]} rotation={[0, side * 0.3, 0]} size={0.2} />
        </group>
      ))}

      {/* drawstring */}
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.58, 0.66]} rotation={[0.1, 0, x > 0 ? 0.08 : -0.08]}>
          <capsuleGeometry args={[0.02, 0.34, 6, 12]} />
          <Gold tone={GOLD} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.63, 0.63]}>
        <torusGeometry args={[0.055, 0.016, 8, 24]} />
        <Gold tone={GOLD} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- mitts --------------------------------- */

function Mitts({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const leather = {
    metalness: Math.min(0.08, metalness * 0.35),
    roughness: THREE.MathUtils.clamp(roughness, 0.4, 0.7),
  };

  return (
    <group position={[0, 0.08, 0]} rotation={[0.05, -0.22, -0.06]}>
      <mesh scale={[1, 1.04, 0.56]}>
        <sphereGeometry args={[0.78, 56, 40]} />
        <Surface color={color} finish="leather" {...leather} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0.06]}>
        <torusGeometry args={[0.75, 0.05, 12, 72]} />
        <Surface color={shade(color, 0.68)} finish="leather" metalness={0.05} roughness={0.6} />
      </mesh>
      <Stitches
        points={circlePoints(0.66, 0.02, 1, 18).map(([x, y, z]) => [x, y, z * 0.55 + 0.36] as P3)}
        count={28}
        size={0.0055}
        color={shade(color, 0.28)}
      />

      {/* target */}
      <mesh position={[0, 0.04, 0.4]}>
        <circleGeometry args={[0.33, 40]} />
        <Surface color={shade(color, 0.55)} finish="leather" metalness={0.05} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.04, 0.415]}>
        <torusGeometry args={[0.28, 0.028, 10, 48]} />
        <Gold />
      </mesh>
      <mesh position={[0, 0.04, 0.42]}>
        <circleGeometry args={[0.11, 28]} />
        <Gold />
      </mesh>
      <mesh position={[0, 0.04, 0.425]}>
        <circleGeometry args={[0.055, 20]} />
        <Dark tone={shade(color, 0.3)} />
      </mesh>

      {/* palm side hand slot */}
      <RoundedBox
        args={[0.42, 0.86, 0.26]}
        radius={0.1}
        smoothness={4}
        position={[0, -0.18, -0.38]}
        rotation={[0.08, 0, 0]}
      >
        <Dark tone={shade(color, 0.3)} roughness={0.88} />
      </RoundedBox>

      {/* wrist strap */}
      <mesh position={[0, -0.62, 0.03]} rotation={[0.16, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.26, 36]} />
        <Surface color={shade(color, 0.42)} finish="leather" metalness={0.04} roughness={0.68} />
      </mesh>
      <RoundedBox
        args={[0.5, 0.16, 0.16]}
        radius={0.04}
        smoothness={3}
        position={[0, -0.63, 0.24]}
        rotation={[0.16, 0, 0]}
      >
        <Dark tone={trim} roughness={0.88} />
      </RoundedBox>
      <RoundedBox
        args={[0.16, 0.12, 0.05]}
        radius={0.02}
        smoothness={3}
        position={[0.16, -0.63, 0.34]}
        rotation={[0.16, 0, 0]}
      >
        <Gold />
      </RoundedBox>
      <LogoPatch position={[0, -0.46, 0.36]} size={0.2} />
    </group>
  );
}

/* --------------------------------- uniform -------------------------------- */

function Uniform({ color, accent, metalness, roughness }: MatProps) {
  const trim = trimColor(accent, color);
  const fabric = {
    metalness: 0.01,
    roughness: THREE.MathUtils.clamp(roughness, 0.78, 0.96),
  };

  return (
    <group position={[0, 0.1, 0]} rotation={[0.04, -0.14, 0]}>
      <RoundedBox args={[1.38, 1.5, 0.5]} radius={0.16} smoothness={5} position={[0, 0.32, 0]}>
        <Surface color={color} finish="fabric" {...fabric} clearcoat={0.04} />
      </RoundedBox>
      <RoundedBox args={[1.34, 0.62, 0.46]} radius={0.12} smoothness={4} position={[0, -0.68, 0]}>
        <Surface color={color} finish="fabric" {...fabric} />
      </RoundedBox>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.9, 0.52, 0]} rotation={[0, 0, side * 0.34]}>
          <mesh>
            <cylinderGeometry args={[0.26, 0.32, 0.92, 36]} />
            <Surface color={color} finish="fabric" {...fabric} />
          </mesh>
          <mesh position={[0, -0.48, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.12, 36]} />
            <Surface color={shade(color, 0.55)} finish="fabric" {...fabric} />
          </mesh>
        </group>
      ))}

      {/* cross-over lapels */}
      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.24, 1.12, 0.09]}
          radius={0.04}
          smoothness={4}
          position={[side * 0.17, 0.52, 0.28]}
          rotation={[0, 0, side * -0.2]}
        >
          <Surface color={shade(color, 0.35)} finish="fabric" metalness={0.02} roughness={0.9} />
        </RoundedBox>
      ))}

      {/* collar */}
      <mesh position={[0, 1.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.06, 10, 40]} />
        <Surface color={shade(color, 0.42)} finish="fabric" metalness={0.02} roughness={0.9} />
      </mesh>

      {/* frog buttons */}
      {[0.18, 0.42, 0.66].map((y) => (
        <group key={y} position={[0.17, y, 0.34]}>
          <mesh>
            <sphereGeometry args={[0.035, 14, 12]} />
            <Gold tone={GOLD} roughness={0.4} />
          </mesh>
          <mesh position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
            <Gold tone={GOLD} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* sash */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.72, 0.75, 0.24, 48]} />
        <Surface color={trim} finish="fabric" metalness={0.02} roughness={0.9} />
      </mesh>
      <mesh position={[0.34, -0.86, 0.6]} rotation={[0.12, 0, 0.12]}>
        <RoundedBox args={[0.24, 0.5, 0.05]} radius={0.02} smoothness={3}>
          <Surface color={trim} finish="fabric" metalness={0.02} roughness={0.9} />
        </RoundedBox>
      </mesh>

      <LogoPatch position={[-0.34, 0.5, 0.265]} rotation={[0, 0, 0]} size={0.22} />
      <Stitches
        points={[
          [-0.5, -0.4, 0.26],
          [0, -0.45, 0.28],
          [0.5, -0.4, 0.26],
        ]}
        count={20}
        size={0.005}
        color={shade(color, 0.35)}
      />
    </group>
  );
}

/* ---------------------------------- root ---------------------------------- */

const layout: Record<
  GearKind,
  { scale: number; position?: P3; rotation?: P3 }
> = {
  glove: { scale: 1 },
  "mma-glove": { scale: 1.12, position: [0, -0.02, 0] },
  staff: { scale: 1 },
  sword: { scale: 1 },
  headgear: { scale: 1.08 },
  shin: { scale: 1 },
  chest: { scale: 1.05 },
  wraps: { scale: 1.12 },
  bag: { scale: 0.95, position: [0, -0.05, 0] },
  mouthguard: { scale: 1.12 },
  belt: { scale: 1.02 },
  knee: { scale: 1.12 },
  fan: { scale: 1 },
  shoe: { scale: 1.14, position: [0, 0.04, 0] },
  shorts: { scale: 1.04 },
  mitts: { scale: 1.08 },
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
    root.current.rotation.z = 0.015 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
  });

  return (
    <group ref={root} scale={scale}>
      <group position={placed.position} rotation={placed.rotation} scale={placed.scale}>
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
