'use client';

import { useEffect, useRef, type Ref } from 'react';

const LOGO_SRC = '/hael-logo.jpg';
const GLYPHS = ['·', ':', '+', '/', '\\', '|', '*', '°', "'", '#'];
const FIELD_GLYPHS = ['·', ':', '/', '\\', "'", '°', '+'];
const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const EMBLEM_CROP = { x: 0.055, y: 0.03, w: 0.89, h: 0.592 };
const EMBLEM_CROP_REF_H = 0.54;
const POINTER_RADIUS = 148;
const POINTER_CORE = 25;
const POINTER_REVEAL = 36;
const POINTER_SHIFT = 4.2;
const POINTER_FOCUS_SCALE = 0.58;
const POINTER_ZONE = 58;
const POINTER_MUTATE = 0.13;

type Cell = {
  x: number;
  y: number;
  lum: number;
  glyph: string;
  kind: 'emblem' | 'field';
  hidden: boolean;
  ox: number;
  oy: number;
};

type Dest = { x: number; y: number; w: number; h: number };

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasFinePointer() {
  return window.matchMedia(FINE_POINTER).matches;
}

function pickGlyph(lum: number, index: number) {
  if (lum > 0.7) return ['#', '*', '|', '+'][index % 4];
  if (lum > 0.38) return ['|', '*', '/', '\\', '+', ':'][(index + 3) % 6];
  return GLYPHS[(index + 6) % GLYPHS.length];
}

function pickFieldGlyph(col: number, row: number) {
  return FIELD_GLYPHS[(col * 3 + row * 5) % FIELD_GLYPHS.length];
}

function nudgeFieldGlyph(glyph: string, salt: number) {
  const index = FIELD_GLYPHS.indexOf(glyph);
  const from = index < 0 ? salt % FIELD_GLYPHS.length : index;
  return FIELD_GLYPHS[(from + 1 + (salt % 2)) % FIELD_GLYPHS.length];
}

function falloffAt(distance: number, radius: number) {
  if (distance >= radius) return 0;
  const t = 1 - distance / radius;
  return t * t * (3 - 2 * t);
}

function hash(col: number, row: number) {
  return ((col * 127 + row * 311) % 1000) / 1000;
}

function distanceToRect(px: number, py: number, rect: Dest) {
  if (!rect.w || !rect.h) return Number.POSITIVE_INFINITY;
  const dx = px < rect.x ? rect.x - px : px > rect.x + rect.w ? px - (rect.x + rect.w) : 0;
  const dy = py < rect.y ? rect.y - py : py > rect.y + rect.h ? py - (rect.y + rect.h) : 0;
  return Math.hypot(dx, dy);
}

