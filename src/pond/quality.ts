/**
 * Adaptive quality. If frames keep arriving too slowly, step the canvas
 * resolution down; the last level also halves the supersampling. It only
 * ever steps down, once per page load, so the picture never flickers
 * between levels.
 */

/** Cap on device pixels per CSS pixel, per quality level. */
export const DPR_CAPS = [2, 1.5, 1];

/** Milliseconds of frames per verdict, so slow devices are judged as fast as quick ones. */
const WINDOW_MS = 1500;
/** A median frame slower than this (about 45 fps) counts as struggling. */
const SLOW_MS = 22;
/** Ignore frames for this long after a resize, a pause or a step down. */
const SETTLE_MS = 800;
/** Gaps longer than this are a paused or hidden tab, not a slow frame. */
const MAX_GAP_MS = 250;

export class QualityGovernor {
  level = 0;
  private samples: number[] = [];
  private sampledMs = 0;
  private ignoreUntil = 0;

  get lowest() {
    return this.level >= DPR_CAPS.length - 1;
  }

  get dprCap() {
    return DPR_CAPS[this.level];
  }

  /** Skip the next moment of frames, which are slow for reasons of their own. */
  settle(now: number) {
    this.ignoreUntil = now + SETTLE_MS;
    this.samples.length = 0;
    this.sampledMs = 0;
  }

  /** Feed one frame interval. Returns true when quality just stepped down. */
  sample(intervalMs: number, now: number) {
    if (this.lowest || now < this.ignoreUntil || intervalMs > MAX_GAP_MS) return false;
    this.samples.push(intervalMs);
    this.sampledMs += intervalMs;
    if (this.sampledMs < WINDOW_MS) return false;
    const sorted = this.samples.slice().sort((a, b) => a - b);
    const median = sorted[sorted.length >> 1];
    this.samples.length = 0;
    this.sampledMs = 0;
    if (median <= SLOW_MS) return false;
    this.level++;
    this.settle(now);
    return true;
  }
}
