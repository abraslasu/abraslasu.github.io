export const TAU = Math.PI * 2;

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export const randInt = (lo: number, hi: number) => Math.floor(rand(lo, hi + 1));

export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Shortest signed angle from a to b, in (-PI, PI]. */
export function angleDiff(a: number, b: number) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

/** Cheap integer hash → [0, 1). Deterministic, so skin textures stay put. */
export function hash3(x: number, y: number, z: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Smooth value noise in [0, 1). */
export function vnoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash3(xi, yi, seed);
  const b = hash3(xi + 1, yi, seed);
  const c = hash3(xi, yi + 1, seed);
  const d = hash3(xi + 1, yi + 1, seed);
  const top = a + (b - a) * sx;
  const bottom = c + (d - c) * sx;
  return top + (bottom - top) * sy;
}

/** Two octaves of value noise: blobby patches, the shape of koi markings. */
export function blob(x: number, y: number, seed: number) {
  return 0.65 * vnoise(x, y, seed) + 0.35 * vnoise(x * 2.1, y * 2.1, seed + 101);
}

const K1 = 1 / 260;
const K2 = 1 / 310;
const K3 = 1 / 190;

/**
 * Divergence-free drift: the curl of a slowly wandering stream function.
 * No sources or sinks, so it nudges the fish around without piling them up.
 */
export function current(x: number, y: number, t: number, out: { x: number; y: number }) {
  const a = x * K1 + t * 0.07;
  const b = y * K2 - t * 0.05;
  const c = (x + y) * K3 + t * 0.11;
  out.x = -K2 * Math.sin(a) * Math.sin(b) + 0.5 * K3 * Math.cos(c);
  out.y = -K1 * Math.cos(a) * Math.cos(b) - 0.5 * K3 * Math.cos(c);
  return out;
}
