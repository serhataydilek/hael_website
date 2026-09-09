'use client';

import { useEffect, useRef, type Ref } from 'react';

const LOGO_SRC = '/hael-logo.jpg';
const GLYPHS = ['·', ':', '+', '/', '\\', '|', '*', '°', "'", '#'];
const FIELD_GLYPHS = ['·', ':', '/', '\\', "'", '°', '+'];
const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const EMBLEM_CROP = { x: 0.055, y: 0.03, w: 0.89, h: 0.592 };
const EMBLEM_CROP_REF_H = 0.54;
const POINTER_NEAR = 58;
const POINTER_CORE = 25;
const POINTER_REVEAL = 36;
const POINTER_SHIFT = 7;
const POINTER_ZONE = 58;
const WORD_ZONE = 28;
const FIND_DELAY = 40;
const PHRASE_FOUND_KEY = 'hael-phrase-found';

type PhraseFound = { dont: boolean; blame: boolean; us: boolean };

function emptyFound(): PhraseFound {
  return { dont: false, blame: false, us: false };
}

function readFound(): PhraseFound {
  try {
    const raw = sessionStorage.getItem(PHRASE_FOUND_KEY);
    if (!raw) return emptyFound();
    const parsed = JSON.parse(raw) as Partial<PhraseFound>;
    return { dont: Boolean(parsed.dont), blame: Boolean(parsed.blame), us: Boolean(parsed.us) };
  } catch {
    return emptyFound();
  }
}

