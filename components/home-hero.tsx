'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const SCENES = [
  '/hero/carousel/hero-01.png',
  '/hero/carousel/hero-02.png',
  '/hero/carousel/hero-03.png',
  '/hero/carousel/hero-04.png',
  '/hero/carousel/hero-05.png',
] as const;

const SCENE_MS = 3600;
const HERO_LOGOS = [
  ['wordmark', '/brand/hael-wordmark.png', 632, 634],
  ['primary', '/brand/hael-primary.png', 624, 719],
  ['wordmark', '/brand/hael-wordmark.png', 632, 634],
  ['primary', '/brand/hael-primary.png', 624, 719],
  ['wordmark', '/brand/hael-wordmark.png', 632, 634],
  ['primary', '/brand/hael-primary.png', 624, 719],
] as const;

export function HomeHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [mountedScenes, setMountedScenes] = useState<ReadonlySet<number>>(
    () => new Set([0, 1]),
  );
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let scrollFrame = 0;
    let sceneTimer = 0;
    let cleanupTimer = 0;
    let scene = 0;
    let dragging = false;
    let dragOrigin = 0;
    let dragBase = 0;
    let dragX = 0;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const review =
      new URLSearchParams(window.location.search).get('hero-review') === '1';

    const reveal = () => {
      stage.dataset.ready = 'true';
    };
    const updateScroll = () => {
      scrollFrame = 0;
      const progress = Math.min(
        Math.max(window.scrollY / (window.innerHeight * 0.85), 0),
        1,
      );
      stage.style.setProperty('--hero-progress', progress.toFixed(3));
    };
    const onScroll = () => {
      if (!scrollFrame)
        scrollFrame = window.requestAnimationFrame(updateScroll);
    };
    const setScene = (next: number) => {
      scene = next;
      stage.dataset.scene = String(next);
      setActiveScene(next);
    };
    const cycle = () => {
      const previous = scene;
      const next = (scene + 1) % SCENES.length;
      const upcoming = (next + 1) % SCENES.length;
      setMountedScenes((current) => new Set([...current, next, upcoming]));
      setScene(next);
      if (cleanupTimer) window.clearTimeout(cleanupTimer);
      cleanupTimer = window.setTimeout(() => {
        setMountedScenes((current) => {
          const retained = new Set(current);
          retained.delete(previous);
          return retained;
        });
      }, 750);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const next = (scene - 1 + SCENES.length) % SCENES.length;
        setMountedScenes(
          (current) => new Set([...current, next, (next + 1) % SCENES.length]),
        );
        setScene(next);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const next = (scene + 1) % SCENES.length;
        setMountedScenes(
          (current) => new Set([...current, next, (next + 1) % SCENES.length]),
        );
        setScene(next);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if ((event.target as HTMLElement | null)?.closest?.('a, button')) return;
      dragging = true;
      dragOrigin = event.clientX;
      dragBase = dragX;
      stage.dataset.dragging = 'true';
      stage.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      dragX = dragBase + event.clientX - dragOrigin;
      stage.style.setProperty('--hero-drag-x', `${dragX.toFixed(2)}px`);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      stage.dataset.dragging = 'false';
      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
    };

    setReviewMode(review);
    setScene(0);
    updateScroll();
    window.addEventListener('hael-loader-complete', reveal);
    if (!document.documentElement.hasAttribute('data-hael-loader-active')) {
      window.queueMicrotask(reveal);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (!reduced && !review) {
      sceneTimer = window.setInterval(cycle, SCENE_MS);
      stage.addEventListener('pointerdown', onPointerDown);
      stage.addEventListener('pointermove', onPointerMove);
      stage.addEventListener('pointerup', onPointerUp);
      stage.addEventListener('pointercancel', onPointerUp);
    }
    if (review) window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('hael-loader-complete', reveal);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (sceneTimer) window.clearInterval(sceneTimer);
      if (cleanupTimer) window.clearTimeout(cleanupTimer);
    };
  }, []);

  return (
    <section className="home-hero" aria-labelledby="home-drop">
      <div
        ref={stageRef}
        className="hero-stage"
        data-ready="false"
        data-scene={activeScene}
        data-hero-review={reviewMode}
      >
        <div className="hero-scenes" aria-hidden="true">
          {SCENES.map((art, index) =>
            mountedScenes.has(index) ? (
              <div
                key={art}
                className="hero-scene hero-art-scene"
                data-active={activeScene === index}
              >
                <Image
                  src={art}
                  alt=""
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : 'eager'}
                  sizes="100vw"
                />
              </div>
            ) : null,
          )}
        </div>
        <div className="hero-logo-viewport" aria-hidden="true">
          <div className="hero-logo-track">
            {[0, 1].map((sequence) => (
              <div className="hero-logo-sequence" key={sequence}>
                {HERO_LOGOS.map(([variant, src, width, height], index) => (
                  <div
                    className={`hero-logo-item hero-logo-item-${variant}`}
                    key={`${sequence}-${index}`}
                  >
                    <Image
                      src={src}
                      alt=""
                      width={width}
                      height={height}
                      priority={sequence === 0}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="hero-utility">
          <div className="hero-index">
            <span>001 /</span>
            <h1 id="home-drop">Drop 001</h1>
            <span>/ 2026</span>
          </div>
          <Link className="hero-shop" href="/shop">
            <span>Shop the drop</span>
            <i aria-hidden="true">↘</i>
          </Link>
        </div>
        {reviewMode ? (
          <p className="hero-review-indicator" aria-live="polite">
            Art {String(activeScene + 1).padStart(2, '0')} / {SCENES.length}
          </p>
        ) : null}
      </div>
    </section>
  );
}
