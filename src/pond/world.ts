/**
 * A quiet koi pond. Each koi is a follow-the-leader spine steered by
 * Reynolds-style forces: wander, a lazy circuit around the page, room for
 * the other fish, and a soft no-swim zone over the headline.
 *
 * A drop on the water (a click) sends out rings. The koi nearest the drop
 * bolt away from it; the ones farthest off come over to investigate, like
 * food hitting the surface.
 */
import { angleDiff, clamp, current, rand, randInt, TAU } from './math';

export const KOI_NODES = 16;
/** Seconds a ripple stays on the surface. */
export const RIPPLE_LIFE = 3.6;
/** Calm mode (prefers-reduced-motion): ripples die out sooner, so they stay small. */
export const CALM_RIPPLE_LIFE = 2;
/** At most this many ripples spread at once; a newer drop fades out the oldest. */
export const MAX_RIPPLES = 4;
/** Seconds an evicted ripple takes to fade away. */
export const RIPPLE_FADE = 0.2;
/** Seconds between koi surfacing, nearest to the first tap first. */
export const SURFACE_STAGGER = 0.08;

/** The headline's no-swim ellipse: semi-axes as fractions of the viewport. */
const ZONE_RX = 0.24;
const ZONE_RY = 0.14;

/** Length of the biggest koi for a viewport whose shorter side is minSide. */
const baseLength = (minSide: number) => clamp(minSide * 0.34, 130, 320);

/** How many koi live in the pond; each gets its own shade of blue. */
export const KOI_COUNT = 4;

export interface Koi {
  id: number;
  /** Index into the renderer's blue palette: every koi is a different shade. */
  shade: number;
  /** Seeds the skin pattern. */
  seed: number;
  /** World time this koi surfaced; it fades in for a moment after. */
  born: number;
  length: number;
  /** Spine positions, snout first: [x0, y0, x1, y1, ...]. */
  nodes: Float32Array;
  heading: number;
  speed: number;
  /** Tail-beat phase; drives the body wave in the renderer. */
  phase: number;
  /** Smoothed angular velocity (rad/s). */
  turn: number;
  wander: number;
  /** 0.6 far / dim → 1 near / bright. */
  depth: number;
  orbitDir: 1 | -1;
  orbitRadius: number;
  /** Where the last drop fell, and how long this koi stays interested in it. */
  foodX: number;
  foodY: number;
  foodUntil: number;
  /** 0 calm → 1 just startled; fades on its own. */
  startle: number;
}

export interface Ripple {
  x: number;
  y: number;
  t0: number;
  /** Seconds it spreads for; shorter in calm mode. */
  life: number;
  /** Fewer, smaller rings, for prefers-reduced-motion. */
  calm: boolean;
  /** When a newer drop pushed this one out (Infinity while it spreads freely). */
  fadeStart: number;
}

export interface WorldEvent {
  kind: 'drop';
  x: number;
  y: number;
}

export class World {
  width = 0;
  height = 0;
  time = 0;
  started = false;
  koi: Koi[] = [];
  ripples: Ripple[] = [];
  events: WorldEvent[] = [];
  /**
   * Calm mode, for visitors who asked their system for reduced motion: the
   * koi swim slower and never dart, and drops make small, short ripples.
   */
  calm = false;

  private tmp = { x: 0, y: 0 };

  constructor(private count = KOI_COUNT) {}