function writeFound(next: PhraseFound) {
  try {
    sessionStorage.setItem(PHRASE_FOUND_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

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

function boxFromNode(node: Element | null, frame: DOMRect): Dest {
  if (!(node instanceof HTMLElement)) return { x: 0, y: 0, w: 0, h: 0 };
  const box = node.getBoundingClientRect();
  return { x: box.left - frame.left, y: box.top - frame.top, w: box.width, h: box.height };
}

function phraseAnchors(cells: Cell[], ink: Dest, viewW: number, mobile: boolean) {
  const mid = ink.x + ink.w * 0.5;
  const tipBand = ink.y + ink.h * 0.36;
  let leftMin = Infinity;
  let rightMin = Infinity;
  let leftInner = -Infinity;
  let rightInner = Infinity;
  let leftSum = 0;
  let leftCount = 0;
  let rightSum = 0;
  let rightCount = 0;

  for (const cell of cells) {
    if (cell.kind !== 'emblem' || cell.y > tipBand) continue;
    if (cell.x < mid) leftMin = Math.min(leftMin, cell.y);
    else rightMin = Math.min(rightMin, cell.y);
  }

  const slop = mobile ? 14 : 18;
  for (const cell of cells) {
    if (cell.kind !== 'emblem') continue;
    if (cell.y <= tipBand) {
      if (cell.x < mid) leftInner = Math.max(leftInner, cell.x);
      else rightInner = Math.min(rightInner, cell.x);
    }
    if (cell.x < mid && cell.y <= leftMin + slop) {
      leftSum += cell.x;
      leftCount += 1;
    }
    if (cell.x >= mid && cell.y <= rightMin + slop) {
      rightSum += cell.x;
      rightCount += 1;
    }
  }

  const leftTipX = leftCount ? leftSum / leftCount : ink.x + ink.w * 0.28;
  const rightTipX = rightCount ? rightSum / rightCount : ink.x + ink.w * 0.72;
  const gapX =
    Number.isFinite(leftInner) && Number.isFinite(rightInner) && rightInner > leftInner
      ? (leftInner + rightInner) * 0.5
      : (leftTipX + rightTipX) * 0.5;
  const tipTop = Math.min(leftMin, rightMin);
  const blameY = (Number.isFinite(tipTop) ? tipTop : ink.y) + ink.h * (mobile ? 0.1 : 0.12);

  const edge = mobile ? 12 : 20;
  const dontPad = mobile ? 16 : 34;
  const usPad = mobile ? 12 : 22;
  return {
    dont: {
      x: Math.max(edge, ink.x - dontPad),
      y: ink.y + ink.h * (mobile ? 0.3 : 0.33),
    },
    blame: { x: gapX || mid, y: blameY },
    us: {
      x: Math.min(viewW - edge, ink.x + ink.w + usPad),
      y: ink.y + ink.h * (mobile ? 0.32 : 0.35),
    },
  };
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
  const voidRef = useRef<Dest>({ x: 0, y: 0, w: 0, h: 0 });
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const drawRef = useRef<(() => void) | null>(null);
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
      const heroNode = frame.closest('.campaign-hero');
      const phraseVisible =
        heroNode instanceof HTMLElement &&
        (heroNode.dataset.foundBlame === 'true' || !hasFinePointer() || prefersReducedMotion());

      const resolve = resolveRef.current;
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

      if (pointer.active) reveal(pointer.x, pointer.y, POINTER_REVEAL, 0.46);
      if (resolve.active) reveal(resolve.x, resolve.y, 42, 0.22);

      for (const cell of cellsRef.current) {
        const dx = pointer.active ? cell.x - pointer.x : 0;
        const dy = pointer.active ? cell.y - pointer.y : 0;
        const distance = pointer.active ? Math.hypot(dx, dy) : 999;
        const near = distance < POINTER_NEAR;
        const core = distance < POINTER_CORE;
        if (cell.hidden && !near) continue;
        if (core && cell.kind === 'field') continue;

        const shift = near ? (POINTER_NEAR - distance) / POINTER_NEAR : 0;
        const fade = core ? 0.18 : 1;
        const base = cell.kind === 'emblem' ? 0.22 + cell.lum * 0.55 : 0.08 + cell.lum * 0.16;
        const behind = phraseVisible && distanceToRect(cell.x, cell.y, voidRef.current) === 0;
        const thin = behind ? (cell.kind === 'field' ? 0 : 0.28) : 1;
        const alpha = Math.min(0.88, (base + shift * 0.16) * fade * thin);
        if (alpha < 0.05) continue;

        context.fillStyle = `rgba(240,240,237,${alpha})`;
        context.fillText(
          cell.glyph,
          cell.x + cell.ox + (near ? (dx / (distance || 1)) * shift * POINTER_SHIFT : 0),
          cell.y + cell.oy + (near ? (dy / (distance || 1)) * shift * POINTER_SHIFT : 0),
        );
      }
    };

    drawRef.current = draw;

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
          const x = (col + 0.5) * (width / fieldCols);
          const y = (row + 0.5) * (height / fieldRows);
          const distance = Math.hypot(x - cx, y - cy);
          if (distance < reach * 0.36 || distance > reach * 1.55) continue;
          const band =
            distance < reach * 0.62 ? (mobile ? 0.14 : 0.18) : distance < reach * 0.95 ? (mobile ? 0.08 : 0.11) : distance < reach * 1.25 ? (mobile ? 0.045 : 0.07) : mobile ? 0.025 : 0.04;
          if (hash(col, row) > band) continue;
          cells.push({
            x,
            y,
            lum: 0.2,
            glyph: pickFieldGlyph(col, row),
            kind: 'field',
            hidden: hash(col, row + 7) > 0.78,
            ox: 0,
            oy: 0,
          });
        }
      }

      destRef.current = centerCells(cells, dest, width, height, mobile);
      inkRef.current = inkBounds(cells);
      cellsRef.current = cells;
      layoutPhrase(width, mobile);
      scheduleDraw();
    };

    const layoutPhrase = (width: number, mobile: boolean) => {
      const hero = frame.closest('.campaign-hero');
      if (!(hero instanceof HTMLElement) || !inkRef.current.w) return;
      const anchors = phraseAnchors(cellsRef.current, inkRef.current, width, mobile);
      const dont = hero.querySelector('.campaign-phrase-dont');
      const blame = hero.querySelector('.campaign-phrase-blame');
      const us = hero.querySelector('.campaign-phrase-us');
      const place = (node: Element | null, point: { x: number; y: number }, origin: 'right' | 'center' | 'left') => {
        if (!(node instanceof HTMLElement)) return;
        const boxW = node.offsetWidth;
        const boxH = node.offsetHeight;
        const left = origin === 'right' ? point.x - boxW : origin === 'center' ? point.x - boxW * 0.5 : point.x;
        node.style.left = `${Math.max(8, Math.min(width - boxW - 8, left))}px`;
        node.style.top = `${point.y - boxH * 0.5}px`;
      };
      place(dont, anchors.dont, 'right');
      place(blame, anchors.blame, 'center');
      place(us, anchors.us, 'left');
      const frameBox = frame.getBoundingClientRect();
      voidRef.current = boxFromNode(blame, frameBox);
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

    const blameImage = frame.closest('.campaign-hero')?.querySelector('.campaign-phrase-blame img');
    const onBlameLoad = () => buildCells();
    blameImage?.addEventListener('load', onBlameLoad);

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

      const fieldCount = Math.max(1, Math.round(field.length * (0.14 + Math.random() * 0.1)));
      for (let i = 0; i < fieldCount; i += 1) {
        const cell = field[Math.floor(Math.random() * field.length)];
        if (!cell) continue;
        const roll = Math.random();
        if (roll < 0.4) cell.hidden = !cell.hidden;
        else cell.glyph = FIELD_GLYPHS[Math.floor(Math.random() * FIELD_GLYPHS.length)];
        cell.ox = (Math.random() - 0.5) * 4.2;
        cell.oy = (Math.random() - 0.5) * 4.2;
      }

      if (field.length && Math.random() < 0.3) {
        const seed = field[Math.floor(Math.random() * field.length)];
        for (const cell of field) {
          if (Math.hypot(cell.x - seed.x, cell.y - seed.y) > 52) continue;
          cell.hidden = Math.random() < 0.52;
          cell.ox = (Math.random() - 0.5) * 3.4;
          cell.oy = (Math.random() - 0.5) * 3.4;
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
      drawRef.current = null;
      observer.disconnect();
      blameImage?.removeEventListener('load', onBlameLoad);
      clearMutationTimer();
      if (drawFrame) window.cancelAnimationFrame(drawFrame);
    };
  }, []);

  useEffect(() => {
    const hero = frameRef.current?.closest('.campaign-hero');
    if (!hero || !(hero instanceof HTMLElement)) return;

    const found = readFound();
    const pending: { dont: number; blame: number; us: number } = { dont: 0, blame: 0, us: 0 };

    const applyFound = (next: PhraseFound) => {
      hero.dataset.foundDont = next.dont ? 'true' : 'false';
      hero.dataset.foundBlame = next.blame ? 'true' : 'false';
      hero.dataset.foundUs = next.us ? 'true' : 'false';
    };

    const discover = (key: keyof PhraseFound) => {
      if (found[key]) return;
      found[key] = true;
      writeFound(found);
      applyFound(found);
      if (key === 'us') {
        const us = hero.querySelector('.campaign-phrase-us');
        const bounds = frameRef.current?.getBoundingClientRect();
        if (us instanceof HTMLElement && bounds) {
          const box = us.getBoundingClientRect();
          resolveRef.current = {
            x: box.left - bounds.left + box.width * 0.5,
            y: box.top - bounds.top + box.height * 0.5,
            active: true,
          };
        }
      }
      drawRef.current?.();
    };

    if (prefersReducedMotion() || !hasFinePointer()) {
      found.dont = true;
      found.blame = true;
      found.us = true;
      applyFound(found);
    } else {
      applyFound(found);
    }

    const onMove = (event: Event) => {
      if (prefersReducedMotion() || !hasFinePointer()) return;
      const pointer = event as PointerEvent;
      const bounds = frameRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const x = pointer.clientX - bounds.left;
      const y = pointer.clientY - bounds.top;
      const nearEmblem = distanceToRect(x, y, inkRef.current) <= POINTER_ZONE;
      const nearDont = distanceToRect(x, y, boxFromNode(hero.querySelector('.campaign-phrase-dont'), bounds)) <= WORD_ZONE;
      const nearBlame = distanceToRect(x, y, boxFromNode(hero.querySelector('.campaign-phrase-blame'), bounds)) <= WORD_ZONE;
      const nearUs = distanceToRect(x, y, boxFromNode(hero.querySelector('.campaign-phrase-us'), bounds)) <= WORD_ZONE;
      const wasActive = pointerRef.current.active;
      pointerRef.current = { x, y, active: nearEmblem };

      if (nearDont && !found.dont && !pending.dont) {
        pending.dont = window.setTimeout(() => discover('dont'), FIND_DELAY) as unknown as number;
      } else if (!nearDont && pending.dont) {
        window.clearTimeout(pending.dont);
        pending.dont = 0;
      }
      if (nearBlame && !found.blame && !pending.blame) {
        pending.blame = window.setTimeout(() => discover('blame'), FIND_DELAY) as unknown as number;
      } else if (!nearBlame && pending.blame) {
        window.clearTimeout(pending.blame);
        pending.blame = 0;
      }
      if (nearUs && !found.us && !pending.us) {
        pending.us = window.setTimeout(() => discover('us'), FIND_DELAY) as unknown as number;
      } else if (!nearUs && pending.us) {
        window.clearTimeout(pending.us);
        pending.us = 0;
      }

      if (nearEmblem || wasActive) drawRef.current?.();
    };

    const onLeave = () => {
      const wasActive = pointerRef.current.active;
      pointerRef.current.active = false;
      window.clearTimeout(pending.dont);
      window.clearTimeout(pending.blame);
      window.clearTimeout(pending.us);
      pending.dont = 0;
      pending.blame = 0;
      pending.us = 0;
      if (wasActive) drawRef.current?.();
    };

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      window.clearTimeout(pending.dont);
      window.clearTimeout(pending.blame);
      window.clearTimeout(pending.us);
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
