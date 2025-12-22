import type { RNG } from '../types/index.js';

const DEFAULT_SEED = 1;

export class LcgRng implements RNG {
  private state: number;

  constructor(seed = DEFAULT_SEED) {
    this.state = seed >>> 0;
  }

  next(): number {
    // Numerical Recipes LCG constants.
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  int(min: number, max: number): number {
    if (max < min) {
      [min, max] = [max, min];
    }
    const range = max - min + 1;
    return min + Math.floor(this.next() * range);
  }

  roll(notation: string): number {
    const match = /^\s*(\d*)d(\d+)([+-]\d+)?\s*$/i.exec(notation);
    if (!match) {
      return 0;
    }
    const count = match[1] ? Number(match[1]) : 1;
    const sides = Number(match[2]);
    const modifier = match[3] ? Number(match[3]) : 0;

    let total = 0;
    for (let i = 0; i < count; i += 1) {
      total += this.int(1, sides);
    }
    return total + modifier;
  }
}

export function createDefaultRng(seed?: number): RNG {
  return new LcgRng(seed ?? DEFAULT_SEED);
}
