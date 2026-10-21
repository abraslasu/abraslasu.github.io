/**
 * Draws the pond as a grid of ASCII cells on a pale blue surface:
 *   1. a faint cell grid
 *   2. shadows the koi cast on the pond floor
 *   3. a wake field that spreads where the koi swim, lighting cells white
 *   4. koi rasterised cell by cell with supersampled edges: colour blocks
 *      shaded by the light, glyph texture, patches of hi (red) and sumi (black)
 *   5. the rings of every drop, drawn as glyph circles over everything
 *
 * Built to stay smooth on phones. Safari draws canvas text slowly, so every
 * glyph is drawn once, per ink, into an atlas and then copied with
 * drawImage; no text is drawn per frame. Colours come from small
 * precomputed tables and draw calls are batched by style and by
 * transparency level, so a frame switches styles a few dozen times rather
 * than thousands. All ripples add into one per-cell field, so overlapping
 * rings cost no more than a single one.
 */
import { blob, clamp, hash3, smoothstep, TAU } from './math';
import { KOI_NODES, RIPPLE_FADE, RIPPLE_LIFE, type Koi, type Ripple, type World } from './world';

export const POND_BLUE = '#d7e8f4';

const ALPHA_LEVELS = 6;

// Skin paints: four blues, one per koi, each with a lighter patch tone; then
// the orange of the tail and dorsal fin.
const BLUES: [number, number, number][] = [
  [38, 70, 120],
  [58, 104, 160],
  [84, 138, 190],
  [116, 166, 212],
];
const PAINT_ORANGE = BLUES.length * 2;
const PAINT_RGB: [number, number, number][] = [
  ...BLUES.flatMap((c): [number, number, number][] => [c, [c[0] * 1.2 + 14, c[1] * 1.16 + 12, c[2] * 1.08 + 8]]),
  [236, 126, 48],
];
/** Seconds a koi takes to fade in after surfacing. */
const FADE_IN = 1.2;

// Sparse glyphs on bright skin, dense glyphs in shadow.
const SKIN_RAMP = ':;t%SX8#@';
const FIN_GLYPHS = '%;tS:';
const EDGE_HEAVY = ':;';
const EDGE_LIGHT = ".',`";

// ── glyph atlas ─────────────────────────────────────────────────────────
// Every character the pond uses, drawn once per ink into an offscreen atlas.
const GLYPHS = ":;t%SX8#@.',`o|-/\\·*";
const GLYPH_COUNT = GLYPHS.length;
const glyphIndices = (chars: string) => [...chars].map((ch) => GLYPHS.indexOf(ch));
const SKIN_IDX = glyphIndices(SKIN_RAMP);
const FIN_IDX = glyphIndices(FIN_GLYPHS);
const EDGE_HEAVY_IDX = glyphIndices(EDGE_HEAVY);
const EDGE_LIGHT_IDX = glyphIndices(EDGE_LIGHT);
const G_EYE = GLYPHS.indexOf('o');
const G_VBAR = GLYPHS.indexOf('|');
const G_HBAR = GLYPHS.indexOf('-');
const G_SLASH = GLYPHS.indexOf('/');
const G_BACKSLASH = GLYPHS.indexOf('\\');
const G_DOT = GLYPHS.indexOf('·');
const G_PERIOD = GLYPHS.indexOf('.');
const G_STAR = GLYPHS.indexOf('*');
const G_TICK = GLYPHS.indexOf('`');
const G_QUOTE = GLYPHS.indexOf("'");

// Inks (atlas rows): the glyph colour of each paint, the edge colour of each
// paint, then the eye, white highlights, barbels and ripple crests.
const PAINT_COUNT = PAINT_RGB.length;
const INK_KOI = 0;
const INK_EDGE = PAINT_COUNT;
const INK_EYE = PAINT_COUNT * 2;
const INK_WHITE = INK_EYE + 1;
const INK_BARBEL = INK_EYE + 2;
const INK_RIPPLE = INK_EYE + 3;
const INKS: string[] = [
  ...PAINT_RGB.map(([r, g, b], p) =>
    p === PAINT_ORANGE ? rgb(r * 0.55, g * 0.45, b * 0.4) : rgb(r * 1.45 + 30, g * 1.35 + 30, b * 1.2 + 30),
  ),
  ...PAINT_RGB.map(([r, g, b]) => rgb(r * 0.9, g * 0.9, b * 0.9)),
  rgb(28, 30, 36),
  rgb(255, 255, 255),
  rgb(46, 48, 56),
  rgb(52, 104, 160),
];

/** Glyph transparency is quantised to this many levels, one batch each. */
const GLYPH_ALPHA_LEVELS = 8;

