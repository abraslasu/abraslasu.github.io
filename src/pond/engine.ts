import { QualityGovernor } from './quality';
import { AsciiPond } from './renderer';
import { World } from './world';

const STEP = 1 / 60;
const MAX_STEPS = 4;

/**
 * Wires World + AsciiPond to a canvas: fixed-timestep loop, resize, pointer
 * input, pausing off-screen, and adaptive quality (the canvas resolution
 * steps down if frames keep arriving too slowly).
 *
 * The pond is still until the first click. Every click is a drop. The
 * animation always runs once started; when the visitor's system asks for
 * reduced motion it switches the world to calm mode instead of stopping.
 */
export class PondEngine {
  private world: World;
  private renderer: AsciiPond;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private visible = true;
  private reducedMotion: MediaQueryList;
  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private disposed = false;
  private quality = new QualityGovernor();

  constructor(private canvas: HTMLCanvasElement, koiCount?: number) {
    this.world = new World(koiCount);
    this.renderer = new AsciiPond(canvas);
    this.renderer.setFontFamily(getComputedStyle(canvas).fontFamily);
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.world.calm = this.reducedMotion.matches;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.intersectionObserver.observe(canvas);

    this.reducedMotion.addEventListener('change', this.onMotionPreference);
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true });

    this.resize();
    // System monospace is usually ready at once; redraw the glyph atlas if it arrives late.
    document.fonts?.ready.then(() => {
      if (this.disposed) return;
      this.renderer.refreshGlyphs();
      if (!this.world.started) this.drawStill();
    });
  }

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener('change', this.onMotionPreference);
    window.removeEventListener('pointerdown', this.onPointerDown);
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, this.quality.dprCap);
    this.renderer.setLowDetail(this.quality.lowest);
    this.renderer.resize(rect.width, rect.height, dpr);
    this.quality.settle(performance.now());
    this.world.resize(rect.width, rect.height);
    if (!this.world.started) this.drawStill();
  }

  private schedule() {
    cancelAnimationFrame(this.raf);
    if (this.disposed || !this.visible || !this.world.started) return;
    this.last = performance.now();
    this.quality.settle(this.last);
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    const interval = now - this.last;
    const dt = Math.min(0.1, interval / 1000);
    this.last = now;
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < MAX_STEPS) {
      this.world.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) this.acc = 0;
    this.renderer.render(this.world, dt);
    // Struggling for a while? Drop the canvas resolution a step.
    if (this.quality.sample(interval, now)) this.resize();
    this.raf = requestAnimationFrame(this.frame);
  };

  /** Before the first click: the still surface. */
  private drawStill() {
    this.renderer.drawEmpty();
  }

  /** The visitor toggled reduced motion: switch calm mode, keep animating. */
  private onMotionPreference = () => {
    this.world.calm = this.reducedMotion.matches;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.disposed || e.button !== 0) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    const first = !this.world.started;
    this.world.start();
    this.world.drop(x, y);
    if (first) this.schedule();
  };
}
