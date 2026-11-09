"use client";

import * as THREE from "three";

export type SurfaceKind = "leather" | "fabric" | "wood" | "rubber" | "gel";

type SurfaceMaps = { bump: THREE.Texture; grain: THREE.Texture };

const cache = new Map<SurfaceKind, SurfaceMaps>();
const SIZE = 256;

function hash(x: number, y: number, seed: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 362437);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function noise2(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x: number, y: number, seed: number, octaves = 4) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += amplitude * noise2(x * frequency, y * frequency, seed + i * 19);
    norm += amplitude;
    frequency *= 2;
    amplitude *= 0.5;
  }
  return value / norm;
}

function sample(kind: SurfaceKind, x: number, y: number) {
  if (kind === "fabric") {
    const weave =
      Math.sin(x * 0.85) * 0.5 + Math.sin(y * 0.85 + 0.6) * 0.5;
    const slub = fbm(x / 24, y / 24, 13, 4);
    return {
      bump: 0.52 + weave * 0.16 + (slub - 0.5) * 0.16,
      grain: 0.93 + weave * 0.035 + (noise2(x / 2, y / 2, 3) - 0.5) * 0.035,
    };
  }

  if (kind === "wood") {
    const fibers = fbm(x / 4.5, y / 95, 31, 5);
    const rings = Math.sin((x + fbm(x / 34, y / 34, 8, 3) * 16) * 0.42);
    return {
      bump: 0.52 + rings * 0.13 + (fibers - 0.5) * 0.38,
      grain: 0.9 + rings * 0.06 + (fibers - 0.5) * 0.12,
    };
  }

  if (kind === "rubber") {
    const tread = noise2(x / 2.6, y / 2.6, 5);
    const broad = fbm(x / 26, y / 26, 11, 3);
    return {
      bump: 0.5 + (tread - 0.5) * 0.3 + (broad - 0.5) * 0.22,
      grain: 0.86 + (tread - 0.5) * 0.06,
    };
  }

  if (kind === "gel") {
    const soft = fbm(x / 30, y / 30, 17, 3);
    return {
      bump: 0.5 + (soft - 0.5) * 0.12,
      grain: 0.96 + (soft - 0.5) * 0.03,
    };
  }

  const broad = fbm(x / 42, y / 42, 21, 4);
  const pore = noise2(x / 2.2, y / 2.2, 9);
  const fine = noise2(x / 1.25, y / 1.25, 33);
  const crease = fbm(x / 12, y / 12, 27, 3);
  const wrinkle = Math.sin(x * 0.035 + y * 0.018 + crease * 7);
  return {
    bump:
      0.5 +
      (broad - 0.5) * 0.55 +
      (pore - 0.5) * 0.4 +
      (fine - 0.5) * 0.26 +
      Math.abs(wrinkle) * 0.08,
    grain:
      0.93 +
      (broad - 0.5) * 0.09 +
      (pore - 0.5) * 0.07 +
      (fine - 0.5) * 0.05,
  };
}

function buildTexture(
  kind: SurfaceKind,
  channel: "bump" | "grain",
  colorSpace: THREE.ColorSpace,
) {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  const image = ctx.createImageData(SIZE, SIZE);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const value = sample(kind, x, y)[channel];
      const level = Math.round(Math.min(255, Math.max(0, value * 255)));
      const index = (y * SIZE + x) * 4;
      image.data[index] = level;
      image.data[index + 1] = level;
      image.data[index + 2] = level;
      image.data[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat.set(2.4, 2.4);
  texture.anisotropy = 4;
  texture.colorSpace = colorSpace;
  return texture;
}

export function getSurfaceMaps(kind: SurfaceKind): SurfaceMaps | null {
  if (typeof document === "undefined") return null;
  const cached = cache.get(kind);
  if (cached) return cached;

  const maps: SurfaceMaps = {
    bump: buildTexture(kind, "bump", THREE.NoColorSpace),
    grain: buildTexture(kind, "grain", THREE.SRGBColorSpace),
  };
  cache.set(kind, maps);
  return maps;
}
