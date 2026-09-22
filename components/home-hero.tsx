'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

const SCENES = [
  {
    src: '/hero/review/hero-art-01.webp',
    x: '58%',
    y: '10%',
    scale: 1.06,
    opacity: 0.45,
  },
  {
    src: '/hero/review/hero-art-02.webp',
    x: '68%',
    y: '12%',
    scale: 1.04,
    opacity: 0.42,
  },
  {
    src: '/hero/review/hero-art-03.webp',
    x: '64%',
    y: '10%',
    scale: 1.04,
    opacity: 0.42,
  },
  {
    src: '/hero/review/hero-art-04.webp',
    x: '60%',
    y: '8%',
    scale: 1.1,
    opacity: 0.44,
  },
  {
    src: '/hero/review/hero-art-05.webp',
    x: '70%',
    y: '10%',
    scale: 1.02,
    opacity: 0.4,
  },
  {
    src: '/hero/review/hero-art-06.webp',
    x: '68%',
    y: '10%',
    scale: 1.08,
    opacity: 0.4,
  },
  {
    src: '/hero/review/hero-art-07.webp',
    x: '62%',
    y: '10%',
    scale: 1.04,
    opacity: 0.38,
  },
  {
    src: '/hero/review/hero-art-08.webp',
    x: '68%',
    y: '10%',
    scale: 1.04,
    opacity: 0.4,
  },
  {
    src: '/hero/review/hero-art-09.webp',
    x: '64%',
    y: '8%',
    scale: 1.03,
    opacity: 0.4,
  },
  {
    src: '/hero/review/hero-art-10.webp',
    x: '70%',
    y: '10%',
    scale: 1.06,
    opacity: 0.42,
  },
  {
    src: '/hero/review/hero-art-11.webp',
    x: '64%',
    y: '10%',
    scale: 1.04,
    opacity: 0.38,
  },
  {
    src: '/hero/review/hero-art-12.webp',
    x: '62%',
    y: '10%',
    scale: 1.02,
    opacity: 0.38,
  },
  {
    src: '/hero/review/hero-art-13.webp',
    x: '66%',
    y: '10%',
    scale: 1.06,
    opacity: 0.4,
  },
  {
    src: '/hero/review/hero-art-14.webp',
    x: '64%',
    y: '10%',
    scale: 1.04,
    opacity: 0.38,
  },
  {
    src: '/hero/review/hero-art-15.webp',
    x: '68%',
    y: '8%',
    scale: 1.04,
    opacity: 0.38,
  },
] as const;

const SCENE_MS = 3600;

export function HomeHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let scrollFrame = 0;
    let sceneTimer = 0;
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
      setScene((scene + 1) % SCENES.length);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setScene((scene - 1 + SCENES.length) % SCENES.length);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setScene((scene + 1) % SCENES.length);
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
          {SCENES.map((art, index) => (
            <div
              key={art.src}
              className="hero-scene hero-art-scene"
              data-active={activeScene === index}
              style={
                {
                  '--hero-art-x': art.x,
                  '--hero-art-y': art.y,
                  '--hero-art-scale': art.scale,
                  '--hero-art-opacity': art.opacity,
                } as CSSProperties
              }
            >
              <Image
                src={art.src}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          ))}
          <div className="hero-scene-veil" />
        </div>
        <div className="hero-logo-viewport" aria-hidden="true">
          <div className="hero-logo-track">
            <div className="hero-logo-copy">
              <Image
                src="/brand/hael-monolith-wordmark-soft.png"
                alt=""
                fill
                priority
                sizes="110vw"
                unoptimized
                style={{ objectFit: 'contain', objectPosition: 'center 58%' }}
              />
            </div>
            <div className="hero-logo-copy">
              <Image
                src="/brand/hael-monolith-wordmark-soft.png"
                alt=""
                fill
                sizes="110vw"
                unoptimized
                style={{ objectFit: 'contain', objectPosition: 'center 58%' }}
              />
            </div>
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
