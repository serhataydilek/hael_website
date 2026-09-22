'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { decideLoaderMode } from '@/lib/loader-session';

const LOADER_FRAMES = [
  '/animations/hael-loader/frame-00.webp',
  '/animations/hael-loader/frame-01.webp',
  '/animations/hael-loader/frame-02.webp',
  '/animations/hael-loader/frame-03.webp',
  '/animations/hael-loader/frame-04.webp',
  '/animations/hael-loader/frame-05.webp',
  '/animations/hael-loader/frame-06.webp',
] as const;
const FRAME_DURATION = 120;
const FRAME_COUNT = LOADER_FRAMES.length;
const FRAME_LAST = FRAME_COUNT - 1;
const TOTAL_DURATION = FRAME_DURATION * FRAME_COUNT;
const FADE_START = 720;

let loaderPlayedThisDocument = false;

function preloadLoaderFrames() {
  return Promise.all(
    LOADER_FRAMES.map((src) => {
      const image = new window.Image();
      image.src = src;
      if (image.decode) return image.decode();
      return new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(src));
      });
    }),
  );
}

function lockLoaderScroll() {
  const root = document.documentElement;
  root.dataset.haelLoaderMode = 'play';
  root.dataset.haelLoaderActive = 'true';
  root.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function unlockLoaderScroll() {
  const root = document.documentElement;
  root.removeAttribute('data-hael-loader-active');
  root.style.removeProperty('overflow');
  document.body.style.removeProperty('overflow');
}

export function OpeningScreen({ pathname }: { pathname: string }) {
  const [gone, setGone] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [clockReady, setClockReady] = useState(false);
  const resolved = useRef(false);
  const entryPathname = useRef(pathname);
  const finished = useRef(false);
  const rafRef = useRef(0);
  const startedAt = useRef(0);
  const frameIndexRef = useRef(0);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    loaderPlayedThisDocument = true;
    document.documentElement.dataset.haelLoaderMode = 'skip';
    unlockLoaderScroll();
    window.dispatchEvent(new Event('hael-loader-complete'));
    setGone(true);
  }, []);

  useLayoutEffect(() => {
    if (finished.current) return;
    if (resolved.current) {
      if (pathname !== entryPathname.current) finish();
      return;
    }
    resolved.current = true;

    if (loaderPlayedThisDocument || decideLoaderMode() === 'skip') {
      finish();
      return;
    }

    lockLoaderScroll();

    let cancelled = false;
    void preloadLoaderFrames()
      .then(() => {
        if (cancelled || finished.current) return;
        startedAt.current = performance.now();
        frameIndexRef.current = 0;
        setFrameIndex(0);
        setOpacity(1);
        setClockReady(true);
      })
      .catch(() => {
        if (!cancelled) finish();
      });

    return () => {
      cancelled = true;
    };
  }, [finish, pathname]);

  useEffect(() => {
    if (!clockReady) return;

    const tick = (now: number) => {
      if (finished.current) return;
      const elapsed = now - startedAt.current;
      const nextFrame = Math.min(
        Math.floor(elapsed / FRAME_DURATION),
        FRAME_LAST,
      );
      if (nextFrame !== frameIndexRef.current) {
        frameIndexRef.current = nextFrame;
        setFrameIndex(nextFrame);
      }
      setOpacity(
        elapsed < FADE_START
          ? 1
          : Math.max(0, 1 - (elapsed - FADE_START) / FRAME_DURATION),
      );
      if (elapsed >= TOTAL_DURATION) {
        finish();
        return;
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [clockReady, finish]);

  useEffect(
    () => () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      unlockLoaderScroll();
    },
    [],
  );

  if (gone) return null;

  return (
    <div className="opening-screen" aria-hidden="true" style={{ opacity }}>
      <Image
        className="opening-art"
        src={LOADER_FRAMES[frameIndex] ?? LOADER_FRAMES[0]}
        alt=""
        width={651}
        height={1560}
        priority
        unoptimized
        draggable={false}
      />
    </div>
  );
}
