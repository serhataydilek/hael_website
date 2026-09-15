'use client';

import Image from 'next/image';
import Link from 'next/link';
import { memo, useRef, type Ref } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CampaignMark } from '@/components/campaign-mark';
import { DecodedText } from '@/components/decoded-text';
import { DECODE_DURATION, hasFinePointer, prefersReducedMotion, whenHeroAvailable } from '@/lib/text-decode';
import { clearHeroRevealed, markHeroRevealed } from '@/lib/hero-reveal';
import {
  BRUSH_FEATHER,
  BRUSH_GAP,
  BRUSH_RADIUS,
  PHRASE_ART,
  REGION_THRESHOLD,
  STEM_ART,
  STEM_CENTER,
  WORDS,
  coverage,
  createLayer,
  loadPhraseImage,
  markCoverage,
  pointsAlong,
  sampleInk,
  stampBrush,
  type Samples,
  type Word,
} from '@/lib/phrase-brush';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type PhraseMode = 'discover' | 'focus' | 'gone';

const FOCUS_DURATION = 0.42;
const DISMISS_DURATION = 0.4;
const EMBLEM_FOCUS = 0.74;
const EMBLEM_BLUR = 3;

const ECHO_SHIFT: Record<Word, { x: number; y: number }> = {
  dont: { x: -5, y: 2 },
  blame: { x: 3, y: -4 },
  us: { x: 6, y: 2 },
};

const GHOST_SHIFT: Record<Word, { x: number; y: number }> = {
  dont: { x: 4, y: -6 },
  blame: { x: -7, y: 3 },
  us: { x: -3, y: 8 },
};

function PhraseSlices({ priority = false }: { priority?: boolean }) {
  return WORDS.map((word) => (
    <span key={word} className={`campaign-phrase-${word}`}>
      <Image
        src={PHRASE_ART.src}
        alt=""
        width={PHRASE_ART.width}
        height={PHRASE_ART.height}
        priority={priority}
        unoptimized
        className="campaign-phrase-art"
      />
    </span>
  ));
}

function plateWords(plate: Element | null) {
  return {
    dont: plate?.querySelector<HTMLElement>('.campaign-phrase-dont') ?? null,
    blame: plate?.querySelector<HTMLElement>('.campaign-phrase-blame') ?? null,
    us: plate?.querySelector<HTMLElement>('.campaign-phrase-us') ?? null,
  };
}

function StrokeCopy({ className, nodeRef }: { className: string; nodeRef?: Ref<HTMLSpanElement> }) {
  return (
    <span className={className} ref={nodeRef} aria-hidden="true">
      <Image src={STEM_ART.src} alt="" width={STEM_ART.width} height={STEM_ART.height} unoptimized className="campaign-b-stroke-art" />
    </span>
  );
}