  resize(width: number, height: number) {
    const oldW = this.width;
    const oldH = this.height;
    this.width = width;
    this.height = height;
    if (!this.started || oldW < 1 || oldH < 1) return;

    // Keep the scene proportional: positions follow the viewport, lengths
    // follow the shorter side, so the pond looks the same at any size.
    const sx = width / oldW;
    const sy = height / oldH;
    const minOld = Math.min(oldW, oldH);
    const minNew = Math.min(width, height);
    const sl = baseLength(minNew) / baseLength(minOld);

    for (const k of this.koi) {
      const n = k.nodes;
      // Remember each joint's direction, then re-space the spine at the new length.
      const dirs: number[] = [];
      for (let i = 1; i < KOI_NODES; i++) {
        dirs.push(Math.atan2(n[i * 2 + 1] - n[(i - 1) * 2 + 1], n[i * 2] - n[(i - 1) * 2]));
      }
      k.length *= sl;
      const seg = k.length / (KOI_NODES - 1);
      n[0] = clamp(n[0] * sx, -k.length, width + k.length);
      n[1] = clamp(n[1] * sy, -k.length, height + k.length);
      for (let i = 1; i < KOI_NODES; i++) {
        n[i * 2] = n[(i - 1) * 2] + Math.cos(dirs[i - 1]) * seg;
        n[i * 2 + 1] = n[(i - 1) * 2 + 1] + Math.sin(dirs[i - 1]) * seg;
      }
      k.orbitRadius *= minNew / minOld;
      k.foodX *= sx;
      k.foodY *= sy;
    }
    for (const r of this.ripples) {
      r.x *= sx;
      r.y *= sy;
    }
  }

  /** First click at (x, y): the koi surface around the page, in a wave outward from the tap. */
  start(x = this.width / 2, y = this.height / 2) {
    if (this.started) return;
    this.started = true;
    this.seed(x, y);
  }

  private seed(tapX: number, tapY: number) {
    const { width: W, height: H } = this;
    const minSide = Math.min(W, H);
    const count = this.count;

    // Shuffled shades so no two koi share one.
    const shades = Array.from({ length: count }, (_, i) => i % KOI_COUNT);
    for (let i = shades.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [shades[i], shades[j]] = [shades[j], shades[i]];
    }

    this.koi = [];
    for (let i = 0; i < count; i++) {
      const size = rand(0.6, 1);
      const length = baseLength(minSide) * size;
      // Spread around the headline, each in its own sector, heading sideways.
      const a = ((i + rand(0.2, 0.8)) / count) * TAU;
      const rx = W * rand(0.28, 0.4);
      const ry = H * rand(0.26, 0.38);
      const x = clamp(W / 2 + Math.cos(a) * rx, length * 0.6, W - length * 0.6);
      const y = clamp(H / 2 + Math.sin(a) * ry, length * 0.4, H - length * 0.4);
      const heading = (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.6, 0.6);
      const nodes = new Float32Array(KOI_NODES * 2);
      const seg = length / (KOI_NODES - 1);
      for (let n = 0; n < KOI_NODES; n++) {
        nodes[n * 2] = x - Math.cos(heading) * seg * n;
        nodes[n * 2 + 1] = y - Math.sin(heading) * seg * n;
      }
      this.koi.push({
        id: i + 1,
        shade: shades[i],
        seed: randInt(1, 100000),
        born: this.time,
        length,
        nodes,
        heading,
        speed: 16 + length * 0.06,
        phase: rand(0, TAU),
        turn: 0,
        wander: 0,
        depth: 0.6 + 0.4 * size,
        orbitDir: i % 2 === 0 ? 1 : -1,
        orbitRadius: minSide * rand(0.26, 0.42),
        foodX: 0,
        foodY: 0,
        foodUntil: 0,
        startle: 0,
      });
    }
    // Surface nearest-first, so the wave of koi starts where the tap landed.
    const ranked = this.koi
      .map((k) => ({ k, d: Math.hypot(k.nodes[0] - tapX, k.nodes[1] - tapY) }))
      .sort((a, b) => a.d - b.d);
    ranked.forEach(({ k }, rank) => (k.born = this.time + rank * SURFACE_STAGGER));
    // Smaller (farther) koi draw first so the big ones swim over them.
    this.koi.sort((a, b) => a.length - b.length);
  }

