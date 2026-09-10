export const PHRASE_ART = {
  src: '/dont-blame-us.png',
  width: 2360,
  height: 1640,
} as const;

export const STEM_ART = {
  src: '/dont-blame-us-stem.png',
  width: 120,
  height: 4200,
  overlap: 36,
} as const;

export const WORDS = ['dont', 'blame', 'us'] as const;
export type Word = (typeof WORDS)[number];

export const DONT_END = 0.3517;
export const BLAME_END = 0.736;
export const STEM_CENTER = 955 / 2360;

export const BRUSH_RADIUS = 86;
export const BRUSH_FEATHER = 26;
export const BRUSH_GAP = 10;
export const REGION_THRESHOLD = 0.62;

export type Sample = { x: number; y: number; hit: boolean };
export type Samples = Record<Word, Sample[]>;

export function loadPhraseImage() {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('phrase art failed'));
    image.src = PHRASE_ART.src;
    if (image.complete && image.naturalWidth) resolve(image);
  });
}

export function createLayer(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  return { canvas, ctx };
}

export function stampBrush(ctx: CanvasRenderingContext2D, x: number, y: number, radius = BRUSH_RADIUS, feather = BRUSH_FEATHER) {
  const inner = Math.max(1, radius - feather);
  const gradient = ctx.createRadialGradient(x, y, inner, x, y, radius);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function pointsAlong(ax: number, ay: number, bx: number, by: number, gap = BRUSH_GAP) {
  const distance = Math.hypot(bx - ax, by - ay);
  const steps = Math.max(1, Math.ceil(distance / gap));
  const points: { x: number; y: number }[] = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    points.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t });
  }
  return points;
}

export function sampleInk(image: HTMLImageElement): Samples {
  const { canvas, ctx } = createLayer(image.naturalWidth, image.naturalHeight);
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const samples: Samples = { dont: [], blame: [], us: [] };
  const step = 16;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] < 40) continue;
      const fx = x / width;
      const fy = y / height;
      if (fx < DONT_END && fy < 0.56) samples.dont.push({ x, y, hit: false });
      else if (fx >= DONT_END && fx < BLAME_END) samples.blame.push({ x, y, hit: false });
      else if (fx >= BLAME_END && fy < 0.56) samples.us.push({ x, y, hit: false });
    }
  }

  return samples;
}

export function markCoverage(samples: Samples, imageX: number, imageY: number, radius: number) {
  const radius2 = radius * radius;
  let changed = false;
  for (const word of WORDS) {
    for (const sample of samples[word]) {
      if (sample.hit) continue;
      const dx = sample.x - imageX;
      const dy = sample.y - imageY;
      if (dx * dx + dy * dy <= radius2) {
        sample.hit = true;
        changed = true;
      }
    }
  }
  return changed;
}

export function coverage(samples: Samples, word: Word) {
  const list = samples[word];
  if (!list.length) return 0;
  let hit = 0;
  for (const sample of list) if (sample.hit) hit += 1;
  return hit / list.length;
}