export const CampaignHero = memo(function CampaignHero() {
  const rootRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const brushRef = useRef<HTMLCanvasElement>(null);
  const echoRef = useRef<HTMLSpanElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const dontRef = useRef<HTMLSpanElement>(null);
  const blameRef = useRef<HTMLSpanElement>(null);
  const usRef = useRef<HTMLSpanElement>(null);
  const strokeRef = useRef<HTMLSpanElement>(null);
  const strokeEchoRef = useRef<HTMLSpanElement>(null);
  const strokeGhostRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const safe = (fn: (event: Event) => void) => (contextSafe ? contextSafe(fn) : fn);
      const bind = (fn: () => void) => (contextSafe ? contextSafe(fn) : fn);
      const root = rootRef.current;
      const mark = markRef.current;
      const stage = stageRef.current;
      const brush = brushRef.current;
      const layers: Record<Word, HTMLElement | null> = {
        dont: dontRef.current,
        blame: blameRef.current,
        us: usRef.current,
      };
      const echo = plateWords(echoRef.current);
      const ghost = plateWords(ghostRef.current);
      const stroke = strokeRef.current;
      const strokeEcho = strokeEchoRef.current;
      const strokeGhost = strokeGhostRef.current;
      if (!root || !mark || !stage || !brush || !stroke || !strokeEcho || !strokeGhost) return;
      if (!layers.dont || !layers.blame || !layers.us) return;
      if (!echo.dont || !echo.blame || !echo.us || !ghost.dont || !ghost.blame || !ghost.us) return;

      const found: Record<Word, boolean> = { dont: false, blame: false, us: false };
      const mode = { current: 'discover' as PhraseMode };
      const reduced = prefersReducedMotion();
      const mobileAutoReveal = window.innerWidth < 700;
      const autoReveal = reduced || mobileAutoReveal || !hasFinePointer();
      const strokes = [stroke, strokeEcho, strokeGhost];
      let openingReady = false;
      let depthProgress = 0;
      let samples: Samples | null = null;
      let art: HTMLImageElement | null = null;
      let mask = createLayer(1, 1);
      let lastPoint: { x: number; y: number } | null = null;
      let moveRaf = 0;
      const queued: { x: number; y: number }[] = [];

      const layerList = () => WORDS.map((word) => layers[word] as HTMLElement);
      const depthList = () =>
        [echo.dont, echo.blame, echo.us, ghost.dont, ghost.blame, ghost.us].filter((node): node is HTMLElement => Boolean(node));

      const applyFound = () => {
        root.dataset.foundDont = found.dont ? 'true' : 'false';
        root.dataset.foundBlame = found.blame ? 'true' : 'false';
        root.dataset.foundUs = found.us ? 'true' : 'false';
      };

      const setMode = (next: PhraseMode) => {
        mode.current = next;
        root.dataset.phrase = next;
      };

      const paintBrush = () => {
        const ctx = brush.getContext('2d');
        if (!ctx || !art) return;
        const { width, height } = brush;
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(art, 0, 0, width, height);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(mask.canvas, 0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      };

      const sizeBrush = () => {
        const box = stage.getBoundingClientRect();
        const dpr = Math.min(1.5, window.devicePixelRatio || 1);
        const width = Math.max(1, Math.round(box.width * dpr));
        const height = Math.max(1, Math.round(box.height * dpr));
        if (brush.width !== width || brush.height !== height) {
          const prev = mask.canvas;
          brush.width = width;
          brush.height = height;
          mask = createLayer(width, height);
          if (prev.width > 1 && prev.height > 1) mask.ctx.drawImage(prev, 0, 0, width, height);
          paintBrush();
        }
      };

      const fillMask = () => {
        mask.ctx.fillStyle = '#fff';
        mask.ctx.fillRect(0, 0, mask.canvas.width, mask.canvas.height);
        paintBrush();
      };

      const layoutStroke = () => {
        const stageBox = stage.getBoundingClientRect();
        const manifesto = document.querySelector<HTMLElement>('.manifesto');
        const manifestoBox = manifesto?.getBoundingClientRect();
        const cta = document.querySelector<HTMLElement>('.manifesto-cta');
        const overlap = stageBox.height * (STEM_ART.overlap / PHRASE_ART.height);
        const mobile = window.innerWidth < 700;
        let target = stageBox.bottom + window.innerHeight * (mobile ? 0.36 : 0.88);
        if (manifestoBox) {
          if (cta) {
            const ctaBox = cta.getBoundingClientRect();
            target = ctaBox.top + (mobile ? 8 : Math.min(32, ctaBox.height * 0.45));
          } else {
            target = manifestoBox.top + manifestoBox.height * (mobile ? 0.72 : 0.9);
          }
        }
        const span = Math.max(160, target - (stageBox.bottom - overlap));
        const height = Math.round(span / 0.9);
        const px = `${height}px`;
        strokes.forEach((node) => {
          node.style.height = px;
        });
        if (manifesto && manifestoBox) {
          const padLeft = Number.parseFloat(getComputedStyle(manifesto).paddingLeft) || 0;
          const spine = stageBox.left + stageBox.width * STEM_CENTER - (manifestoBox.left + padLeft);
          manifesto.style.setProperty('--spine', `${Math.round(spine)}px`);
        }
      };

      const presentStroke = (animate: boolean) => {
        layoutStroke();
        if (!animate || reduced) {
          gsap.set(stroke, { autoAlpha: 1 });
          gsap.set([strokeEcho, strokeGhost], { autoAlpha: 0 });
          return;
        }
        gsap.to(stroke, { autoAlpha: 1, duration: FOCUS_DURATION, ease: 'power2.out', overwrite: 'auto' });
      };

      const resetDepth = () => {
        gsap.set(depthList(), { x: 0, y: 0, opacity: 0, filter: 'blur(0px)' });
        gsap.set(layerList(), { x: 0, y: 0, scale: 1 });
        gsap.set([strokeEcho, strokeGhost], { x: 0, y: 0, autoAlpha: 0, filter: 'blur(0px)' });
      };

      const applyDepth = (progress: number) => {
        depthProgress = progress;
        if (mode.current !== 'focus' || reduced) return;
        const p = progress;
        WORDS.forEach((word) => {
          const echoNode = echo[word];
          const ghostNode = ghost[word];
          if (!echoNode || !ghostNode) return;
          gsap.set(echoNode, {
            x: ECHO_SHIFT[word].x * p,
            y: ECHO_SHIFT[word].y * p,
            opacity: 0.08 + 0.22 * p,
            filter: `blur(${0.45 * p}px)`,
          });
          gsap.set(ghostNode, {
            x: GHOST_SHIFT[word].x * p,
            y: GHOST_SHIFT[word].y * p,
            opacity: 0.04 + 0.12 * p,
            filter: `blur(${0.9 * p}px)`,
          });
        });
        gsap.set(layerList(), { x: 0, y: 0, scale: 1 });
        gsap.set(stroke, { x: 0, y: 0 });
        gsap.set(strokeEcho, {
          x: 4 * p,
          y: -3 * p,
          autoAlpha: 0.1 + 0.28 * p,
          filter: `blur(${0.55 * p}px)`,
        });
        gsap.set(strokeGhost, {
          x: -6 * p,
          y: 4 * p,
          autoAlpha: 0.05 + 0.16 * p,
          filter: `blur(${1.1 * p}px)`,
        });
        gsap.set(mark, {
          autoAlpha: EMBLEM_FOCUS - 0.06 * p,
          filter: `blur(${Math.min(4, EMBLEM_BLUR + 0.5 * p)}px)`,
          overwrite: 'auto',
        });
      };

      const sharpEmblem = (duration: number) => {
        gsap.to(mark, {
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const enterFocus = (animate: boolean) => {
        if (mode.current === 'focus' || mode.current === 'gone') return;
        setMode('focus');
        markHeroRevealed();
        WORDS.forEach((word) => {
          found[word] = true;
        });
        applyFound();
        fillMask();

        if (!animate || reduced) {
          gsap.set(brush, { autoAlpha: 0 });
          gsap.set(layerList(), { autoAlpha: 1, x: 0, y: 0, scale: 1 });
          gsap.set(mark, { autoAlpha: reduced ? 1 : EMBLEM_FOCUS, filter: reduced ? 'blur(0px)' : `blur(${EMBLEM_BLUR}px)` });
          presentStroke(false);
          resetDepth();
          return;
        }

        gsap.to(brush, { autoAlpha: 0, duration: 0.28, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(layerList(), { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.28, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(mark, {
          autoAlpha: EMBLEM_FOCUS,
          filter: `blur(${EMBLEM_BLUR}px)`,
          duration: FOCUS_DURATION,
          ease: 'power2.out',
          overwrite: 'auto',
        });
        presentStroke(true);
        if (depthProgress > 0.001) applyDepth(depthProgress);
      };

      const checkRegions = () => {
        const ink = samples;
        if (!ink || mode.current !== 'discover') return;
        WORDS.forEach((word) => {
          if (!found[word] && coverage(ink, word) >= REGION_THRESHOLD) found[word] = true;
        });
        applyFound();
        if (found.dont && found.blame && found.us) enterFocus(true);
      };

      const stampAt = (clientX: number, clientY: number) => {
        if (!openingReady || mode.current !== 'discover' || autoReveal || !art) return;
        sizeBrush();
        const box = stage.getBoundingClientRect();
        const x = clientX - box.left;
        const y = clientY - box.top;
        const scaleX = brush.width / Math.max(1, box.width);
        const scaleY = brush.height / Math.max(1, box.height);
        const points = lastPoint ? pointsAlong(lastPoint.x, lastPoint.y, x, y, BRUSH_GAP) : [{ x, y }];
        lastPoint = { x, y };
        const radius = BRUSH_RADIUS * ((scaleX + scaleY) / 2);
        const feather = BRUSH_FEATHER * ((scaleX + scaleY) / 2);
        for (const point of points) {
          stampBrush(mask.ctx, point.x * scaleX, point.y * scaleY, radius, feather);
          if (samples) {
            markCoverage(
              samples,
              (point.x / box.width) * PHRASE_ART.width,
              (point.y / box.height) * PHRASE_ART.height,
              (BRUSH_RADIUS / box.width) * PHRASE_ART.width,
            );
          }
        }
        paintBrush();
        checkRegions();
      };

      const dismiss = () => {
        if (mode.current !== 'focus') return;
        setMode('gone');
        resetDepth();
        const duration = reduced ? 0.01 : DISMISS_DURATION;
        gsap.to(layerList(), {
          autoAlpha: 0,
          y: -8,
          scale: 0.985,
          duration,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
        gsap.to(strokes, { autoAlpha: 0, duration, ease: 'power2.inOut', overwrite: 'auto' });
        sharpEmblem(duration);
      };

      const startHero = () => {
        openingReady = true;
        root.dataset.decode = 'done';
        gsap.set(mark, { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)' });
        resetDepth();

        if (reduced) {
          enterFocus(false);
          return;
        }

        if (autoReveal) {
          setMode('focus');
          markHeroRevealed();
          WORDS.forEach((word) => {
            found[word] = true;
          });
          applyFound();
          fillMask();
          gsap.set(brush, { autoAlpha: 0 });
          gsap.fromTo(layerList(), { autoAlpha: 0, y: 8, x: 0 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' });
          gsap.to(mark, { autoAlpha: EMBLEM_FOCUS, filter: `blur(${EMBLEM_BLUR}px)`, duration: FOCUS_DURATION, ease: 'power2.out', overwrite: 'auto' });
          presentStroke(true);
          if (depthProgress > 0.001) applyDepth(depthProgress);
          return;
        }

        setMode('discover');
        applyFound();
        gsap.set(layerList(), { autoAlpha: 0, x: 0, y: 0 });
        gsap.set(brush, { autoAlpha: 1 });
        sizeBrush();
      };

      gsap.set(mark, { autoAlpha: 1, filter: 'blur(0px)' });
      gsap.set(layerList(), { autoAlpha: 0, x: 0, y: 0 });
      gsap.set(brush, { autoAlpha: 0 });
      gsap.set(strokes, { autoAlpha: 0 });
      layoutStroke();
      resetDepth();
      setMode('discover');
      applyFound();
      if (reduced) root.dataset.decode = 'done';

      const onPointerMove = safe((event: Event) => {
        if (!(event instanceof PointerEvent)) return;
        queued.push({ x: event.clientX, y: event.clientY });
        if (moveRaf) return;
        moveRaf = window.requestAnimationFrame(() => {
          moveRaf = 0;
          const batch = queued.splice(0);
          for (const point of batch) stampAt(point.x, point.y);
        });
      });

      const onPointerLeave = safe(() => {
        lastPoint = null;
      });

      const onPointerDown = safe((event: Event) => {
        if (mode.current !== 'focus') return;
        const target = event.target;
        if (!(target instanceof Node)) return;
        if (stage.contains(target)) return;
        dismiss();
      });

      root.addEventListener('pointermove', onPointerMove);
      root.addEventListener('pointerleave', onPointerLeave);
      document.addEventListener('pointerdown', onPointerDown);

      const trigger = reduced
        ? null
        : ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: () => `+=${Math.max(180, Math.round(window.innerHeight * 0.48))}`,
            onUpdate: (self) => applyDepth(self.progress),
          });

      const onResize = bind(() => {
        if (mode.current === 'discover') sizeBrush();
        layoutStroke();
        ScrollTrigger.refresh();
      });
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(stage);
      window.addEventListener('resize', onResize);

      let cancelled = false;
      loadPhraseImage()
        .then((image) => {
          if (cancelled) return;
          art = image;
          samples = sampleInk(image);
          sizeBrush();
        })
        .catch(() => undefined);

      const stopWaiting = whenHeroAvailable(bind(startHero));
      return () => {
        cancelled = true;
        clearHeroRevealed();
        stopWaiting();
        trigger?.kill();
        resizeObserver.disconnect();
        window.removeEventListener('resize', onResize);
        root.removeEventListener('pointermove', onPointerMove);
        root.removeEventListener('pointerleave', onPointerLeave);
        document.removeEventListener('pointerdown', onPointerDown);
        if (moveRaf) window.cancelAnimationFrame(moveRaf);
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="campaign-hero" aria-labelledby="campaign-title">
      <CampaignMark systemRef={markRef} />

      <h1 id="campaign-title" className="campaign-phrase" aria-label="dont blame us">
        <span className="campaign-phrase-stage" ref={stageRef} aria-hidden="true">
          <span className="campaign-phrase-plate campaign-phrase-plate-ghost" ref={ghostRef}>
            <PhraseSlices />
          </span>
          <span className="campaign-phrase-plate campaign-phrase-plate-echo" ref={echoRef}>
            <PhraseSlices />
          </span>
          <StrokeCopy className="campaign-b-stroke campaign-b-stroke-ghost" nodeRef={strokeGhostRef} />
          <StrokeCopy className="campaign-b-stroke campaign-b-stroke-echo" nodeRef={strokeEchoRef} />
          <StrokeCopy className="campaign-b-stroke" nodeRef={strokeRef} />
          <canvas className="campaign-phrase-brush" ref={brushRef} aria-hidden="true" />
          <span className="campaign-phrase-lockup">
            <span className="campaign-phrase-dont" ref={dontRef}>
              <Image src={PHRASE_ART.src} alt="" width={PHRASE_ART.width} height={PHRASE_ART.height} priority unoptimized className="campaign-phrase-art" />
            </span>
            <span className="campaign-phrase-blame" ref={blameRef}>
              <Image src={PHRASE_ART.src} alt="" width={PHRASE_ART.width} height={PHRASE_ART.height} priority unoptimized className="campaign-phrase-art" />
            </span>
            <span className="campaign-phrase-us" ref={usRef}>
              <Image src={PHRASE_ART.src} alt="" width={PHRASE_ART.width} height={PHRASE_ART.height} priority unoptimized className="campaign-phrase-art" />
            </span>
          </span>
        </span>
      </h1>

      <p className="campaign-control campaign-collection">
        <DecodedText text="COLLECTION / 001" trigger="hero" duration={DECODE_DURATION.ui} delay={0.16} />
      </p>
      <Link className="campaign-control campaign-enter" href="/shop" aria-label="Shop now">
        <DecodedText text="SHOP NOW" trigger="hero" duration={0.36} delay={0.24} hover accessible={false} /> <span className="campaign-enter-arrow" aria-hidden="true">→</span>
      </Link>
    </section>
  );
});