// Skin blocks: per paint, solid or fin, in a few light levels, precomputed.
const BLOCK_LEVELS = 12;
const LEVEL_MIN = 0.4;
const LEVEL_SPAN = 0.75;
const BLOCK_STYLES: string[] = [];
for (let p = 0; p < PAINT_COUNT; p++) {
  const [r, g, b] = PAINT_RGB[p];
  for (let fin = 0; fin < 2; fin++) {
    const alpha = fin ? (p === PAINT_ORANGE ? 0.85 : 0.6) : 1;
    for (let step = 0; step < BLOCK_LEVELS; step++) {
      const level = LEVEL_MIN + (step / (BLOCK_LEVELS - 1)) * LEVEL_SPAN;
      BLOCK_STYLES.push(rgb(r * level, g * level, b * level, alpha));
    }
  }
}

const FLAG_BODY = 1;
const FLAG_EDGE = 2;
const FLAG_FIN = 3;
const FLAG_EYE = 4;
const FLAG_DORSAL = 5;

// Sub-cell sample offsets for anti-aliased silhouettes.
const SUBSAMPLES = [0.25, 0.3, 0.75, 0.3, 0.25, 0.72, 0.75, 0.72];

/** Top-down half-width at s ∈ [0, 1] (snout → tail tip), as a fraction of length. */
function koiHalfWidth(s: number) {
  if (s < 0.1) return 0.105 * Math.pow(Math.sin(((s / 0.1) * Math.PI) / 2), 0.55);
  if (s < 0.38) return 0.105 + 0.03 * smoothstep(0.1, 0.38, s);
  if (s < 0.8) return 0.03 + 0.105 * Math.pow(1 - (s - 0.38) / 0.42, 1.15);
  if (s < 0.86) return 0.03 - (0.008 * (s - 0.8)) / 0.06;
  // Caudal fin: fans out into a soft fork.
  const k = (s - 0.86) / 0.14;
  return 0.022 + 0.1 * Math.pow(k, 0.8);
}

// Fins as fractions of length: leading root, trailing root, tip, reach.
const PECTORAL: [number, number, number, number] = [0.13, 0.3, 0.37, 0.17];
const PELVIC: [number, number, number, number] = [0.5, 0.58, 0.62, 0.07];
const EYE: [number, number] = [0.05, 0.1];

function inTriangle(
  px: number, py: number,
  ax: number, ay: number, bx: number, by: number, cx: number, cy: number,
) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/** Which paint covers a body point: s along (0 snout → 1 tail), v across (-1 … 1). */
function paintOf(shade: number, s: number, v: number, seed: number) {
  // Soft lighter patches, like light playing on the scales.
  return shade * 2 + (blob(s * 3.6, v * 1.4, seed) > 0.56 ? 1 : 0);
}

function rgb(r: number, g: number, b: number, a?: number) {
  const R = Math.round(clamp(r, 0, 255));
  const G = Math.round(clamp(g, 0, 255));
  const B = Math.round(clamp(b, 0, 255));
  return a === undefined ? `rgb(${R},${G},${B})` : `rgba(${R},${G},${B},${a.toFixed(3)})`;
}

export class AsciiPond {
  private ctx: CanvasRenderingContext2D;
  private bg: HTMLCanvasElement;
  private dpr = 1;
  private width = 0;
  private height = 0;
  private cw = 12;
  private ch = 18;
  private cols = 0;
  private rows = 0;
  private fontFamily = 'ui-monospace, Menlo, monospace';

  private atlas: HTMLCanvasElement;
  private atlasStrideX = 1;
  private atlasStrideY = 1;
  /** Fewer supersamples per cell on the lowest quality level. */
  private subsampleLength = SUBSAMPLES.length;

  // Per-frame draw batches, reused so a frame allocates nothing.
  private blockBatches: number[][] = BLOCK_STYLES.map(() => []);
  private koiGlyphs: number[][] = Array.from({ length: GLYPH_ALPHA_LEVELS }, () => []);
  private waterGlyphs: number[][] = Array.from({ length: GLYPH_ALPHA_LEVELS }, () => []);
  private wakeBatches: number[][] = Array.from({ length: ALPHA_LEVELS }, () => []);

  // All ripples sum into one field; each cell keeps the direction of its strongest ring.
  private rippleW = new Float32Array(0);
  private rippleBest = new Float32Array(0);
  private rippleDx = new Float32Array(0);
  private rippleDy = new Float32Array(0);
  private rippleStamp = new Uint32Array(0);
  private rippleCells: number[] = [];
  private frameId = 0;

