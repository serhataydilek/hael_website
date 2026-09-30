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

const LOADER_ASSET = '/animations/hael-loader/hael-loader-start.png';
const CYCLE_DURATION = 600;
const FADE_DURATION = 150;
const TOTAL_DURATION = CYCLE_DURATION + FADE_DURATION;
const FADE_START = CYCLE_DURATION;
const REDUCED_TOTAL_DURATION = 300;
const REDUCED_FADE_START = 150;

let loaderPlayedThisDocument = false;

function preloadLoaderAssets() {
  const image = new window.Image();
  image.src = LOADER_ASSET;
  if (image.decode) return image.decode();
  return new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(LOADER_ASSET));
  });
}

function lockLoaderScroll() {
  const root = document.documentElement;
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
  const [opacity, setOpacity] = useState(1);
  const [assetsReady, setAssetsReady] = useState(false);
  const resolved = useRef(false);
  const entryPathname = useRef(pathname);
  const finished = useRef(false);
  const rafRef = useRef(0);
  const startedAt = useRef(0);
  const totalDuration = useRef(TOTAL_DURATION);
  const fadeStart = useRef(FADE_START);

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

    const mode = decideLoaderMode();
    if (loaderPlayedThisDocument || mode === 'skip') {
      finish();
      return;
    }

    if (mode === 'reduce') {
      totalDuration.current = REDUCED_TOTAL_DURATION;
      fadeStart.current = REDUCED_FADE_START;
    }

    lockLoaderScroll();

    let cancelled = false;
    void preloadLoaderAssets()
      .then(() => {
        if (cancelled || finished.current) return;
        startedAt.current = performance.now();
        setOpacity(1);
        setAssetsReady(true);
      })
      .catch(() => {
        if (!cancelled) finish();
      });

    return () => {
      cancelled = true;
    };
  }, [finish, pathname]);

  useEffect(() => {
    if (!assetsReady) return;

    const tick = (now: number) => {
      if (finished.current) return;
      const elapsed = now - startedAt.current;
      setOpacity(
        elapsed < fadeStart.current
          ? 1
          : Math.max(
              0,
              1 -
                (elapsed - fadeStart.current) /
                  (totalDuration.current - fadeStart.current),
            ),
      );
      if (elapsed >= totalDuration.current) {
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
  }, [assetsReady, finish]);

  useEffect(
    () => () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      unlockLoaderScroll();
    },
    [],
  );

  if (gone) return null;

  return (
    <div
      className={`opening-screen${assetsReady ? ' is-ready' : ''}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <div className="opening-mark-shell">
        <Image
          className="opening-start-graphic"
          src={LOADER_ASSET}
          alt=""
          width={1500}
          height={1047}
          priority
          unoptimized
          draggable={false}
        />
      </div>
    </div>
  );
}
