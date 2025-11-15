// Perlin Noise implementation for procedural generation

export class PerlinNoise {
  private permutation: number[];

  constructor(seed = 0) {
    this.permutation = this.generatePermutation(seed);
  }

  private generatePermutation(seed: number): number[] {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle using seed
    let random = this.seededRandom(seed);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const temp = p[i]!;
      p[i] = p[j]!;
      p[j] = temp;
    }

    // Duplicate for wrapping
    return [...p, ...p];
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const a = this.permutation[X]! + Y;
    const aa = this.permutation[a]!;
    const ab = this.permutation[a + 1]!;
    const b = this.permutation[X + 1]! + Y;
    const ba = this.permutation[b]!;
    const bb = this.permutation[b + 1]!;

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.permutation[aa]!, x, y), this.grad(this.permutation[ba]!, x - 1, y)),
      this.lerp(
        u,
        this.grad(this.permutation[ab]!, x, y - 1),
        this.grad(this.permutation[bb]!, x - 1, y - 1)
      )
    );
  }

  // Generate octave noise for more natural terrain
  octaveNoise(x: number, y: number, octaves = 4, persistence = 0.5): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}