  private energy = new Float32Array(0);
  private energyTmp = new Float32Array(0);
  private wakeStyles: string[] = [];

  private koiFlag = new Uint8Array(0);
  private koiShade = new Float32Array(0);
  private koiPaint = new Uint8Array(0);
  private koiKey = new Uint32Array(0);
  private koiDepth = new Float32Array(0);
  private koiAlpha = new Float32Array(0);
  private koiShadow = new Uint8Array(0);
  private spine = new Float32Array(KOI_NODES * 2);
  private arc = new Float32Array(KOI_NODES);
  private arcTotal = 1;
  private koiSeed = 0;
  private koiTone = 0;
  private finTipLeft = 0;
  private finTipRight = 0;
  // Scratch outputs of sampleKoi(), to avoid allocating per sample.
  private hitFlag = 0;
  private hitShade = 0;
  private hitPaint = 0;
  private hitDist = 0;
  private hitS = 0;
  private hitV = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    this.bg = document.createElement('canvas');
    this.atlas = document.createElement('canvas');
    for (let l = 0; l < ALPHA_LEVELS; l++) {
      this.wakeStyles.push(`rgba(255,255,255,${(((l + 1) / ALPHA_LEVELS) * 0.9).toFixed(3)})`);
    }
  }

  setFontFamily(family: string) {
    if (family) this.fontFamily = family;
  }

  /** Lowest quality: half the supersamples per cell. */
  setLowDetail(low: boolean) {
    this.subsampleLength = low ? SUBSAMPLES.length / 2 : SUBSAMPLES.length;
  }

  /** Redraw the atlas, e.g. once a webfont has loaded. */
  refreshGlyphs() {
    if (this.cols > 0) this.buildAtlas();
  }

  resize(width: number, height: number, dpr: number) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.cw = clamp(Math.round(width / 124), 8, 13);
    this.ch = Math.round(this.cw * 1.45);
    this.cols = Math.ceil(width / this.cw);
    this.rows = Math.ceil(height / this.ch);

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.bg.width = this.canvas.width;
    this.bg.height = this.canvas.height;

    const n = this.cols * this.rows;
    this.energy = new Float32Array(n);
    this.energyTmp = new Float32Array(n);
    this.koiFlag = new Uint8Array(n);
    this.koiShade = new Float32Array(n);
    this.koiPaint = new Uint8Array(n);
    this.koiKey = new Uint32Array(n);
    this.koiDepth = new Float32Array(n);
    this.koiAlpha = new Float32Array(n);
    this.koiShadow = new Uint8Array(n);
    this.rippleW = new Float32Array(n);
    this.rippleBest = new Float32Array(n);
    this.rippleDx = new Float32Array(n);
    this.rippleDy = new Float32Array(n);
    this.rippleStamp = new Uint32Array(n);
    this.paintBackground();
    this.buildAtlas();
  }

  /** Draw every glyph in every ink once, at device resolution. */
  private buildAtlas() {
    const { atlas, dpr, cw, ch } = this;
    this.atlasStrideX = Math.ceil(cw * dpr) + 2;
    this.atlasStrideY = Math.ceil(ch * dpr) + 2;
    atlas.width = this.atlasStrideX * GLYPH_COUNT;
    atlas.height = this.atlasStrideY * INKS.length;
    const g = atlas.getContext('2d');
    if (!g) return;
    g.clearRect(0, 0, atlas.width, atlas.height);
    g.font = `600 ${Math.round(ch * 0.74)}px ${this.fontFamily}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (let ink = 0; ink < INKS.length; ink++) {
      g.fillStyle = INKS[ink];
      for (let gl = 0; gl < GLYPH_COUNT; gl++) {
        g.setTransform(dpr, 0, 0, dpr, gl * this.atlasStrideX, ink * this.atlasStrideY);
        g.fillText(GLYPHS[gl], cw / 2, ch / 2 + 1);
      }
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
  }

  private paintBackground() {
    const g = this.bg.getContext('2d');
    if (!g) return;
    const { width: W, height: H, dpr, cw, ch } = this;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = POND_BLUE;
    g.fillRect(0, 0, W, H);
    // Faint cell grid, snapped to device pixels.
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.strokeStyle = 'rgba(40,70,110,0.06)';
    g.lineWidth = 1;
    g.beginPath();
    for (let c = 0; c <= Math.ceil(W / cw); c++) {
      const x = Math.round(c * cw * dpr) + 0.5;
      g.moveTo(x, 0);
      g.lineTo(x, H * dpr);
    }
    for (let r = 0; r <= Math.ceil(H / ch); r++) {
      const y = Math.round(r * ch * dpr) + 0.5;
      g.moveTo(0, y);
      g.lineTo(W * dpr, y);
    }
    g.stroke();
  }

  /** The still surface, before the first drop. */
  drawEmpty() {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.bg, 0, 0);
  }

  render(world: World, dt: number) {
    const { ctx, dpr, cols } = this;
    if (cols === 0) return;
    const t = world.time;

    this.consumeEvents(world);
    this.rasterizeKoi(world.koi, t);
    this.depositWake(world);
    this.diffuse(dt);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.bg, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.drawShadows();
    this.drawWake();
    this.drawKoi(t);
    this.drawBarbels(world.koi, t);
    this.drawGlyphs(this.koiGlyphs);
    this.drawRipples(world.ripples, t);
    this.drawGlyphs(this.waterGlyphs);
  }

  // ── simulation → field ──────────────────────────────────────────────

  private cellIndex(x: number, y: number) {
    const c = Math.floor(x / this.cw);
    const r = Math.floor(y / this.ch);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
    return r * this.cols + c;
  }

  private stamp(field: Float32Array, x: number, y: number, radius: number, amount: number) {
    const c0 = Math.floor(x / this.cw);
    const r0 = Math.floor(y / this.ch);
    for (let r = r0 - radius; r <= r0 + radius; r++) {
      for (let c = c0 - radius; c <= c0 + radius; c++) {
        if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) continue;
        const d = Math.hypot(c - c0, (r - r0) * 1.4);
        if (d > radius + 0.5) continue;
        const i = r * this.cols + c;
        field[i] = Math.min(1.6, field[i] + amount * (1 - d / (radius + 1)));
      }
    }
  }

  private consumeEvents(world: World) {
    for (const e of world.events) this.stamp(this.energy, e.x, e.y, 3, 1.3);
    world.events.length = 0;
  }

  private depositWake(world: World) {
    const { energy } = this;
    for (const k of world.koi) {
      // The tail sweeps the most water.
      for (let n = KOI_NODES - 5; n < KOI_NODES; n++) {
        const i = this.cellIndex(k.nodes[n * 2], k.nodes[n * 2 + 1]);
        if (i >= 0) energy[i] = Math.min(1.6, energy[i] + 0.04 + k.speed * 0.001);
      }
    }
  }

  /** Blur + decay so wakes spread out and fade. */
  private diffuse(dt: number) {
    const { cols, rows, energy, energyTmp: tmp } = this;
    const decay = Math.exp(-dt * 1.6);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const l = c > 0 ? energy[i - 1] : energy[i];
        const rt = c < cols - 1 ? energy[i + 1] : energy[i];
        const u = r > 0 ? energy[i - cols] : energy[i];
        const d = r < rows - 1 ? energy[i + cols] : energy[i];
        tmp[i] = (energy[i] * 4 + l + rt + u + d) * 0.125 * decay;
      }
    }
    this.energy = tmp;
    this.energyTmp = energy;
  }

  // ── koi ─────────────────────────────────────────────────────────────

  /**
   * Classify one point against the current koi (spine/arc already built).
   * Body coordinates: s along the spine (0 snout → 1 tail), v across it.
   * Writes hit* fields and returns whether the point is on the fish.
   */
  private sampleKoi(px: number, py: number, L: number) {
    const { spine, arc } = this;
    const N = KOI_NODES;
    let best = Infinity;
    let bestS = 0;
    let bestSign = 1;
    let bestNx = 0;
    let bestNy = 0;
    for (let k = 0; k < N - 1; k++) {
      const ax = spine[k * 2];
      const ay = spine[k * 2 + 1];
      const sx = spine[(k + 1) * 2] - ax;
      const sy = spine[(k + 1) * 2 + 1] - ay;
      const len2 = sx * sx + sy * sy || 1;
      const u = clamp(((px - ax) * sx + (py - ay) * sy) / len2, 0, 1);
      const qx = ax + sx * u;
      const qy = ay + sy * u;
      const d2 = (px - qx) ** 2 + (py - qy) ** 2;
      if (d2 < best) {
        best = d2;
        const len = Math.sqrt(len2);
        bestS = (arc[k] + u * len) / this.arcTotal;
        bestSign = sx * (py - ay) - sy * (px - ax) >= 0 ? 1 : -1;
        bestNx = (-sy / len) * bestSign;
        bestNy = (sx / len) * bestSign;
      }
    }

    const a = Math.sqrt(best);
    const s = bestS;
    const u = s * L;
    const w = koiHalfWidth(s) * L;
    this.hitDist = a;
    this.hitS = s;
    this.hitV = a * bestSign;

    if (a <= w) {
      const across = a / (w || 1);
      if (s > 0.86) {
        // Caudal fin, orange, with a notch for the fork.
        if (s > 0.95 && across < 0.3) return false;
        this.hitFlag = FLAG_FIN;
        this.hitShade = 0.6 + 0.3 * (1 - across);
        this.hitPaint = PAINT_ORANGE;
        return true;
      }
      let paint = paintOf(this.koiTone, s, across * bestSign, this.koiSeed);
      // Rounded back lit from the top-left; flanks fall off into shadow.
      const facing = (bestNx * -0.6 + bestNy * -0.8) * across;
      let shade = 0.74 - across * across * 0.34 + facing * 0.2;
      let flag = FLAG_BODY;
      if (s > EYE[0] && s < EYE[1] && across > 0.55) {
        flag = FLAG_EYE;
      } else if (s > 0.3 && s < 0.72 && across < 0.18) {
        // Dorsal fin along the back: orange, catching the light.
        flag = FLAG_DORSAL;
        paint = PAINT_ORANGE;
        shade = Math.max(shade, 0.85);
      } else if (s < 0.04) {
        shade = Math.max(shade, 0.8);
      }
      this.hitFlag = flag;
      this.hitShade = shade;
      this.hitPaint = paint;
      return true;
    }

    const tip = bestSign > 0 ? this.finTipRight : this.finTipLeft;
    const [p0, p1, p2] = PECTORAL;
    if (inTriangle(u, a, L * p0, 0, L * p1, 0, L * p2, tip)) {
      this.hitFlag = FLAG_FIN;
      this.hitShade = 0.45 + 0.3 * (1 - clamp(a / tip, 0, 1));
      this.hitPaint = paintOf(this.koiTone, s, 1.1 * bestSign, this.koiSeed);
      return true;
    }
    const [v0, v1, v2, vr] = PELVIC;
    if (inTriangle(u, a, L * v0, 0, L * v1, 0, L * v2, L * vr)) {
      this.hitFlag = FLAG_FIN;
      this.hitShade = 0.45;
      this.hitPaint = paintOf(this.koiTone, s, 1.1 * bestSign, this.koiSeed);
      return true;
    }
    return false;
  }

  /**
   * Build a smooth, undulating render spine from the sim spine, then
   * supersample every cell in the koi's bounding box against the shape.
   * Fully covered cells become solid skin; partial cells become edge glyphs.
   */
  private rasterizeKoi(koi: Koi[], t: number) {
    const { koiFlag, koiShade, koiPaint, koiKey, koiDepth, koiAlpha, koiShadow, spine, arc, cw, ch, cols, rows } = this;
    koiFlag.fill(0);
    koiShadow.fill(0);

    for (const k of koi) {
      const L = k.length;
      const N = KOI_NODES;
      const n = k.nodes;
      const swim = clamp(k.speed / 50, 0.4, 1.4);
      this.koiSeed = k.seed;
      this.koiTone = k.shade;
      const alpha = clamp((t - k.born) / FADE_IN, 0, 1);

      // Travelling body wave, growing toward the tail.
      for (let i = 0; i < N; i++) {
        const s = i / (N - 1);
        const a = Math.max(0, i - 1);
        const b = Math.min(N - 1, i + 1);
        let tx = n[a * 2] - n[b * 2];
        let ty = n[a * 2 + 1] - n[b * 2 + 1];
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        const amp = L * 0.045 * (0.1 + 0.9 * Math.pow(s, 1.8)) * swim;
        const off = amp * Math.sin(k.phase - s * 5);
        spine[i * 2] = n[i * 2] - ty * off;
        spine[i * 2 + 1] = n[i * 2 + 1] + tx * off;
      }
      arc[0] = 0;
      for (let i = 1; i < N; i++) {
        arc[i] = arc[i - 1] + Math.hypot(spine[i * 2] - spine[(i - 1) * 2], spine[i * 2 + 1] - spine[(i - 1) * 2 + 1]);
      }
      this.arcTotal = arc[N - 1] || 1;

      // Bank into turns: the inside fin foreshortens, the outside one spreads.
      const bank = clamp(k.turn * 0.45, -0.35, 0.35);
      const flex = 1 + 0.08 * Math.sin(k.phase * 0.5);
      this.finTipRight = L * PECTORAL[3] * flex * (1 - bank);
      this.finTipLeft = L * PECTORAL[3] * flex * (1 + bank);

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < N; i++) {
        minX = Math.min(minX, spine[i * 2]);
        maxX = Math.max(maxX, spine[i * 2]);
        minY = Math.min(minY, spine[i * 2 + 1]);
        maxY = Math.max(maxY, spine[i * 2 + 1]);
      }
      const reach = L * 0.3;
      const c0 = Math.max(0, Math.floor((minX - reach) / cw));
      const c1 = Math.min(cols - 1, Math.floor((maxX + reach) / cw));
      const r0 = Math.max(0, Math.floor((minY - reach) / ch));
      const r1 = Math.min(rows - 1, Math.floor((maxY + reach) / ch));
      if (c0 > c1 || r0 > r1) continue;

      const skipBeyond = reach + Math.hypot(cw, ch);
      const shadowDc = Math.round((L * 0.04) / cw) + 1;
      const shadowDr = Math.round((L * 0.03) / ch) + 1;

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const x = c * cw;
          const y = r * ch;
          const centerHit = this.sampleKoi(x + cw / 2, y + ch / 2, L);
          if (!centerHit && this.hitDist > skipBeyond) continue;
          const flag = this.hitFlag;
          const shade = this.hitShade;
          const paint = this.hitPaint;
          const s = this.hitS;
          const v = this.hitV;

          let hits = centerHit ? 1 : 0;
          const subLen = this.subsampleLength;
          for (let i = 0; i < subLen; i += 2) {
            if (this.sampleKoi(x + SUBSAMPLES[i] * cw, y + SUBSAMPLES[i + 1] * ch, L)) hits++;
          }
          if (hits === 0) continue;
          const coverage = hits / (1 + subLen / 2);

          const idx = r * cols + c;
          // Body-anchored key so each glyph rides along with the skin.
          const key = (hash3(Math.round(s * 52), Math.round(v / (cw * 0.9)), k.id) * 4294967295) >>> 0;
          koiKey[idx] = key;
          koiDepth[idx] = k.depth;
          koiAlpha[idx] = alpha;
          koiPaint[idx] = centerHit ? paint : this.hitPaint;

          if (centerHit && coverage >= 0.6) {
            koiFlag[idx] = flag;
            const flicker = (hash3(c, r, Math.floor(t * 6)) - 0.5) * 0.05;
            koiShade[idx] = clamp(shade + flicker, 0, 1);
            if (flag !== FLAG_FIN && alpha > 0.6) {
              const sc = c + shadowDc;
              const sr = r + shadowDr;
              if (sc < cols && sr < rows) koiShadow[sr * cols + sc] = 1;
            }
          } else {
            koiFlag[idx] = FLAG_EDGE;
            koiShade[idx] = coverage;
          }
        }
      }
    }
  }

  private drawShadows() {
    const { ctx, cols, rows, cw, ch, koiShadow, koiFlag } = this;
    ctx.fillStyle = 'rgba(40,75,120,0.11)';
    const n = cols * rows;
    for (let i = 0; i < n; i++) {
      if (!koiShadow[i] || (koiFlag[i] && koiFlag[i] !== FLAG_EDGE)) continue;
      ctx.fillRect((i % cols) * cw + 1, ((i / cols) | 0) * ch + 1, cw - 1, ch - 1);
    }
  }

  /**
   * Skin blocks go straight into per-style batches; glyphs go into the
   * glyph batches, drawn from the atlas once everything is collected.
   */
  private drawKoi(t: number) {
    const { ctx, cols, rows, cw, ch, koiFlag, koiShade, koiPaint, koiKey, koiDepth, koiAlpha, blockBatches, koiGlyphs } = this;
    const n = cols * rows;
    for (let i = 0; i < n; i++) {
      const flag = koiFlag[i];
      if (!flag) continue;
      const fade = koiAlpha[i];
      if (fade <= 0) continue;
      const key = koiKey[i];
      const shade = koiShade[i];
      const paint = koiPaint[i];

      if (flag === FLAG_EDGE) {
        // Soft, anti-aliased silhouette: no block, just a glyph in the skin colour.
        const set = shade >= 0.5 ? EDGE_HEAVY_IDX : EDGE_LIGHT_IDX;
        this.pushGlyph(koiGlyphs, i, INK_EDGE + paint, set[(key >>> 8) % set.length], (0.35 + shade * 0.55) * fade);
        continue;
      }

      let level: number;
      let glyph: number;
      let fin = 0;
      if (flag === FLAG_EYE) {
        level = 1;
        glyph = G_EYE;
      } else if (flag === FLAG_FIN) {
        level = 0.75 + shade * 0.35;
        fin = 1;
        glyph = FIN_IDX[(key >>> 8) % FIN_IDX.length];
      } else if (flag === FLAG_DORSAL) {
        level = 0.8 + shade * 0.3;
        glyph = FIN_IDX[(key >>> 8) % FIN_IDX.length];
      } else {
        level = 0.55 + shade * 0.55;
        const jitter = ((key >>> 4) % 3) - 1;
        glyph = SKIN_IDX[clamp(Math.floor((1 - shade) * 8.99) + jitter, 0, SKIN_IDX.length - 1)];
      }
      level *= 0.82 + 0.18 * koiDepth[i];
      const step = clamp(Math.round(((level - LEVEL_MIN) / LEVEL_SPAN) * (BLOCK_LEVELS - 1)), 0, BLOCK_LEVELS - 1);
      blockBatches[(paint * 2 + fin) * BLOCK_LEVELS + step].push(i);

      // Glyphs re-roll on a staggered clock so the skin shimmers.
      const tick = Math.floor(t * 2.4 + (key % 997) / 97);
      if (flag === FLAG_EYE) this.pushGlyph(koiGlyphs, i, INK_EYE, glyph, fade);
      else if (hash3(key, tick, 7) < 0.06) this.pushGlyph(koiGlyphs, i, INK_WHITE, glyph, fade);
      else this.pushGlyph(koiGlyphs, i, INK_KOI + paint, glyph, (paint === PAINT_ORANGE ? 0.85 : 0.8) * fade);
    }

    // One fillStyle per batch; the fade-in rides on globalAlpha.
    let alpha = 1;
    ctx.globalAlpha = 1;
    for (let b = 0; b < blockBatches.length; b++) {
      const cells = blockBatches[b];
      if (!cells.length) continue;
      ctx.fillStyle = BLOCK_STYLES[b];
      for (const i of cells) {
        const f = koiAlpha[i];
        if (f !== alpha) ctx.globalAlpha = alpha = f;
        ctx.fillRect((i % cols) * cw + 1, ((i / cols) | 0) * ch + 1, cw - 1, ch - 1);
      }
      cells.length = 0;
    }
    ctx.globalAlpha = 1;
  }

  /** Two short whiskers at the mouth, the thing that says "koi" at a glance. */
  private drawBarbels(koi: Koi[], t: number) {
    const { koiFlag } = this;
    for (const k of koi) {
      const fade = clamp((t - k.born) / FADE_IN, 0, 1);
      if (fade <= 0) continue;
      const L = k.length;
      const fx = Math.cos(k.heading);
      const fy = Math.sin(k.heading);
      const sx = k.nodes[0] + fx * L * 0.015;
      const sy = k.nodes[1] + fy * L * 0.015;
      for (const side of [-1, 1]) {
        const i = this.cellIndex(sx - fy * side * L * 0.075, sy + fx * side * L * 0.075);
        if (i < 0 || (koiFlag[i] && koiFlag[i] !== FLAG_EDGE)) continue;
        this.pushGlyph(this.koiGlyphs, i, INK_BARBEL, side < 0 ? G_TICK : G_QUOTE, 0.7 * fade);
      }
    }
  }

  /** Queue one atlas glyph for a cell, batched by its transparency level. */
  private pushGlyph(batches: number[][], cell: number, ink: number, glyph: number, alpha: number) {
    if (alpha < 0.04) return;
    const level = clamp(Math.round(alpha * GLYPH_ALPHA_LEVELS) - 1, 0, GLYPH_ALPHA_LEVELS - 1);
    batches[level].push(cell, ink * GLYPH_COUNT + glyph);
  }

  /** Copy every queued glyph from the atlas: one globalAlpha per level, no text drawing. */
  private drawGlyphs(batches: number[][]) {
    const { ctx, atlas, cols, cw, ch, dpr, atlasStrideX, atlasStrideY } = this;
    const sw = cw * dpr;
    const sh = ch * dpr;
    for (let level = 0; level < batches.length; level++) {
      const batch = batches[level];
      if (!batch.length) continue;
      ctx.globalAlpha = (level + 1) / GLYPH_ALPHA_LEVELS;
      for (let k = 0; k < batch.length; k += 2) {
        const i = batch[k];
        const a = batch[k + 1];
        const glyph = a % GLYPH_COUNT;
        const ink = (a / GLYPH_COUNT) | 0;
        ctx.drawImage(atlas, glyph * atlasStrideX, ink * atlasStrideY, sw, sh, (i % cols) * cw, ((i / cols) | 0) * ch, cw, ch);
      }
      batch.length = 0;
    }
    ctx.globalAlpha = 1;
  }

  // ── water ───────────────────────────────────────────────────────────

  private drawWake() {
    const { ctx, cols, rows, cw, ch, energy, koiFlag, wakeBatches } = this;
    const n = cols * rows;
    for (let i = 0; i < n; i++) {
      const e = energy[i];
      if (e < 0.3 || (koiFlag[i] && koiFlag[i] !== FLAG_EDGE)) continue;
      wakeBatches[clamp(Math.floor((e - 0.3) * 5), 0, ALPHA_LEVELS - 1)].push(i);
    }
    const size = Math.max(2, Math.round(cw * 0.19)) + 1;
    for (let level = 0; level < wakeBatches.length; level++) {
      const cells = wakeBatches[level];
      if (!cells.length) continue;
      ctx.fillStyle = this.wakeStyles[level];
      for (const i of cells) {
        const col = i % cols;
        const row = (i / cols) | 0;
        ctx.fillRect(Math.round(col * cw + cw * 0.66 - size / 2), Math.round(row * ch + ch * 0.64 - size / 2), size, size);
      }
      cells.length = 0;
    }
  }

  /**
   * Each drop sends a wave front outwards with a few trailing rings. All
   * ripples add into one field, so where rings cross they interfere, and a
   * cell is drawn once however many ripples cover it. Crests are glyphs
   * picked by the direction of the strongest ring (| - / \), troughs are dots.
   */
  private drawRipples(ripples: Ripple[], t: number) {
    const { cols, rows, cw, ch, rippleW, rippleBest, rippleDx, rippleDy, rippleStamp, rippleCells, waterGlyphs } = this;
    const SPEED = 150;
    const LAMBDA = 30;
    const stamp = ++this.frameId;
    rippleCells.length = 0;

    for (const rp of ripples) {
      const age = t - rp.t0;
      if (age < 0 || age > RIPPLE_LIFE) continue;
      // A ripple pushed out by newer ones fades away quickly.
      const out = t >= rp.fadeStart ? clamp(1 - (t - rp.fadeStart) / RIPPLE_FADE, 0, 1) : 1;
      if (out <= 0) continue;
      const front = 10 + age * SPEED;
      const env = (out * Math.pow(1 - age / RIPPLE_LIFE, 1.3)) / Math.sqrt(1 + front / 220);
      const band = LAMBDA * 3;

      const c0 = Math.max(0, Math.floor((rp.x - front - LAMBDA) / cw));
      const c1 = Math.min(cols - 1, Math.floor((rp.x + front + LAMBDA) / cw));
      const r0 = Math.max(0, Math.floor((rp.y - front - LAMBDA) / ch));
      const r1 = Math.min(rows - 1, Math.floor((rp.y + front + LAMBDA) / ch));

      for (let r = r0; r <= r1; r++) {
        const dy = r * ch + ch / 2 - rp.y;
        for (let c = c0; c <= c1; c++) {
          const dx = c * cw + cw / 2 - rp.x;
          const d = Math.hypot(dx, dy);
          if (d > front + LAMBDA * 0.4 || d < front - band) continue;
          const behind = Math.max(0, front - d);
          const w = Math.cos(((d - front) / LAMBDA) * TAU) * Math.exp(-behind / (LAMBDA * 1.6)) * env;
          const i = r * cols + c;
          if (rippleStamp[i] !== stamp) {
            rippleStamp[i] = stamp;
            rippleW[i] = 0;
            rippleBest[i] = 0;
            rippleCells.push(i);
          }
          rippleW[i] += w;
          const aw = Math.abs(w);
          if (aw > rippleBest[i]) {
            rippleBest[i] = aw;
            rippleDx[i] = dx;
            rippleDy[i] = dy;
          }
        }
      }

      // The splash itself, for a moment.
      if (age < 0.45) {
        const i = this.cellIndex(rp.x, rp.y);
        if (i >= 0) this.pushGlyph(waterGlyphs, i, INK_WHITE, G_STAR, (1 - age / 0.45) * out);
      }
    }

    for (const i of rippleCells) {
      const w = rippleW[i];
      if (w > 0.1) {
        // Crests read as deeper water against the pale surface.
        const dx = rippleDx[i];
        const dy = rippleDy[i];
        const d = Math.hypot(dx, dy) || 1;
        const ax = Math.abs(dx) / d;
        const ay = Math.abs(dy) / d;
        const glyph = ax > 0.82 ? G_VBAR : ay > 0.82 ? G_HBAR : dx * dy > 0 ? G_BACKSLASH : G_SLASH;
        this.pushGlyph(waterGlyphs, i, INK_RIPPLE, glyph, Math.min(1, w * 1.5));
      } else if (w < -0.1) {
        // Troughs catch the light.
        this.pushGlyph(waterGlyphs, i, INK_WHITE, -w > 0.45 ? G_DOT : G_PERIOD, Math.min(1, -w * 1.6));
      }
    }
  }
}