function inkBounds(cells: Cell[]): Dest {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const cell of cells) {
    if (cell.kind !== 'emblem') continue;
    minX = Math.min(minX, cell.x);
    minY = Math.min(minY, cell.y);
    maxX = Math.max(maxX, cell.x);
    maxY = Math.max(maxY, cell.y);
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function destRect(viewW: number, viewH: number, aspect: number, mobile: boolean): Dest {
  const height = (mobile ? viewH * 0.58 : viewH * 0.8) * (EMBLEM_CROP.h / EMBLEM_CROP_REF_H);
  const width = height * aspect;
  return {
    w: width,
    h: height,
    x: viewW * 0.5 - width * 0.5,
    y: viewH * (mobile ? 0.53 : 0.5) - height * 0.5,
  };
}

function centerCells(cells: Cell[], dest: Dest, viewW: number, viewH: number, mobile: boolean) {
  let mass = 0;
  let mx = 0;
  let my = 0;
  for (const cell of cells) {
    if (cell.kind !== 'emblem') continue;
    mass += cell.lum;
    mx += cell.x * cell.lum;
    my += cell.y * cell.lum;
  }
  if (!mass) return dest;
  const ox = viewW * 0.5 - mx / mass;
  const oy = viewH * (mobile ? 0.53 : 0.5) - my / mass;
  for (const cell of cells) {
    cell.x += ox;
    cell.y += oy;
  }
  return { ...dest, x: dest.x + ox, y: dest.y + oy };
}

export function CampaignMark({ systemRef }: { systemRef?: Ref<HTMLDivElement> }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<Cell[]>([]);
  const destRef = useRef<Dest>({ x: 0, y: 0, w: 0, h: 0 });
  const inkRef = useRef<Dest>({ x: 0, y: 0, w: 0, h: 0 });
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const scheduleRef = useRef<(() => void) | null>(null);
  const emblemRef = useRef<HTMLCanvasElement | null>(null);
  const mutationTimerRef = useRef<number | null>(null);
  const resolveRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let disposed = false;
    let source: HTMLImageElement | null = null;
    let drawFrame = 0;

    const scheduleDraw = () => {
      if (drawFrame || disposed) return;
      drawFrame = window.requestAnimationFrame(() => {
        drawFrame = 0;
        draw();
      });
    };

    const draw = () => {
      const width = frame.clientWidth;
      const height = frame.clientHeight;
      if (!width || !height) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelW = Math.round(width * ratio);
      const pixelH = Math.round(height * ratio);
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.font = `${width < 520 ? 10 : 12}px "Courier New", Courier, monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const pointer = pointerRef.current;
      const dest = destRef.current;
      const emblem = emblemRef.current;
      const resolve = resolveRef.current;
      const hero = frame.closest('.campaign-hero');
      const focused = hero instanceof HTMLElement && hero.dataset.phrase === 'focus';
      const reaction = pointer.active ? (focused ? POINTER_FOCUS_SCALE : 1) : 0;
      const nearEmblem = pointer.active && distanceToRect(pointer.x, pointer.y, inkRef.current) <= POINTER_ZONE;
      const reveal = (x: number, y: number, radius: number, alpha: number) => {
        if (!emblem || !dest.w) return;
        context.save();
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.clip();
        context.globalAlpha = alpha;
        context.drawImage(emblem, dest.x, dest.y, dest.w, dest.h);
        context.restore();
      };

      if (nearEmblem) reveal(pointer.x, pointer.y, POINTER_REVEAL, focused ? 0.28 : 0.46);
      if (resolve.active) reveal(resolve.x, resolve.y, 42, 0.22);

      const bucket = Math.floor(pointer.x * 0.035) * 19 + Math.floor(pointer.y * 0.035) * 13;

      for (const cell of cellsRef.current) {
        const dx = reaction ? cell.x - pointer.x : 0;
        const dy = reaction ? cell.y - pointer.y : 0;
        const distance = reaction ? Math.hypot(dx, dy) : 1e4;
        const falloff = reaction ? falloffAt(distance, POINTER_RADIUS) : 0;
        const core = nearEmblem && cell.kind === 'emblem' && distance < POINTER_CORE;
        if (cell.hidden && falloff < 0.18) continue;

        const fade = core ? 0.18 : 1;
        const base = cell.kind === 'emblem' ? 0.22 + cell.lum * 0.55 : 0.105 + cell.lum * 0.16;
        const lift = falloff * (focused ? 0.07 : 0.12);
        const cap = cell.kind === 'emblem' ? 0.88 : focused ? 0.34 : 0.42;
        const alpha = Math.min(cap, (base + lift) * fade);
        if (alpha < 0.05) continue;

        let glyph = cell.glyph;
        if (cell.kind === 'field' && falloff > 0.24) {
          const select = hash(Math.round(cell.x) + bucket, Math.round(cell.y));
          if (select < POINTER_MUTATE) glyph = nudgeFieldGlyph(cell.glyph, bucket);
        }

        const mag = falloff * POINTER_SHIFT * (reaction || 0);
        const nx = dx / (distance || 1);
        const ny = dy / (distance || 1);

        context.fillStyle = `rgba(240,240,237,${alpha})`;
        context.fillText(glyph, cell.x + cell.ox + nx * mag, cell.y + cell.oy + ny * mag);
      }
    };

    scheduleRef.current = scheduleDraw;

    const buildCells = () => {
      if (!source || !frame.clientWidth || !frame.clientHeight) return;

      const width = frame.clientWidth;
      const height = frame.clientHeight;
      const mobile = width < 700;
      const cropX = source.width * EMBLEM_CROP.x;
      const cropY = source.height * EMBLEM_CROP.y;
      const cropW = source.width * EMBLEM_CROP.w;
      const cropH = source.height * EMBLEM_CROP.h;
      const dest = destRect(width, height, cropW / cropH, mobile);

      const step = mobile ? 13 : 9;
      const cols = Math.max(12, Math.round(dest.w / step));
      const rows = Math.max(12, Math.round(dest.h / step));
      const sample = document.createElement('canvas');
      sample.width = cols;
      sample.height = rows;
      const sampleContext = sample.getContext('2d', { willReadFrequently: true });
      if (!sampleContext) return;

      sampleContext.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cols, rows);
      const pixels = sampleContext.getImageData(0, 0, cols, rows).data;
      const cells: Cell[] = [];

      const emblemPlate = document.createElement('canvas');
      emblemPlate.width = Math.round(cropW);
      emblemPlate.height = Math.round(cropH);
      const plateContext = emblemPlate.getContext('2d');
      plateContext?.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, emblemPlate.width, emblemPlate.height);
      emblemRef.current = emblemPlate;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const lum = (pixels[(row * cols + col) * 4] + pixels[(row * cols + col) * 4 + 1] + pixels[(row * cols + col) * 4 + 2]) / 765;
          if (lum < 0.3) continue;
          cells.push({
            x: dest.x + (col + 0.5) * (dest.w / cols),
            y: dest.y + (row + 0.5) * (dest.h / rows),
            lum,
            glyph: pickGlyph(lum, cells.length),
            kind: 'emblem',
            hidden: false,
            ox: 0,
            oy: 0,
          });
        }
      }

      const fieldStep = mobile ? 22 : 16;
      const fieldCols = Math.floor(width / fieldStep);
      const fieldRows = Math.floor(height / fieldStep);
      const cx = dest.x + dest.w * 0.5;
      const cy = dest.y + dest.h * 0.5;
      const reach = Math.hypot(dest.w, dest.h) * 0.72;

      for (let row = 0; row < fieldRows; row += 1) {
        for (let col = 0; col < fieldCols; col += 1) {
          const jitterX = (hash(col, row) - 0.5) * fieldStep * 0.8;
          const jitterY = (hash(row, col + 3) - 0.5) * fieldStep * 0.8;
          const x = (col + 0.5) * (width / fieldCols) + jitterX;
          const y = (row + 0.5) * (height / fieldRows) + jitterY;
          const distance = Math.hypot(x - cx, y - cy);
          if (distance < reach * 0.36 || distance > reach * 1.42) continue;
          const band =
            distance < reach * 0.62
              ? mobile
                ? 0.16
                : 0.22
              : distance < reach * 0.95
                ? mobile
                  ? 0.09
                  : 0.125
                : distance < reach * 1.18
                  ? mobile
                    ? 0.04
                    : 0.055
                  : mobile
                    ? 0.018
                    : 0.028;
          if (hash(col, row) > band) continue;
          const near = distance < reach * 0.62 ? 0.3 : distance < reach * 0.95 ? 0.22 : 0.16;
          cells.push({
            x,
            y,
            lum: near,
            glyph: pickFieldGlyph(col, row),
            kind: 'field',
            hidden: hash(col, row + 7) > 0.84,
            ox: 0,
            oy: 0,
          });
        }
      }

      destRef.current = centerCells(cells, dest, width, height, mobile);
      inkRef.current = inkBounds(cells);
      cellsRef.current = cells;
      scheduleDraw();
    };

    const image = new window.Image();
    image.src = LOGO_SRC;
    image.onload = () => {
      if (disposed) return;
      source = image;
      buildCells();
    };

    const observer = new ResizeObserver(() => {
      buildCells();
    });
    observer.observe(frame);

    const clearMutationTimer = () => {
      if (mutationTimerRef.current === null) return;
      window.clearTimeout(mutationTimerRef.current);
      mutationTimerRef.current = null;
    };

    const mutate = () => {
      if (disposed || prefersReducedMotion() || !context || !canvas.isConnected) return;
      const cells = cellsRef.current;
      if (!cells.length) return;
      const emblem = cells.filter((cell) => cell.kind === 'emblem');
      const field = cells.filter((cell) => cell.kind === 'field');
      let hiddenEmblem = emblem.filter((cell) => cell.hidden).length;
      const emblemCount = Math.max(1, Math.round(emblem.length * (0.03 + Math.random() * 0.05)));
      for (let i = 0; i < emblemCount; i += 1) {
        const cell = emblem[Math.floor(Math.random() * emblem.length)];
        if (!cell) continue;
        const roll = Math.random();
        if (roll < 0.34 && !cell.hidden) {
          if (hiddenEmblem / Math.max(1, emblem.length) > 0.12) cell.glyph = pickGlyph(cell.lum, Math.floor(Math.random() * 20));
          else {
            cell.hidden = true;
            hiddenEmblem += 1;
          }
        } else if (roll < 0.62 && cell.hidden) {
          cell.hidden = false;
          hiddenEmblem = Math.max(0, hiddenEmblem - 1);
        } else {
          cell.glyph = pickGlyph(cell.lum, Math.floor(Math.random() * 20));
        }
        cell.ox = (Math.random() - 0.5) * 1.2;
        cell.oy = (Math.random() - 0.5) * 1.2;
      }

      const fieldCount = Math.max(1, Math.round(field.length * (0.08 + Math.random() * 0.08)));
      for (let i = 0; i < fieldCount; i += 1) {
        const cell = field[Math.floor(Math.random() * field.length)];
        if (!cell) continue;
        const roll = Math.random();
        if (roll < 0.4) cell.hidden = !cell.hidden;
        else cell.glyph = FIELD_GLYPHS[Math.floor(Math.random() * FIELD_GLYPHS.length)];
        cell.ox = (Math.random() - 0.5) * 2.2;
        cell.oy = (Math.random() - 0.5) * 2.2;
      }

      if (field.length && Math.random() < 0.3) {
        const seed = field[Math.floor(Math.random() * field.length)];
        for (const cell of field) {
          if (Math.hypot(cell.x - seed.x, cell.y - seed.y) > 52) continue;
          cell.hidden = Math.random() < 0.38;
          cell.ox = (Math.random() - 0.5) * 2;
          cell.oy = (Math.random() - 0.5) * 2;
        }
      }

      if (emblem.length && Math.random() < 0.38) {
        const spot = emblem[Math.floor(Math.random() * emblem.length)];
        resolveRef.current = { x: spot.x, y: spot.y, active: true };
      } else {
        resolveRef.current = { x: 0, y: 0, active: false };
      }
      scheduleDraw();
    };

    const scheduleMutate = () => {
      clearMutationTimer();
      if (disposed || prefersReducedMotion()) return;
      mutationTimerRef.current = window.setTimeout(() => {
        mutationTimerRef.current = null;
        if (disposed || prefersReducedMotion()) return;
        mutate();
        scheduleMutate();
      }, 250 + Math.random() * 150) as unknown as number;
    };

    if (!prefersReducedMotion()) scheduleMutate();

    return () => {
      disposed = true;
      scheduleRef.current = null;
      observer.disconnect();
      clearMutationTimer();
      if (drawFrame) window.cancelAnimationFrame(drawFrame);
    };
  }, []);

  useEffect(() => {
    const hero = frameRef.current?.closest('.campaign-hero');
    if (!hero || !(hero instanceof HTMLElement)) return;

    const onMove = (event: Event) => {
      if (prefersReducedMotion() || !hasFinePointer()) return;
      const pointer = event as PointerEvent;
      const bounds = frameRef.current?.getBoundingClientRect();
      if (!bounds) return;
      pointerRef.current = {
        x: pointer.clientX - bounds.left,
        y: pointer.clientY - bounds.top,
        active: true,
      };
      scheduleRef.current?.();
    };

    const onLeave = () => {
      if (!pointerRef.current.active) return;
      pointerRef.current.active = false;
      scheduleRef.current?.();
    };

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <figure className="campaign-mark" aria-hidden="true">
      <div className="campaign-mark-system" ref={systemRef}>
        <div className="campaign-mark-frame" ref={frameRef}>
          <canvas className="campaign-mark-glyphs" ref={canvasRef} />
        </div>
      </div>
    </figure>
  );
}