  /** A drop hits the surface at (x, y). */
  drop(x: number, y: number) {
    this.events.push({ kind: 'drop', x, y });
    // Keep at most MAX_RIPPLES spreading: rapid taps fade out the oldest
    // instead of piling rings on top of each other.
    let live = 0;
    for (const r of this.ripples) if (r.fadeStart === Infinity) live++;
    for (const r of this.ripples) {
      if (live < MAX_RIPPLES) break;
      if (r.fadeStart === Infinity) {
        r.fadeStart = this.time;
        live--;
      }
    }
    this.ripples.push({
      x,
      y,
      t0: this.time,
      life: this.calm ? CALM_RIPPLE_LIFE : RIPPLE_LIFE,
      calm: this.calm,
      fadeStart: Infinity,
    });

    // The nearer half of the pond bolts away from the drop; the farther half
    // comes over to see what fell in.
    const byDistance = this.koi
      .map((k) => ({ k, d: Math.hypot(k.nodes[0] - x, k.nodes[1] - y) }))
      .sort((a, b) => a.d - b.d);
    const nearCount = Math.ceil(byDistance.length / 2);
    // Koi coming to look stop at the edge of the headline, never on top of it.
    const food = this.outsideHeadline(x, y);
    byDistance.forEach(({ k, d }, i) => {
      k.foodX = x;
      k.foodY = y;
      if (i < nearCount) {
        // Closer drops startle harder, but everyone in the near half bolts.
        // In calm mode they only drift away, without a burst of speed.
        const startle = 0.85 + 0.15 * clamp(1 - d / (Math.min(this.width, this.height) * 0.5), 0, 1);
        k.startle = Math.max(k.startle, this.calm ? startle * 0.25 : startle);
        k.foodUntil = 0;
      } else {
        k.startle = 0;
        k.foodX = food.x;
        k.foodY = food.y;
        k.foodUntil = this.time + rand(4, 7);
      }
    });
  }

  /** Push a point inside the headline ellipse out to just past its edge. */
  private outsideHeadline(x: number, y: number) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const ex = (x - cx) / (this.width * ZONE_RX);
    const ey = (y - cy) / (this.height * ZONE_RY);
    const e = Math.sqrt(ex * ex + ey * ey);
    if (e >= 1) return { x, y };
    if (e < 1e-3) return { x: cx, y: cy + this.height * ZONE_RY * 1.15 };
    const k = 1.15 / e;
    return { x: cx + (x - cx) * k, y: cy + (y - cy) * k };
  }

  step(dt: number) {
    this.time += dt;
    this.stepKoi(dt);
    // Drop ripples that have spread out or finished fading, in place.
    let keep = 0;
    for (const r of this.ripples) {
      if (this.time - r.t0 <= r.life && this.time - r.fadeStart <= RIPPLE_FADE) this.ripples[keep++] = r;
    }
    this.ripples.length = keep;
  }

  private stepKoi(dt: number) {
    const { koi, width: W, height: H, time } = this;
    const minSide = Math.min(W, H);
    const cxW = W / 2;
    const cyW = H / 2;
    const cur = this.tmp;

    for (const k of koi) {
      const L = k.length;
      const nodes = k.nodes;
      const hx = nodes[0];
      const hy = nodes[1];

      // Momentum.
      let dx = Math.cos(k.heading);
      let dy = Math.sin(k.heading);

      // Wander: a slowly drifting offset ahead of the snout.
      k.wander = clamp(k.wander + (Math.random() - 0.5) * dt * 2.6, -1.2, 1.2);
      dx += Math.cos(k.heading + k.wander) * 0.5;
      dy += Math.sin(k.heading + k.wander) * 0.5;

      const feeding = time < k.foodUntil;
      let closing = 0;
      if (feeding) {
        // Head for the drop; once the snout is there, nibble and lose interest.
        const tx = k.foodX - hx;
        const ty = k.foodY - hy;
        const d = Math.hypot(tx, ty) || 1;
        const pull = this.calm ? 1.7 : 2.2;
        dx += (tx / d) * pull;
        dy += (ty / d) * pull;
        closing = clamp(1 - d / (L * 0.9), 0, 1);
        if (d < L * 0.14) k.foodUntil = Math.min(k.foodUntil, time + 0.5);
      } else {
        // Patrol: a lazy circuit around the page.
        const rx = (hx - cxW) / (W / minSide);
        const ry = hy - cyW;
        const r = Math.hypot(rx, ry) || 1;
        const radius = k.orbitRadius * (1 + 0.18 * Math.sin(time * 0.04 + k.id));
        const radial = clamp((radius - r) / radius, -1, 1);
        dx += ((-ry / r) * k.orbitDir + (rx / r) * radial * 0.9) * 0.4;
        dy += ((rx / r) * k.orbitDir + (ry / r) * radial * 0.9) * 0.4;
      }

      if (k.startle > 0.02) {
        const ax = hx - k.foodX;
        const ay = hy - k.foodY;
        const d = Math.hypot(ax, ay) || 1;
        const push = this.calm ? 4 : 3;
        dx += (ax / d) * push * k.startle;
        dy += (ay / d) * push * k.startle;
        k.startle *= Math.exp(-dt * 0.7);
      }

      // Give the other koi room.
      for (const other of koi) {
        if (other === k) continue;
        for (let n = 0; n < KOI_NODES; n += 3) {
          const ox = hx - other.nodes[n * 2];
          const oy = hy - other.nodes[n * 2 + 1];
          const d = Math.hypot(ox, oy);
          const range = (L + other.length) * 0.38;
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 2.6;
            dx += (ox / d) * w;
            dy += (oy / d) * w;
          }
        }
      }

      // Keep the headline clear: an elliptical no-swim zone that pushes
      // already at its edge and harder than any pull toward a drop.
      const ex = (hx - cxW) / (W * ZONE_RX);
      const ey = (hy - cyW) / (H * ZONE_RY);
      const e2 = ex * ex + ey * ey;
      if (e2 < 1) {
        const e = Math.sqrt(e2) || 1e-3;
        const w = 0.8 + 2.8 * (1 - e);
        dx += (ex / e) * w;
        dy += (ey / e) * w;
      }

      // Turn back once the snout leaves the frame.
      const over = Math.max(-hx, hx - W, -hy, hy - H);
      if (over > -L * 0.05) {
        const w = clamp((over + L * 0.05) / (L * 0.35), 0, 1) * 3.5;
        const toX = cxW - hx;
        const toY = cyW - hy;
        const d = Math.hypot(toX, toY) || 1;
        dx += (toX / d) * w;
        dy += (toY / d) * w;
      }

      // Ambient drift.
      current(hx, hy, time, cur);
      dx += cur.x * 40;
      dy += cur.y * 40;

      const desired = Math.atan2(dy, dx);
      // Koi can't pivot on the spot: the turning circle grows with speed.
      let alert = feeding ? 1.4 + closing : k.startle > 0.3 ? 1.6 : 0.75;
      // Calm koi turn in wide, unhurried arcs.
      if (this.calm) alert = Math.min(alert, 0.8);
      const agility = Math.min(alert, k.speed / (L * 0.2));
      const maxTurn = agility * dt;
      const turned = clamp(angleDiff(k.heading, desired), -maxTurn, maxTurn);
      k.heading += turned;
      k.turn += (turned / dt - k.turn) * Math.min(1, dt * 3);

      let targetSpeed: number;
      if (this.calm) {
        // Slower, and never a dash: approach at a stroll, drift away at cruise.
        const cruise = (16 + L * 0.06) * 0.6;
        targetSpeed = feeding ? cruise * (2 - closing * 0.8) : cruise;
      } else {
        const cruise = 16 + L * 0.06;
        targetSpeed = feeding ? cruise * (3.4 - closing * 1.6) : k.startle > 0.3 ? cruise * 3.2 : cruise;
      }
      k.speed += (targetSpeed - k.speed) * Math.min(1, dt * (this.calm ? 0.8 : 1.6));
      k.phase += dt * (1.8 + k.speed / 28);

      nodes[0] += Math.cos(k.heading) * k.speed * dt;
      nodes[1] += Math.sin(k.heading) * k.speed * dt;

      // Follow-the-leader spine with a stiffness limit per joint.
      const seg = L / (KOI_NODES - 1);
      const maxBend = 0.2;
      let prevAngle = k.heading + Math.PI;
      for (let n = 1; n < KOI_NODES; n++) {
        const px = nodes[(n - 1) * 2];
        const py = nodes[(n - 1) * 2 + 1];
        let angle = Math.atan2(nodes[n * 2 + 1] - py, nodes[n * 2] - px);
        angle = prevAngle + clamp(angleDiff(prevAngle, angle), -maxBend, maxBend);
        nodes[n * 2] = px + Math.cos(angle) * seg;
        nodes[n * 2 + 1] = py + Math.sin(angle) * seg;
        prevAngle = angle;
      }
    }
  }
}
